import unittest
import json
from app import create_app
from models import db, User

class AgriRakshakTestCase(unittest.TestCase):
    def setUp(self):
        # Configure app for testing
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:' # in-memory db for testing
        self.client = self.app.test_client()
        
        with self.app.app_context():
            db.create_all()

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    def test_user_registration_and_login(self):
        # Test Registration
        register_payload = {
            'name': 'Ramesh Kumar',
            'mobile': '9876543210',
            'email': 'ramesh@example.com',
            'password': 'password123',
            'state': 'Maharashtra',
            'district': 'Pune',
            'language': 'mr',
            'role': 'Farmer'
        }
        res = self.client.post('/api/auth/register', 
                               data=json.dumps(register_payload),
                               content_type='application/json')
        self.assertEqual(res.status_code, 201)
        data = json.loads(res.data)
        self.assertIn('token', data)
        self.assertEqual(data['user']['name'], 'Ramesh Kumar')

        # Test Login
        login_payload = {
            'identifier': 'ramesh@example.com',
            'password': 'password123'
        }
        res = self.client.post('/api/auth/login', 
                               data=json.dumps(login_payload),
                               content_type='application/json')
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertIn('token', data)

    def test_weather_api(self):
        res = self.client.get('/api/weather?location=Pune')
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertEqual(data['location'], 'Pune')
        self.assertTrue(len(data['forecast']) > 0)

    def test_crop_recommendation(self):
        payload = {
            'soilType': 'Black',
            'state': 'Maharashtra',
            'season': 'Rabi',
            'waterAvailability': 'Medium'
        }
        res = self.client.post('/api/ai/recommend-crop', 
                               data=json.dumps(payload),
                               content_type='application/json')
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertTrue('crop' in data)
        self.assertTrue('profit_estimation' in data)

    def test_gov_schemes_seeding(self):
        res = self.client.get('/api/gov-schemes')
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertTrue(len(data) > 0)
        self.assertEqual(data[0]['title'], 'PM Kisan Samman Nidhi')

if __name__ == '__main__':
    unittest.main()
