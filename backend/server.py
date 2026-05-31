"""PS Shelf backend — FastAPI + MongoDB + IGDB proxy."""
from __future__ import annotations

import os
import logging
import uuid
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Optional, List, Literal

from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, status, Query
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, ConfigDict, EmailStr, field_validator
import bcrypt
import jwt

from igdb_client import get_igdb_client, PS_PLATFORM_IDS, normalize_game


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
JWT_SECRET = os.environ.get("JWT_SECRET", "dev-secret")
JWT_ALG = os.environ.get("JWT_ALGORITHM", "HS256")
JWT_EXPIRE = int(os.environ.get("JWT_EXPIRE_MINUTES", "10080"))

UPLOAD_DIR = ROOT_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)
(AVATARS := UPLOAD_DIR / "avatars").mkdir(exist_ok=True)

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="PS Shelf API")
api = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger("ps-shelf")


# ---------- Helpers ----------
def now() -> datetime:
    return datetime.now(timezone.utc)


def serialize_doc(doc: dict) -> dict:
    """Convert Mongo doc into JSON-safe dict (remove _id, convert datetimes)."""
    if not doc:
        return doc
    out = {}
    for k, v in doc.items():
        if k == "_id":
            continue
        if isinstance(v, datetime):
            out[k] = v.isoformat()
        else:
            out[k] = v
    return out


def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()


def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode(), hashed.encode())
    except Exception:
        return False


def create_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "iat": int(now().timestamp()),
        "exp": int((now() + timedelta(minutes=JWT_EXPIRE)).timestamp()),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


async def get_current_user(authorization: Optional[str] = None) -> dict:
    # Used as a dependency-style helper through wrapper below
    raise NotImplementedError


from fastapi import Header


async def current_user(authorization: Optional[str] = Header(default=None)) -> dict:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    uid = payload.get("sub")
    user = await db.users.find_one({"id": uid})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


async def optional_user(authorization: Optional[str] = Header(default=None)) -> Optional[dict]:
    if not authorization or not authorization.lower().startswith("bearer "):
        return None
    token = authorization.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
    except jwt.PyJWTError:
        return None
    uid = payload.get("sub")
    user = await db.users.find_one({"id": uid})
    return user


def user_public(user: dict) -> dict:
    if not user:
        return None
    return {
        "id": user["id"],
        "email": user.get("email"),
        "username": user.get("username"),
        "display_name": user.get("display_name"),
        "avatar_url": user.get("avatar_url"),
        "bio": user.get("bio"),
        "favourite_platform": user.get("favourite_platform", "PS5"),
        "total_games": user.get("total_games", 0),
        "privacy": user.get("privacy", {"public_collection": True, "public_wishlist": True, "show_stats": True}),
        "created_at": (user.get("created_at") or now()).isoformat() if isinstance(user.get("created_at"), datetime) else user.get("created_at"),
    }


# ---------- Models ----------
STATUS_VALUES = ("playing", "completed", "owned", "wishlist", "dropped")
PRIORITY_VALUES = ("low", "medium", "high")


class SignupBody(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    username: str = Field(min_length=3, max_length=30)
    display_name: str = Field(min_length=1, max_length=60)

    @field_validator("username")
    @classmethod
    def _u(cls, v: str) -> str:
        v = v.strip().lower()
        import re
        if not re.fullmatch(r"[a-z0-9_]+", v):
            raise ValueError("username may only contain a-z, 0-9, _")
        return v


class LoginBody(BaseModel):
    email: EmailStr
    password: str


class CollectionCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    igdb_game_id: int
    game_name: str
    game_cover_url: Optional[str] = None
    game_released: Optional[str] = None
    game_rating: Optional[float] = None
    platform: str
    status: Literal["playing", "completed", "owned", "wishlist", "dropped"]
    personal_rating: Optional[int] = Field(default=None, ge=1, le=10)
    notes: Optional[str] = None
    play_time_hours: Optional[int] = Field(default=0, ge=0)
    is_favourite: bool = False


class CollectionUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    platform: Optional[str] = None
    status: Optional[Literal["playing", "completed", "owned", "wishlist", "dropped"]] = None
    personal_rating: Optional[int] = Field(default=None, ge=1, le=10)
    notes: Optional[str] = None
    play_time_hours: Optional[int] = Field(default=None, ge=0)
    is_favourite: Optional[bool] = None


class WishlistCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    igdb_game_id: int
    game_name: str
    game_cover_url: Optional[str] = None
    game_released: Optional[str] = None
    platform: str
    priority: Literal["low", "medium", "high"] = "medium"
    notes: Optional[str] = None


class WishlistUpdate(BaseModel):
    priority: Optional[Literal["low", "medium", "high"]] = None
    notes: Optional[str] = None
    platform: Optional[str] = None


class ProfileUpdate(BaseModel):
    display_name: Optional[str] = Field(default=None, max_length=60)
    username: Optional[str] = Field(default=None, min_length=3, max_length=30)
    bio: Optional[str] = Field(default=None, max_length=500)
    favourite_platform: Optional[str] = None


class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(min_length=6, max_length=128)


class PrivacyUpdate(BaseModel):
    public_collection: Optional[bool] = None
    public_wishlist: Optional[bool] = None
    show_stats: Optional[bool] = None


# ---------- Auth routes ----------
@api.post("/auth/signup")
async def signup(body: SignupBody):
    if await db.users.find_one({"email": body.email.lower()}):
        raise HTTPException(status_code=400, detail="Email already registered")
    if await db.users.find_one({"username": body.username}):
        raise HTTPException(status_code=400, detail="Username already taken")
    uid = str(uuid.uuid4())
    doc = {
        "id": uid,
        "email": body.email.lower(),
        "username": body.username,
        "display_name": body.display_name,
        "password_hash": hash_password(body.password),
        "avatar_url": None,
        "bio": "",
        "favourite_platform": "PS5",
        "total_games": 0,
        "privacy": {"public_collection": True, "public_wishlist": True, "show_stats": True},
        "created_at": now(),
        "updated_at": now(),
    }
    await db.users.insert_one(doc)
    token = create_token(uid)
    return {"token": token, "user": user_public(doc)}


@api.post("/auth/login")
async def login(body: LoginBody):
    user = await db.users.find_one({"email": body.email.lower()})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_token(user["id"])
    return {"token": token, "user": user_public(user)}


@api.get("/auth/me")
async def me(user: dict = Depends(current_user)):
    return user_public(user)


@api.get("/auth/check-username")
async def check_username(u: str):
    u = u.strip().lower()
    exists = await db.users.find_one({"username": u})
    return {"available": not bool(exists)}


# ---------- IGDB proxy ----------
@api.get("/igdb/platforms")
async def igdb_platforms():
    return [{"id": pid, "name": name} for name, pid in PS_PLATFORM_IDS.items()]


@api.get("/igdb/search")
async def igdb_search(
    q: Optional[str] = "",
    platform: Optional[str] = None,  # e.g. "PS5" or comma list "PS4,PS5"
    sort: str = "relevance",
    page: int = 1,
    page_size: int = 24,
):
    igdb = get_igdb_client()
    platform_ids: Optional[List[int]] = None
    if platform and platform.lower() != "all":
        ids = []
        for p in platform.split(","):
            p = p.strip()
            if p in PS_PLATFORM_IDS:
                ids.append(PS_PLATFORM_IDS[p])
        if ids:
            platform_ids = ids
    try:
        results = await igdb.search_games(q or "", platform_ids=platform_ids, sort=sort, page=page, page_size=page_size)
    except Exception as e:
        logger.exception("IGDB search failed")
        raise HTTPException(status_code=502, detail=f"IGDB error: {e}")
    return {"results": results, "page": page, "page_size": page_size}


@api.get("/igdb/games/{game_id}")
async def igdb_game(game_id: int):
    igdb = get_igdb_client()
    try:
        g = await igdb.get_game(game_id)
    except Exception as e:
        logger.exception("IGDB detail failed")
        raise HTTPException(status_code=502, detail=f"IGDB error: {e}")
    if not g:
        raise HTTPException(status_code=404, detail="Game not found")
    return g


@api.get("/igdb/platform/{platform_name}")
async def igdb_platform_games(platform_name: str, sort: str = "rating", page: int = 1, page_size: int = 24):
    if platform_name not in PS_PLATFORM_IDS:
        raise HTTPException(status_code=400, detail="Unknown platform")
    igdb = get_igdb_client()
    pid = PS_PLATFORM_IDS[platform_name]
    try:
        results = await igdb.get_by_platform(pid, sort=sort, page=page, page_size=page_size)
    except Exception as e:
        logger.exception("IGDB platform failed")
        raise HTTPException(status_code=502, detail=f"IGDB error: {e}")
    return {"results": results, "platform": platform_name, "page": page}


# ---------- Collection ----------
async def recalc_total_games(user_id: str):
    cnt = await db.collection_entries.count_documents({"user_id": user_id})
    await db.users.update_one({"id": user_id}, {"$set": {"total_games": cnt, "updated_at": now()}})


@api.post("/collection")
async def add_collection(body: CollectionCreate, user: dict = Depends(current_user)):
    # Same game + same platform de-dupe
    existing = await db.collection_entries.find_one({
        "user_id": user["id"],
        "igdb_game_id": body.igdb_game_id,
        "platform": body.platform,
    })
    if existing:
        # Update
        upd = body.model_dump()
        upd["updated_at"] = now()
        if body.status == "completed" and not existing.get("date_completed"):
            upd["date_completed"] = now()
        await db.collection_entries.update_one({"id": existing["id"]}, {"$set": upd})
        doc = await db.collection_entries.find_one({"id": existing["id"]})
        return serialize_doc(doc)
    eid = str(uuid.uuid4())
    doc = body.model_dump()
    doc.update({
        "id": eid,
        "user_id": user["id"],
        "date_added": now(),
        "date_completed": now() if body.status == "completed" else None,
        "updated_at": now(),
    })
    await db.collection_entries.insert_one(doc)
    await recalc_total_games(user["id"])
    return serialize_doc(doc)


@api.get("/collection")
async def list_collection(
    status_filter: Optional[str] = None,
    user: dict = Depends(current_user),
):
    q = {"user_id": user["id"]}
    if status_filter and status_filter != "all":
        q["status"] = status_filter
    cursor = db.collection_entries.find(q).sort("date_added", -1)
    items = []
    async for d in cursor:
        items.append(serialize_doc(d))
    return items


@api.patch("/collection/{entry_id}")
async def update_collection(entry_id: str, body: CollectionUpdate, user: dict = Depends(current_user)):
    entry = await db.collection_entries.find_one({"id": entry_id, "user_id": user["id"]})
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    upd = {k: v for k, v in body.model_dump().items() if v is not None}
    upd["updated_at"] = now()
    if upd.get("status") == "completed" and not entry.get("date_completed"):
        upd["date_completed"] = now()
    await db.collection_entries.update_one({"id": entry_id}, {"$set": upd})
    doc = await db.collection_entries.find_one({"id": entry_id})
    return serialize_doc(doc)


@api.delete("/collection/{entry_id}")
async def delete_collection(entry_id: str, user: dict = Depends(current_user)):
    res = await db.collection_entries.delete_one({"id": entry_id, "user_id": user["id"]})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Entry not found")
    await recalc_total_games(user["id"])
    return {"ok": True}


@api.get("/collection/stats")
async def collection_stats(user: dict = Depends(current_user)):
    pipeline = [
        {"$match": {"user_id": user["id"]}},
        {"$group": {"_id": "$status", "count": {"$sum": 1}, "hours": {"$sum": "$play_time_hours"}}},
    ]
    by_status = {s: {"count": 0, "hours": 0} for s in STATUS_VALUES}
    total_hours = 0
    async for d in db.collection_entries.aggregate(pipeline):
        by_status[d["_id"]] = {"count": d["count"], "hours": d.get("hours", 0)}
        total_hours += d.get("hours", 0)
    total = sum(v["count"] for v in by_status.values())
    return {
        "total": total,
        "playing": by_status["playing"]["count"],
        "completed": by_status["completed"]["count"],
        "owned": by_status["owned"]["count"],
        "wishlist": by_status["wishlist"]["count"],
        "dropped": by_status["dropped"]["count"],
        "total_hours": total_hours,
    }


# ---------- Wishlist ----------
@api.post("/wishlist")
async def add_wishlist(body: WishlistCreate, user: dict = Depends(current_user)):
    # Allow duplicates? prevent same game+platform
    existing = await db.wishlist_entries.find_one({
        "user_id": user["id"],
        "igdb_game_id": body.igdb_game_id,
        "platform": body.platform,
    })
    if existing:
        upd = body.model_dump()
        await db.wishlist_entries.update_one({"id": existing["id"]}, {"$set": upd})
        doc = await db.wishlist_entries.find_one({"id": existing["id"]})
        return serialize_doc(doc)
    eid = str(uuid.uuid4())
    doc = body.model_dump()
    doc.update({"id": eid, "user_id": user["id"], "date_added": now()})
    await db.wishlist_entries.insert_one(doc)
    return serialize_doc(doc)


@api.get("/wishlist")
async def list_wishlist(priority: Optional[str] = None, user: dict = Depends(current_user)):
    q = {"user_id": user["id"]}
    if priority and priority != "all":
        q["priority"] = priority
    cursor = db.wishlist_entries.find(q).sort("date_added", -1)
    items = []
    async for d in cursor:
        items.append(serialize_doc(d))
    return items


@api.patch("/wishlist/{entry_id}")
async def update_wishlist(entry_id: str, body: WishlistUpdate, user: dict = Depends(current_user)):
    entry = await db.wishlist_entries.find_one({"id": entry_id, "user_id": user["id"]})
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    upd = {k: v for k, v in body.model_dump().items() if v is not None}
    await db.wishlist_entries.update_one({"id": entry_id}, {"$set": upd})
    doc = await db.wishlist_entries.find_one({"id": entry_id})
    return serialize_doc(doc)


@api.delete("/wishlist/{entry_id}")
async def delete_wishlist(entry_id: str, user: dict = Depends(current_user)):
    res = await db.wishlist_entries.delete_one({"id": entry_id, "user_id": user["id"]})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Entry not found")
    return {"ok": True}


@api.post("/wishlist/{entry_id}/move-to-collection")
async def move_wishlist_to_collection(entry_id: str, status: str = "owned", user: dict = Depends(current_user)):
    if status not in STATUS_VALUES:
        raise HTTPException(status_code=400, detail="Invalid status")
    entry = await db.wishlist_entries.find_one({"id": entry_id, "user_id": user["id"]})
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    # Create collection entry
    cdoc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "igdb_game_id": entry["igdb_game_id"],
        "game_name": entry["game_name"],
        "game_cover_url": entry.get("game_cover_url"),
        "game_released": entry.get("game_released"),
        "game_rating": None,
        "platform": entry["platform"],
        "status": status,
        "personal_rating": None,
        "notes": entry.get("notes", ""),
        "play_time_hours": 0,
        "is_favourite": False,
        "date_added": now(),
        "date_completed": now() if status == "completed" else None,
        "updated_at": now(),
    }
    # Check de-dupe
    existing = await db.collection_entries.find_one({"user_id": user["id"], "igdb_game_id": cdoc["igdb_game_id"], "platform": cdoc["platform"]})
    if not existing:
        await db.collection_entries.insert_one(cdoc)
    await db.wishlist_entries.delete_one({"id": entry_id})
    await recalc_total_games(user["id"])
    return {"ok": True}


# ---------- Profile / Settings ----------
@api.patch("/profile")
async def update_profile(body: ProfileUpdate, user: dict = Depends(current_user)):
    upd = {k: v for k, v in body.model_dump().items() if v is not None}
    if "username" in upd:
        u2 = upd["username"].strip().lower()
        import re
        if not re.fullmatch(r"[a-z0-9_]+", u2):
            raise HTTPException(status_code=400, detail="Invalid username")
        if u2 != user["username"]:
            ex = await db.users.find_one({"username": u2})
            if ex:
                raise HTTPException(status_code=400, detail="Username taken")
        upd["username"] = u2
    upd["updated_at"] = now()
    await db.users.update_one({"id": user["id"]}, {"$set": upd})
    user2 = await db.users.find_one({"id": user["id"]})
    return user_public(user2)


@api.patch("/profile/privacy")
async def update_privacy(body: PrivacyUpdate, user: dict = Depends(current_user)):
    privacy = user.get("privacy", {"public_collection": True, "public_wishlist": True, "show_stats": True})
    for k, v in body.model_dump().items():
        if v is not None:
            privacy[k] = v
    await db.users.update_one({"id": user["id"]}, {"$set": {"privacy": privacy, "updated_at": now()}})
    return privacy


@api.post("/profile/password")
async def change_password(body: PasswordChange, user: dict = Depends(current_user)):
    if not verify_password(body.current_password, user["password_hash"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    await db.users.update_one({"id": user["id"]}, {"$set": {"password_hash": hash_password(body.new_password), "updated_at": now()}})
    return {"ok": True}


@api.post("/profile/avatar")
async def upload_avatar(file: UploadFile = File(...), user: dict = Depends(current_user)):
    ext = (file.filename or "").split(".")[-1].lower() if file.filename and "." in file.filename else "png"
    if ext not in ("png", "jpg", "jpeg", "webp", "gif"):
        raise HTTPException(status_code=400, detail="Unsupported image type")
    fname = f"{user['id']}-{int(now().timestamp())}.{ext}"
    fpath = AVATARS / fname
    contents = await file.read()
    if len(contents) > 5_000_000:
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")
    with open(fpath, "wb") as f:
        f.write(contents)
    rel = f"/api/uploads/avatars/{fname}"
    await db.users.update_one({"id": user["id"]}, {"$set": {"avatar_url": rel, "updated_at": now()}})
    return {"avatar_url": rel}


@api.delete("/profile/data")
async def delete_all_data(user: dict = Depends(current_user)):
    await db.collection_entries.delete_many({"user_id": user["id"]})
    await db.wishlist_entries.delete_many({"user_id": user["id"]})
    await db.users.update_one({"id": user["id"]}, {"$set": {"total_games": 0}})
    return {"ok": True}


@api.delete("/profile")
async def delete_account(user: dict = Depends(current_user)):
    await db.collection_entries.delete_many({"user_id": user["id"]})
    await db.wishlist_entries.delete_many({"user_id": user["id"]})
    await db.users.delete_one({"id": user["id"]})
    return {"ok": True}


# ---------- Public profiles & explore ----------
@api.get("/users/{username}")
async def public_profile(username: str, viewer: Optional[dict] = Depends(optional_user)):
    user = await db.users.find_one({"username": username.lower()})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    privacy = user.get("privacy", {"public_collection": True, "public_wishlist": True, "show_stats": True})
    is_self = viewer and viewer["id"] == user["id"]
    profile = user_public(user)
    # Collection
    collection = []
    if is_self or privacy.get("public_collection", True):
        async for d in db.collection_entries.find({"user_id": user["id"]}).sort("date_added", -1):
            collection.append(serialize_doc(d))
    # Wishlist
    wishlist = []
    if is_self or privacy.get("public_wishlist", True):
        async for d in db.wishlist_entries.find({"user_id": user["id"]}).sort("date_added", -1):
            wishlist.append(serialize_doc(d))
    # Stats
    stats = None
    if is_self or privacy.get("show_stats", True):
        # platform breakdown
        platforms = {}
        genres_count = {}
        monthly = {}
        status_count = {s: 0 for s in STATUS_VALUES}
        for c in collection:
            platforms[c["platform"]] = platforms.get(c["platform"], 0) + 1
            status_count[c["status"]] = status_count.get(c["status"], 0) + 1
            da = c.get("date_added")
            if da:
                month = da[:7]
                monthly[month] = monthly.get(month, 0) + 1
        stats = {
            "platforms": [{"name": k, "count": v} for k, v in sorted(platforms.items(), key=lambda x: -x[1])],
            "status": [{"name": k, "count": v} for k, v in status_count.items()],
            "monthly": sorted([{"month": k, "count": v} for k, v in monthly.items()], key=lambda x: x["month"]),
            "genres": [],  # populated below
        }
    return {
        "profile": profile,
        "privacy": privacy,
        "is_self": bool(is_self),
        "collection": collection,
        "wishlist": wishlist,
        "stats": stats,
    }


@api.get("/explore")
async def explore(q: Optional[str] = "", limit: int = 24):
    query = {}
    if q:
        query = {"$or": [
            {"username": {"$regex": q.lower(), "$options": "i"}},
            {"display_name": {"$regex": q, "$options": "i"}},
        ]}
    cursor = db.users.find(query).sort("total_games", -1).limit(limit)
    collectors = []
    async for u in cursor:
        if not u.get("privacy", {}).get("public_collection", True):
            # Skip if private
            pass
        # Compute completion rate
        completed = await db.collection_entries.count_documents({"user_id": u["id"], "status": "completed"})
        total = u.get("total_games", 0)
        rate = round((completed / total * 100), 0) if total else 0
        collectors.append({
            "username": u["username"],
            "display_name": u.get("display_name"),
            "avatar_url": u.get("avatar_url"),
            "total_games": total,
            "completed": completed,
            "favourite_platform": u.get("favourite_platform", "PS5"),
            "completion_rate": rate,
        })
    # Trending: most-added games last 30 days
    from datetime import timedelta
    since = now() - timedelta(days=30)
    trending_pipeline = [
        {"$match": {"date_added": {"$gte": since}}},
        {"$group": {"_id": {"igdb_game_id": "$igdb_game_id", "name": "$game_name", "cover": "$game_cover_url"}, "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10},
    ]
    trending = []
    async for d in db.collection_entries.aggregate(trending_pipeline):
        trending.append({
            "igdb_game_id": d["_id"]["igdb_game_id"],
            "name": d["_id"]["name"],
            "cover_url": d["_id"]["cover"],
            "adds": d["count"],
        })
    return {"collectors": collectors, "trending": trending}


# ---------- Uploads (avatars) ----------
@api.get("/uploads/avatars/{fname}")
async def serve_avatar(fname: str):
    p = AVATARS / fname
    if not p.exists():
        raise HTTPException(status_code=404, detail="Not found")
    return FileResponse(p)


# ---------- Misc ----------
@api.get("/")
async def root():
    return {"app": "PS Shelf", "status": "ok"}


@api.get("/health")
async def health():
    return {"ok": True}


app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    # Ensure indexes
    await db.users.create_index("email", unique=True)
    await db.users.create_index("username", unique=True)
    await db.users.create_index("id", unique=True)
    await db.collection_entries.create_index([("user_id", 1), ("igdb_game_id", 1), ("platform", 1)], unique=True)
    await db.collection_entries.create_index("id", unique=True)
    await db.wishlist_entries.create_index([("user_id", 1), ("igdb_game_id", 1), ("platform", 1)], unique=True)
    await db.wishlist_entries.create_index("id", unique=True)
    logger.info("PS Shelf API started, db=%s", DB_NAME)


@app.on_event("shutdown")
async def shutdown():
    client.close()
