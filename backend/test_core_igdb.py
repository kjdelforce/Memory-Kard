"""POC test script — validates IGDB integration end-to-end in isolation.

Run with:  python /app/backend/test_core_igdb.py
"""
import asyncio
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")

from igdb_client import IGDBClient, PS_PLATFORM_IDS, PS_PLATFORM_ALL


async def test_token():
    print("\n--- TEST 1: Twitch OAuth token ---")
    client = IGDBClient()
    token = await client.get_token()
    assert token and len(token) > 20, f"Bad token: {token}"
    # Calling again should reuse
    token2 = await client.get_token()
    assert token == token2, "Token not cached"
    print(f"OK token={token[:8]}...{token[-4:]} cached_exp={int(client._token_exp)}")
    return client


async def test_search(client: IGDBClient):
    print("\n--- TEST 2: Search 'God of War' on PlayStation platforms ---")
    results = await client.search_games("God of War", page=1, page_size=10)
    assert results, "No search results"
    print(f"Got {len(results)} results")
    for g in results[:5]:
        platforms = ", ".join(p["name"] for p in g["platforms"]) or "no PS platform"
        print(f"  • {g['name']} ({g.get('release_year')}) [{platforms}] cover={'yes' if g['cover_url'] else 'no'}")
    # At least one result should have a cover URL & a PS platform
    with_cover = [g for g in results if g["cover_url"]]
    with_ps = [g for g in results if g["platforms"]]
    assert with_cover, "No results have a cover"
    assert with_ps, "No results have a PS platform"
    return results


async def test_game_detail(client: IGDBClient, game_id: int):
    print(f"\n--- TEST 3: Get full game detail for id={game_id} ---")
    g = await client.get_game(game_id)
    assert g, f"No game found for {game_id}"
    print(f"  name={g['name']}")
    print(f"  cover_url={g['cover_url']}")
    print(f"  rating={g.get('rating')}")
    print(f"  release={g.get('release_date')}")
    print(f"  platforms={[p['name'] for p in g['platforms']]}")
    print(f"  genres={g.get('genres')}")
    print(f"  developers={g.get('developers')}")
    print(f"  publishers={g.get('publishers')}")
    print(f"  screenshots={len(g.get('screenshots', []))}")
    print(f"  similar_games={len(g.get('similar_games', []))}")
    assert g["cover_url"], "No cover URL"
    assert g["name"], "No name"
    return g


async def test_browse_by_platform(client: IGDBClient):
    print("\n--- TEST 4: Browse top games per PS platform ---")
    for name, pid in PS_PLATFORM_IDS.items():
        results = await client.get_by_platform(pid, page=1, page_size=5)
        print(f"  {name} (id={pid}): {len(results)} games — top: {results[0]['name'] if results else 'NONE'}")
        assert results, f"No games for platform {name}({pid})"
    print("OK all 7 PS platforms returned games")


async def test_url_shape():
    print("\n--- TEST 5: Verify cover/screenshot URL shape ---")
    from igdb_client import cover_url, screenshot_url
    cu = cover_url("abc123", "cover_big")
    su = screenshot_url("xyz789", "screenshot_huge")
    print(f"  cover_url={cu}")
    print(f"  screenshot_url={su}")
    assert cu == "https://images.igdb.com/igdb/image/upload/t_cover_big/abc123.jpg"
    assert su == "https://images.igdb.com/igdb/image/upload/t_screenshot_huge/xyz789.jpg"
    print("OK URL shape correct")


async def main():
    try:
        client = await test_token()
        results = await test_search(client)
        first_game_id = results[0]["id"]
        await test_game_detail(client, first_game_id)
        await test_browse_by_platform(client)
        await test_url_shape()
        print("\n=================================")
        print(" ALL POC TESTS PASSED ✔")
        print("=================================")
        return 0
    except Exception as e:
        print(f"\n!!! POC FAILED: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
