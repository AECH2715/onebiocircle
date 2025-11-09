import requests
import sys
import json
from datetime import datetime

class OneBioCircleAPITester:
    def __init__(self, base_url="https://vital-companion.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        # Store test user credentials
        self.timestamp = datetime.now().strftime('%H%M%S')
        self.test_email = f"test{self.timestamp}@example.com"
        self.test_password = "TestPass123!"

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            
            if success:
                self.log_test(name, True)
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                self.log_test(name, False, f"Expected {expected_status}, got {response.status_code}")
                return False, {}

        except Exception as e:
            self.log_test(name, False, f"Error: {str(e)}")
            return False, {}

    def test_user_registration(self):
        """Test user registration"""
        test_user = {
            "name": f"Test User {self.timestamp}",
            "email": self.test_email,
            "password": self.test_password,
            "age": 30,
            "gender": "Male",
            "timezone": "UTC"
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=test_user
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_id = response['user']['id']
            return True
        return False

    def test_user_login(self):
        """Test user login with existing credentials"""
        # Use the same credentials as registration
        login_data = {
            "email": self.test_email,
            "password": self.test_password
        }
        
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        return success

    def test_get_user_profile(self):
        """Test getting user profile"""
        success, _ = self.run_test(
            "Get User Profile",
            "GET",
            "auth/me",
            200
        )
        return success

    def test_update_user_profile(self):
        """Test updating user profile"""
        update_data = {
            "name": "Updated Test User",
            "age": 31
        }
        
        success, _ = self.run_test(
            "Update User Profile",
            "PUT",
            "auth/me",
            200,
            data=update_data
        )
        return success

    def test_dashboard_stats(self):
        """Test dashboard stats endpoint"""
        success, _ = self.run_test(
            "Dashboard Stats",
            "GET",
            "dashboard/stats",
            200
        )
        return success

    def test_medication_crud(self):
        """Test medication CRUD operations"""
        # Create medication
        med_data = {
            "name": "Test Medication",
            "dose": "500mg",
            "frequency": "Twice daily",
            "times": "8:00 AM, 8:00 PM",
            "notes": "Take with food",
            "next_dose": "Today 8:00 PM",
            "reminder_enabled": True
        }
        
        success, response = self.run_test(
            "Create Medication",
            "POST",
            "medications",
            200,
            data=med_data
        )
        
        if not success:
            return False
        
        med_id = response.get('id')
        if not med_id:
            self.log_test("Create Medication - Get ID", False, "No medication ID returned")
            return False

        # Get medications
        success, _ = self.run_test(
            "Get Medications",
            "GET",
            "medications",
            200
        )
        
        if not success:
            return False

        # Update medication
        update_data = {
            "name": "Updated Test Medication",
            "dose": "750mg",
            "frequency": "Once daily",
            "times": "8:00 AM",
            "notes": "Updated notes",
            "reminder_enabled": False
        }
        
        success, _ = self.run_test(
            "Update Medication",
            "PUT",
            f"medications/{med_id}",
            200,
            data=update_data
        )
        
        if not success:
            return False

        # Delete medication
        success, _ = self.run_test(
            "Delete Medication",
            "DELETE",
            f"medications/{med_id}",
            200
        )
        
        return success

    def test_meal_crud(self):
        """Test meal CRUD operations"""
        # Create meal
        meal_data = {
            "name": "Test Meal",
            "calories": 450,
            "image_url": "https://example.com/meal.jpg"
        }
        
        success, response = self.run_test(
            "Create Meal",
            "POST",
            "meals",
            200,
            data=meal_data
        )
        
        if not success:
            return False
        
        meal_id = response.get('id')
        if not meal_id:
            self.log_test("Create Meal - Get ID", False, "No meal ID returned")
            return False

        # Get meals
        success, _ = self.run_test(
            "Get Meals",
            "GET",
            "meals",
            200
        )
        
        if not success:
            return False

        # Delete meal
        success, _ = self.run_test(
            "Delete Meal",
            "DELETE",
            f"meals/{meal_id}",
            200
        )
        
        return success

    def test_workout_crud(self):
        """Test workout CRUD operations"""
        # Create workout
        workout_data = {
            "day": "Mon",
            "exercises": [
                {
                    "name": "Push-ups",
                    "sets": "3",
                    "reps": "15",
                    "instructions": "Keep your back straight",
                    "difficulty": "Medium"
                }
            ]
        }
        
        success, response = self.run_test(
            "Create Workout",
            "POST",
            "workouts",
            200,
            data=workout_data
        )
        
        if not success:
            return False

        # Get workouts
        success, _ = self.run_test(
            "Get Workouts",
            "GET",
            "workouts",
            200
        )
        
        if not success:
            return False

        # Get workout by day
        success, _ = self.run_test(
            "Get Workout by Day",
            "GET",
            "workouts/Mon",
            200
        )
        
        return success

    def test_trip_crud(self):
        """Test trip CRUD operations"""
        # Create trip
        trip_data = {
            "destination": "Paris, France",
            "start_date": "2024-12-01",
            "end_date": "2024-12-07",
            "timezone": "Europe/Paris"
        }
        
        success, response = self.run_test(
            "Create Trip",
            "POST",
            "trips",
            200,
            data=trip_data
        )
        
        if not success:
            return False
        
        trip_id = response.get('id')
        if not trip_id:
            self.log_test("Create Trip - Get ID", False, "No trip ID returned")
            return False

        # Get trips
        success, _ = self.run_test(
            "Get Trips",
            "GET",
            "trips",
            200
        )
        
        if not success:
            return False

        # Delete trip
        success, _ = self.run_test(
            "Delete Trip",
            "DELETE",
            f"trips/{trip_id}",
            200
        )
        
        return success

    def test_notification_system(self):
        """Test notification system"""
        # Get notification preferences
        success, _ = self.run_test(
            "Get Notification Preferences",
            "GET",
            "notifications/preferences",
            200
        )
        
        if not success:
            return False

        # Update notification preferences
        prefs_data = {
            "medication_reminders": True,
            "daily_tips": False,
            "travel_alerts": True
        }
        
        success, _ = self.run_test(
            "Update Notification Preferences",
            "PUT",
            "notifications/preferences",
            200,
            data=prefs_data
        )
        
        if not success:
            return False

        # Send test notification
        success, _ = self.run_test(
            "Send Test Notification",
            "POST",
            "notifications/test",
            200
        )
        
        if not success:
            return False

        # Get notifications
        success, _ = self.run_test(
            "Get Notifications",
            "GET",
            "notifications",
            200
        )
        
        return success

    def test_consultation_workflow(self):
        """Test tele-consultation workflow"""
        # Create consultation
        consultation_data = {
            "symptom": "headache",
            "duration": "3-7days",
            "severity": "moderate",
            "conditions": ["None"],
            "medications_list": "Ibuprofen as needed",
            "allergies": "None"
        }
        
        success, response = self.run_test(
            "Create Consultation",
            "POST",
            "consultations",
            200,
            data=consultation_data
        )
        
        if not success:
            return False
        
        consultation_id = response.get('id')
        if not consultation_id:
            self.log_test("Create Consultation - Get ID", False, "No consultation ID returned")
            return False

        # Get consultations
        success, _ = self.run_test(
            "Get Consultations",
            "GET",
            "consultations",
            200
        )
        
        if not success:
            return False

        # Update prescription
        prescription_data = {
            "diagnosis": "Tension Headache",
            "prescription": [
                {"name": "Ibuprofen 400mg", "dosage": "Twice daily", "duration": "7 days"}
            ],
            "advice": "Rest well and stay hydrated"
        }
        
        success, _ = self.run_test(
            "Update Prescription",
            "PUT",
            f"consultations/{consultation_id}/prescription",
            200,
            data=prescription_data
        )
        
        return success

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting OneBioCircle API Tests...")
        print(f"Testing against: {self.base_url}")
        print("=" * 50)

        # Authentication tests
        if not self.test_user_registration():
            print("❌ Registration failed, stopping tests")
            return False

        if not self.test_user_login():
            print("❌ Login failed, stopping tests")
            return False

        if not self.test_get_user_profile():
            print("❌ Get profile failed")

        if not self.test_update_user_profile():
            print("❌ Update profile failed")

        # Dashboard tests
        if not self.test_dashboard_stats():
            print("❌ Dashboard stats failed")

        # Feature tests
        if not self.test_medication_crud():
            print("❌ Medication CRUD failed")

        if not self.test_meal_crud():
            print("❌ Meal CRUD failed")

        if not self.test_workout_crud():
            print("❌ Workout CRUD failed")

        if not self.test_trip_crud():
            print("❌ Trip CRUD failed")

        if not self.test_notification_system():
            print("❌ Notification system failed")

        if not self.test_consultation_workflow():
            print("❌ Consultation workflow failed")

        # Print results
        print("=" * 50)
        print(f"📊 Tests completed: {self.tests_passed}/{self.tests_run} passed")
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"📈 Success rate: {success_rate:.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    tester = OneBioCircleAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump({
            'timestamp': datetime.now().isoformat(),
            'total_tests': tester.tests_run,
            'passed_tests': tester.tests_passed,
            'success_rate': (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0,
            'test_results': tester.test_results
        }, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())