"""IGDB API client using Twitch OAuth (Client Credentials flow).

Caches the access token in memory and auto-refreshes it on expiry or 401.
"""
from __future__ import annotations

import os
import time
import asyncio
import logging
from typing import Any, Optional

import httpx

logger = logging.getLogger(__name__)

TWITCH_TOKEN_URL = "https://id.twitch.tv/oauth2/token"
IGDB_BASE_URL = "https://api.igdb.com/v4"

# PlayStation platform IDs in IGDB
PS_PLATFORM_IDS = {
    "PS1": 7,
    "PS2": 8,
    "PS3": 9,
    "PS4": 48,
    "PS5": 167,
    "PSP": 38,
    "PS Vita": 46,
}
PS_PLATFORM_ALL = list(PS_PLATFORM_IDS.values())
PS_PLATFORM_BY_ID = {v: k for k, v in PS_PLATFORM_IDS.items()}


class IGDBClient:
    """Async IGDB client with token caching."""

    def __init__(self, client_id: Optional[str] = None, client_secret: Optional[str] = None):
        self.client_id = client_id or os.environ.get("TWITCH_CLIENT_ID")
        self.client_secret = client_secret or os.environ.get("TWITCH_CLIENT_SECRET")
        if not self.client_id or not self.client_secret:
            raise RuntimeError(
                "TWITCH_CLIENT_ID / TWITCH_CLIENT_SECRET not configured"
            )
        self._token: Optional[str] = None
        self._token_exp: float = 0.0
        self._lock = asyncio.Lock()

    async def _fetch_token(self) -> str:
        """Fetch a fresh app access token from Twitch."""
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                TWITCH_TOKEN_URL,
                params={
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "grant_type": "client_credentials",
                },
            )
            resp.raise_for_status()
            data = resp.json()
        token = data["access_token"]
        expires_in = int(data.get("expires_in", 3600))
        # Refresh 5 minutes before actual expiry
        self._token = token
        self._token_exp = time.time() + expires_in - 300
        logger.info("Fetched new Twitch token, expires in %ss", expires_in)
        return token

    async def get_token(self) -> str:
        async with self._lock:
            if not self._token or time.time() >= self._token_exp:
                await self._fetch_token()
            assert self._token is not None
            return self._token

    async def _headers(self) -> dict[str, str]:
        token = await self.get_token()
        return {
            "Client-ID": self.client_id,
            "Authorization": f"Bearer {token}",
            "Accept": "application/json",
        }

    async def post(self, endpoint: str, body: str) -> Any:
        """POST a query to an IGDB endpoint (e.g. 'games', 'screenshots').

        Body is the raw IGDB Apicalypse query string.
        Retries once on 401 by refreshing the token.
        """
        url = f"{IGDB_BASE_URL}/{endpoint.strip('/')}"
        for attempt in range(2):
            headers = await self._headers()
            async with httpx.AsyncClient(timeout=20) as client:
                resp = await client.post(url, content=body, headers=headers)
            if resp.status_code == 401 and attempt == 0:
                logger.warning("IGDB 401 – refreshing token and retrying")
                self._token = None
                continue
            if resp.status_code >= 400:
                logger.error("IGDB error %s: %s", resp.status_code, resp.text[:500])
                resp.raise_for_status()
            return resp.json()
        return []

    # -------- High-level helpers --------

    async def search_games(
        self,
        query: str,
        platform_ids: Optional[list[int]] = None,
        sort: str = "relevance",
        page: int = 1,
        page_size: int = 24,
    ) -> list[dict]:
        platforms = platform_ids or PS_PLATFORM_ALL
        offset = max(0, (page - 1)) * page_size
        platforms_csv = ",".join(str(p) for p in platforms)
        fields = (
            "id,name,slug,first_release_date,rating,total_rating,"
            "cover.image_id,platforms,platforms.id,platforms.name,"
            "genres.name,summary,screenshots.image_id"
        )
        # Build the query
        # Use IGDB search for relevance, else where + sort
        if query:
            q = (
                f'search "{escape_quotes(query)}";\n'
                f"fields {fields};\n"
                f"where platforms = ({platforms_csv}) & version_parent = null;\n"
                f"limit {page_size};\n"
                f"offset {offset};"
            )
        else:
            sort_clause = {
                "rating": "sort total_rating desc;",
                "release": "sort first_release_date desc;",
                "relevance": "sort total_rating desc;",
            }.get(sort, "sort total_rating desc;")
            q = (
                f"fields {fields};\n"
                f"where platforms = ({platforms_csv}) & version_parent = null"
                f" & total_rating != null & cover != null;\n"
                f"{sort_clause}\n"
                f"limit {page_size};\n"
                f"offset {offset};"
            )
        data = await self.post("games", q)
        return [normalize_game(g) for g in data]

    async def get_game(self, game_id: int) -> Optional[dict]:
        fields = (
            "id,name,slug,first_release_date,rating,total_rating,total_rating_count,"
            "cover.image_id,cover.url,platforms.id,platforms.name,"
            "genres.name,summary,storyline,"
            "screenshots.image_id,videos.video_id,"
            "involved_companies.company.name,involved_companies.developer,involved_companies.publisher,"
            "similar_games.id,similar_games.name,similar_games.cover.image_id,similar_games.first_release_date,"
            "websites.url,websites.category"
        )
        q = f"fields {fields};\nwhere id = {int(game_id)};\nlimit 1;"
        data = await self.post("games", q)
        if not data:
            return None
        return normalize_game(data[0], full=True)

    async def get_by_platform(
        self,
        platform_id: int,
        sort: str = "rating",
        page: int = 1,
        page_size: int = 24,
    ) -> list[dict]:
        offset = (page - 1) * page_size
        fields = (
            "id,name,slug,first_release_date,rating,total_rating,"
            "cover.image_id,platforms.id,platforms.name,genres.name,summary"
        )
        sort_clause = {
            "rating": "sort total_rating desc;",
            "release": "sort first_release_date desc;",
        }.get(sort, "sort total_rating desc;")
        q = (
            f"fields {fields};\n"
            f"where platforms = ({platform_id}) & total_rating != null"
            f" & total_rating_count >= 10"
            f" & cover != null & version_parent = null;\n"
            f"{sort_clause}\n"
            f"limit {page_size};\n"
            f"offset {offset};"
        )
        data = await self.post("games", q)
        return [normalize_game(g) for g in data]


def escape_quotes(s: str) -> str:
    return s.replace('"', '\\"')


def cover_url(image_id: Optional[str], size: str = "cover_big") -> Optional[str]:
    if not image_id:
        return None
    return f"https://images.igdb.com/igdb/image/upload/t_{size}/{image_id}.jpg"


def screenshot_url(image_id: Optional[str], size: str = "screenshot_huge") -> Optional[str]:
    if not image_id:
        return None
    return f"https://images.igdb.com/igdb/image/upload/t_{size}/{image_id}.jpg"


def normalize_game(g: dict, full: bool = False) -> dict:
    """Normalize a raw IGDB game object into a frontend-friendly shape."""
    cover_img = (g.get("cover") or {}).get("image_id") if isinstance(g.get("cover"), dict) else None
    platforms = g.get("platforms") or []
    # Filter to PS platforms only
    ps_platforms = []
    for p in platforms:
        if isinstance(p, dict):
            pid = p.get("id")
            if pid in PS_PLATFORM_BY_ID:
                ps_platforms.append({
                    "id": pid,
                    "name": PS_PLATFORM_BY_ID[pid],
                    "full_name": p.get("name"),
                })
    genres = [genre.get("name") for genre in (g.get("genres") or []) if isinstance(genre, dict) and genre.get("name")]
    release_ts = g.get("first_release_date")
    release_year = None
    release_date_iso = None
    if release_ts:
        import datetime
        dt = datetime.datetime.fromtimestamp(release_ts, tz=datetime.timezone.utc)
        release_year = dt.year
        release_date_iso = dt.date().isoformat()

    out = {
        "id": g.get("id"),
        "name": g.get("name"),
        "slug": g.get("slug"),
        "summary": g.get("summary"),
        "cover_url": cover_url(cover_img, "cover_big"),
        "cover_url_large": cover_url(cover_img, "1080p"),
        "rating": round(g.get("total_rating") or g.get("rating") or 0, 1) or None,
        "release_year": release_year,
        "release_date": release_date_iso,
        "platforms": ps_platforms,
        "genres": genres,
    }

    if full:
        # Screenshots
        screenshots = []
        for s in (g.get("screenshots") or []):
            if isinstance(s, dict) and s.get("image_id"):
                screenshots.append(screenshot_url(s["image_id"], "screenshot_huge"))
        out["screenshots"] = screenshots
        # Companies
        developers = []
        publishers = []
        for ic in (g.get("involved_companies") or []):
            if not isinstance(ic, dict):
                continue
            comp = (ic.get("company") or {}).get("name")
            if not comp:
                continue
            if ic.get("developer"):
                developers.append(comp)
            if ic.get("publisher"):
                publishers.append(comp)
        out["developers"] = list(dict.fromkeys(developers))
        out["publishers"] = list(dict.fromkeys(publishers))
        out["storyline"] = g.get("storyline")
        # Similar games
        similar = []
        for sg in (g.get("similar_games") or []):
            if not isinstance(sg, dict):
                continue
            sg_cover = (sg.get("cover") or {}).get("image_id") if isinstance(sg.get("cover"), dict) else None
            sg_ts = sg.get("first_release_date")
            sg_year = None
            if sg_ts:
                import datetime
                sg_year = datetime.datetime.fromtimestamp(sg_ts, tz=datetime.timezone.utc).year
            similar.append({
                "id": sg.get("id"),
                "name": sg.get("name"),
                "cover_url": cover_url(sg_cover, "cover_big"),
                "release_year": sg_year,
            })
        out["similar_games"] = similar
    return out


# Global singleton
_client: Optional[IGDBClient] = None


def get_igdb_client() -> IGDBClient:
    global _client
    if _client is None:
        _client = IGDBClient()
    return _client
