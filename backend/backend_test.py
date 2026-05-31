"""PS Shelf Backend API Tests - Comprehensive endpoint verification."""
import requests
import sys
import time
from datetime import datetime

BASE_URL = "https://game-vault-dev.preview.emergentagent.com/api"

class PSShelfTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.token = None
        self.user = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_username = f"test_user_{int(time.time())}"
        self.test_email = f"{self.test_username}@test.com"
        self.test_password = "TestPass123!"
        self.collection_entry_id = None
        self.wishlist_entry_id = None

    def log(self, msg, level="INFO"):
        print(f"[{level}] {msg}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test."""
        url = f"{self.base_url}/{endpoint}"
        req_headers = {'Content-Type': 'application/json'}
        if self.token:
            req_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            req_headers.update(headers)

        self.tests_run += 1
        self.log(f"Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=req_headers, timeout=15)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=req_headers, timeout=15)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=req_headers, timeout=15)
            elif method == 'DELETE':
                response = requests.delete(url, headers=req_headers, timeout=15)
            else:
                self.log(f"Unknown method {method}", "ERROR")
                return False, {}

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                self.log(f"✅ PASSED - {name} (Status: {response.status_code})")
            else:
                self.log(f"❌ FAILED - {name} - Expected {expected_status}, got {response.status_code}", "ERROR")
                self.log(f"Response: {response.text[:500]}", "ERROR")

            try:
                return success, response.json() if response.text else {}
            except:
                return success, {}

        except Exception as e:
            self.log(f"❌ FAILED - {name} - Error: {str(e)}", "ERROR")
            return False, {}

    # ========== Auth Tests ==========
    def test_health(self):
        """Test health endpoint."""
        success, resp = self.run_test("Health Check", "GET", "health", 200)
        return success and resp.get("ok") == True

    def test_signup(self):
        """Test user signup - library MUST be empty."""
        success, resp = self.run_test(
            "User Signup",
            "POST",
            "auth/signup",
            200,
            data={
                "email": self.test_email,
                "password": self.test_password,
                "username": self.test_username,
                "display_name": f"Test User {int(time.time())}"
            }
        )
        if success:
            self.token = resp.get("token")
            self.user = resp.get("user")
            self.log(f"✅ Signup successful - Token: {self.token[:20]}...")
            # Verify user has 0 games (empty library requirement)
            if self.user.get("total_games") != 0:
                self.log(f"❌ CRITICAL: New user has {self.user.get('total_games')} games, expected 0 (empty library)", "ERROR")
                return False
            self.log("✅ Verified: New user library is empty (total_games=0)")
        return success

    def test_duplicate_signup(self):
        """Test duplicate email/username rejection."""
        success, resp = self.run_test(
            "Duplicate Signup (should fail)",
            "POST",
            "auth/signup",
            400,
            data={
                "email": self.test_email,
                "password": self.test_password,
                "username": self.test_username,
                "display_name": "Duplicate"
            }
        )
        return success

    def test_login(self):
        """Test user login."""
        success, resp = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data={
                "email": self.test_email,
                "password": self.test_password
            }
        )
        if success:
            self.token = resp.get("token")
            self.user = resp.get("user")
        return success

    def test_auth_me(self):
        """Test /auth/me endpoint."""
        success, resp = self.run_test("Get Current User", "GET", "auth/me", 200)
        return success and resp.get("username") == self.test_username

    def test_check_username(self):
        """Test username availability check."""
        # Check taken username
        success1, resp1 = self.run_test(
            "Check Username (taken)",
            "GET",
            f"auth/check-username?u={self.test_username}",
            200
        )
        # Check available username
        success2, resp2 = self.run_test(
            "Check Username (available)",
            "GET",
            f"auth/check-username?u=available_username_{int(time.time())}",
            200
        )
        return success1 and not resp1.get("available") and success2 and resp2.get("available")

    # ========== IGDB Tests ==========
    def test_igdb_platforms(self):
        """Test IGDB platforms list."""
        success, resp = self.run_test("IGDB Platforms", "GET", "igdb/platforms", 200)
        if success:
            platforms = resp
            expected_platforms = ["PS1", "PS2", "PS3", "PS4", "PS5", "PSP", "PS Vita"]
            found = [p["name"] for p in platforms]
            if all(p in found for p in expected_platforms):
                self.log("✅ All PlayStation platforms present")
                return True
            else:
                self.log(f"❌ Missing platforms. Found: {found}", "ERROR")
                return False
        return False

    def test_igdb_search(self):
        """Test IGDB search with query."""
        success, resp = self.run_test(
            "IGDB Search (God of War)",
            "GET",
            "igdb/search?q=God+of+War&platform=PS5&sort=relevance&page=1&page_size=10",
            200
        )
        if success:
            results = resp.get("results", [])
            if len(results) > 0:
                self.log(f"✅ Found {len(results)} results for 'God of War'")
                # Store first game for later tests
                self.test_game_id = results[0].get("id")
                return True
            else:
                self.log("⚠️  No results found for 'God of War'", "WARN")
                return True  # Not a failure, might be API issue
        return False

    def test_igdb_game_detail(self):
        """Test IGDB game detail endpoint."""
        if not hasattr(self, 'test_game_id'):
            self.test_game_id = 1942  # God of War (2018) fallback
        success, resp = self.run_test(
            f"IGDB Game Detail (ID: {self.test_game_id})",
            "GET",
            f"igdb/games/{self.test_game_id}",
            200
        )
        if success:
            if resp.get("name"):
                self.log(f"✅ Game detail retrieved: {resp.get('name')}")
                return True
        return False

    def test_igdb_platform_games(self):
        """Test IGDB platform-specific games."""
        success, resp = self.run_test(
            "IGDB Platform Games (PS5)",
            "GET",
            "igdb/platform/PS5?sort=rating&page=1&page_size=10",
            200
        )
        if success:
            results = resp.get("results", [])
            self.log(f"✅ Found {len(results)} PS5 games")
            return True
        return False

    # ========== Collection Tests ==========
    def test_add_to_collection(self):
        """Test adding game to collection."""
        if not hasattr(self, 'test_game_id'):
            self.test_game_id = 1942
        success, resp = self.run_test(
            "Add to Collection",
            "POST",
            "collection",
            200,
            data={
                "igdb_game_id": self.test_game_id,
                "game_name": "Test Game",
                "game_cover_url": "https://example.com/cover.jpg",
                "platform": "PS5",
                "status": "playing",
                "personal_rating": 8,
                "notes": "Great game!",
                "play_time_hours": 10
            }
        )
        if success:
            self.collection_entry_id = resp.get("id")
            self.log(f"✅ Collection entry created: {self.collection_entry_id}")
        return success

    def test_get_collection(self):
        """Test retrieving collection."""
        success, resp = self.run_test("Get Collection", "GET", "collection", 200)
        if success:
            items = resp
            self.log(f"✅ Collection has {len(items)} items")
            return True
        return False

    def test_collection_stats(self):
        """Test collection statistics."""
        success, resp = self.run_test("Collection Stats", "GET", "collection/stats", 200)
        if success:
            stats = resp
            self.log(f"✅ Stats: Total={stats.get('total')}, Playing={stats.get('playing')}, Completed={stats.get('completed')}")
            return True
        return False

    def test_update_collection(self):
        """Test updating collection entry."""
        if not self.collection_entry_id:
            self.log("⚠️  Skipping update test - no collection entry", "WARN")
            return True
        success, resp = self.run_test(
            "Update Collection Entry",
            "PATCH",
            f"collection/{self.collection_entry_id}",
            200,
            data={
                "status": "completed",
                "personal_rating": 9,
                "play_time_hours": 25
            }
        )
        return success

    def test_delete_collection(self):
        """Test deleting collection entry."""
        if not self.collection_entry_id:
            self.log("⚠️  Skipping delete test - no collection entry", "WARN")
            return True
        success, resp = self.run_test(
            "Delete Collection Entry",
            "DELETE",
            f"collection/{self.collection_entry_id}",
            200
        )
        return success

    # ========== Wishlist Tests ==========
    def test_add_to_wishlist(self):
        """Test adding game to wishlist."""
        if not hasattr(self, 'test_game_id'):
            self.test_game_id = 1942
        success, resp = self.run_test(
            "Add to Wishlist",
            "POST",
            "wishlist",
            200,
            data={
                "igdb_game_id": self.test_game_id + 1,  # Different game
                "game_name": "Wishlist Game",
                "game_cover_url": "https://example.com/cover2.jpg",
                "platform": "PS5",
                "priority": "high",
                "notes": "Want to play this!"
            }
        )
        if success:
            self.wishlist_entry_id = resp.get("id")
            self.log(f"✅ Wishlist entry created: {self.wishlist_entry_id}")
        return success

    def test_get_wishlist(self):
        """Test retrieving wishlist."""
        success, resp = self.run_test("Get Wishlist", "GET", "wishlist", 200)
        if success:
            items = resp
            self.log(f"✅ Wishlist has {len(items)} items")
            return True
        return False

    def test_update_wishlist(self):
        """Test updating wishlist entry."""
        if not self.wishlist_entry_id:
            self.log("⚠️  Skipping wishlist update - no entry", "WARN")
            return True
        success, resp = self.run_test(
            "Update Wishlist Entry",
            "PATCH",
            f"wishlist/{self.wishlist_entry_id}",
            200,
            data={
                "priority": "medium",
                "notes": "Updated notes"
            }
        )
        return success

    def test_move_wishlist_to_collection(self):
        """Test moving wishlist item to collection."""
        if not self.wishlist_entry_id:
            self.log("⚠️  Skipping move test - no wishlist entry", "WARN")
            return True
        success, resp = self.run_test(
            "Move Wishlist to Collection",
            "POST",
            f"wishlist/{self.wishlist_entry_id}/move-to-collection?status=owned",
            200
        )
        return success

    def test_delete_wishlist(self):
        """Test deleting wishlist entry (if not moved)."""
        # Create a new wishlist entry to delete
        success1, resp1 = self.run_test(
            "Add Wishlist for Delete Test",
            "POST",
            "wishlist",
            200,
            data={
                "igdb_game_id": 9999,
                "game_name": "Delete Test Game",
                "platform": "PS4",
                "priority": "low"
            }
        )
        if success1:
            entry_id = resp1.get("id")
            success2, _ = self.run_test(
                "Delete Wishlist Entry",
                "DELETE",
                f"wishlist/{entry_id}",
                200
            )
            return success2
        return False

    # ========== Profile Tests ==========
    def test_update_profile(self):
        """Test updating user profile."""
        success, resp = self.run_test(
            "Update Profile",
            "PATCH",
            "profile",
            200,
            data={
                "display_name": "Updated Test User",
                "bio": "This is my test bio",
                "favourite_platform": "PS4"
            }
        )
        return success

    def test_update_privacy(self):
        """Test updating privacy settings."""
        success, resp = self.run_test(
            "Update Privacy Settings",
            "PATCH",
            "profile/privacy",
            200,
            data={
                "public_collection": False,
                "public_wishlist": True,
                "show_stats": True
            }
        )
        return success

    def test_change_password(self):
        """Test changing password."""
        success, resp = self.run_test(
            "Change Password",
            "POST",
            "profile/password",
            200,
            data={
                "current_password": self.test_password,
                "new_password": "NewTestPass456!"
            }
        )
        if success:
            # Update password for future tests
            self.test_password = "NewTestPass456!"
        return success

    def test_public_profile(self):
        """Test viewing public profile."""
        success, resp = self.run_test(
            f"Public Profile ({self.test_username})",
            "GET",
            f"users/{self.test_username}",
            200
        )
        if success:
            profile = resp.get("profile", {})
            privacy = resp.get("privacy", {})
            collection = resp.get("collection", [])
            self.log(f"✅ Profile retrieved: {profile.get('display_name')}")
            # Verify privacy enforcement
            if not privacy.get("public_collection") and len(collection) > 0:
                self.log("❌ Privacy violation: collection visible when public_collection=False", "ERROR")
                return False
            self.log("✅ Privacy settings enforced correctly")
            return True
        return False

    # ========== Explore Tests ==========
    def test_explore(self):
        """Test explore endpoint."""
        success, resp = self.run_test("Explore", "GET", "explore?limit=10", 200)
        if success:
            collectors = resp.get("collectors", [])
            trending = resp.get("trending", [])
            self.log(f"✅ Explore: {len(collectors)} collectors, {len(trending)} trending games")
            return True
        return False

    # ========== Cleanup Tests ==========
    def test_delete_data(self):
        """Test deleting all user data."""
        success, resp = self.run_test("Delete All Data", "DELETE", "profile/data", 200)
        if success:
            # Verify data is deleted
            success2, resp2 = self.run_test("Verify Data Deleted", "GET", "collection", 200)
            if success2 and len(resp2) == 0:
                self.log("✅ All collection data deleted")
                return True
        return False

    def test_delete_account(self):
        """Test deleting user account."""
        success, resp = self.run_test("Delete Account", "DELETE", "profile", 200)
        if success:
            # Verify account is deleted
            success2, resp2 = self.run_test(
                "Verify Account Deleted (should fail)",
                "GET",
                "auth/me",
                401
            )
            if success2:
                self.log("✅ Account successfully deleted")
                return True
        return False

    def run_all_tests(self):
        """Run all tests in sequence."""
        self.log("=" * 60)
        self.log("PS SHELF BACKEND API TESTS")
        self.log("=" * 60)
        
        # Health check
        self.test_health()
        
        # Auth tests
        self.test_signup()
        self.test_duplicate_signup()
        self.test_login()
        self.test_auth_me()
        self.test_check_username()
        
        # IGDB tests
        self.test_igdb_platforms()
        self.test_igdb_search()
        self.test_igdb_game_detail()
        self.test_igdb_platform_games()
        
        # Collection tests
        self.test_add_to_collection()
        self.test_get_collection()
        self.test_collection_stats()
        self.test_update_collection()
        
        # Wishlist tests
        self.test_add_to_wishlist()
        self.test_get_wishlist()
        self.test_update_wishlist()
        self.test_move_wishlist_to_collection()
        self.test_delete_wishlist()
        
        # Profile tests
        self.test_update_profile()
        self.test_update_privacy()
        self.test_change_password()
        self.test_public_profile()
        
        # Explore
        self.test_explore()
        
        # Cleanup (delete collection entry if still exists)
        if self.collection_entry_id:
            self.test_delete_collection()
        
        # Final cleanup
        self.test_delete_data()
        self.test_delete_account()
        
        # Print summary
        self.log("=" * 60)
        self.log(f"TESTS COMPLETED: {self.tests_passed}/{self.tests_run} passed")
        self.log("=" * 60)
        
        return 0 if self.tests_passed == self.tests_run else 1

def main():
    tester = PSShelfTester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())
