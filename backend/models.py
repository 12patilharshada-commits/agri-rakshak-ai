from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    mobile = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    state = db.Column(db.String(100), nullable=False)
    district = db.Column(db.String(100), nullable=False)
    language_preference = db.Column(db.String(20), default='en') # en, hi, mr
    role = db.Column(db.String(20), default='Farmer') # Farmer, Officer, Admin
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'mobile': self.mobile,
            'email': self.email,
            'state': self.state,
            'district': self.district,
            'language_preference': self.language_preference,
            'role': self.role,
            'created_at': self.created_at.isoformat()
        }

class Farm(db.Model):
    __tablename__ = 'farms'
    
    id = db.Column(db.Integer, primary_key=True)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    size = db.Column(db.Float, nullable=False) # in acres
    location = db.Column(db.String(255), nullable=False) # e.g. "Latitude, Longitude"
    soil_type = db.Column(db.String(100), nullable=False) # e.g. "Black Soil", "Sandy", etc.
    water_availability = db.Column(db.String(100), nullable=False) # e.g. "Canal", "Borewell", "Rainfed"
    health_score = db.Column(db.Integer, default=85) # 0-100
    ndvi_data = db.Column(db.Text, nullable=True) # JSON string of NDVI history
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    owner = db.relationship('User', backref=db.backref('farms', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'owner_id': self.owner_id,
            'size': self.size,
            'location': self.location,
            'soil_type': self.soil_type,
            'water_availability': self.water_availability,
            'health_score': self.health_score,
            'ndvi_data': self.ndvi_data,
            'created_at': self.created_at.isoformat()
        }

class Crop(db.Model):
    __tablename__ = 'crops'
    
    id = db.Column(db.Integer, primary_key=True)
    farm_id = db.Column(db.Integer, db.ForeignKey('farms.id'), nullable=False)
    crop_name = db.Column(db.String(100), nullable=False)
    expected_yield = db.Column(db.Float, nullable=True) # in tonnes/acre
    sowing_date = db.Column(db.Date, nullable=False)
    harvest_date = db.Column(db.Date, nullable=True)
    status = db.Column(db.String(50), default='Growing') # Growing, Harvested
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    farm = db.relationship('Farm', backref=db.backref('crops', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'farm_id': self.farm_id,
            'crop_name': self.crop_name,
            'expected_yield': self.expected_yield,
            'sowing_date': self.sowing_date.isoformat() if self.sowing_date else None,
            'harvest_date': self.harvest_date.isoformat() if self.harvest_date else None,
            'status': self.status,
            'created_at': self.created_at.isoformat()
        }

class WeatherData(db.Model):
    __tablename__ = 'weather_data'
    
    id = db.Column(db.Integer, primary_key=True)
    location = db.Column(db.String(100), nullable=False) # state or district
    temperature = db.Column(db.Float, nullable=False)
    humidity = db.Column(db.Float, nullable=False)
    wind_speed = db.Column(db.Float, nullable=False)
    condition = db.Column(db.String(100), nullable=False)
    forecast_json = db.Column(db.Text, nullable=False) # Store 7-day forecast JSON
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        import json
        return {
            'id': self.id,
            'location': self.location,
            'temperature': self.temperature,
            'humidity': self.humidity,
            'wind_speed': self.wind_speed,
            'condition': self.condition,
            'forecast': json.loads(self.forecast_json) if self.forecast_json else [],
            'updated_at': self.updated_at.isoformat()
        }

class DiseaseReport(db.Model):
    __tablename__ = 'disease_reports'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    crop_type = db.Column(db.String(100), nullable=False)
    disease_name = db.Column(db.String(255), nullable=False)
    confidence = db.Column(db.Float, nullable=False)
    image_path = db.Column(db.String(255), nullable=True)
    treatment = db.Column(db.Text, nullable=False)
    prevention = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('disease_reports', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'crop_type': self.crop_type,
            'disease_name': self.disease_name,
            'confidence': self.confidence,
            'image_path': self.image_path,
            'treatment': self.treatment,
            'prevention': self.prevention,
            'created_at': self.created_at.isoformat()
        }

class MarketPrice(db.Model):
    __tablename__ = 'market_prices'
    
    id = db.Column(db.Integer, primary_key=True)
    crop_name = db.Column(db.String(100), nullable=False)
    market_name = db.Column(db.String(120), nullable=False)
    state = db.Column(db.String(100), nullable=False)
    district = db.Column(db.String(100), nullable=False)
    current_price = db.Column(db.Float, nullable=False) # per quintal
    predicted_price = db.Column(db.Float, nullable=True) # ML predicted price
    date = db.Column(db.Date, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'crop_name': self.crop_name,
            'market_name': self.market_name,
            'state': self.state,
            'district': self.district,
            'current_price': self.current_price,
            'predicted_price': self.predicted_price,
            'date': self.date.isoformat() if self.date else None
        }

class GovScheme(db.Model):
    __tablename__ = 'gov_schemes'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    eligibility_criteria = db.Column(db.Text, nullable=False) # details in bullet points
    subsidy_percentage = db.Column(db.Integer, nullable=True) # e.g. 50%
    application_link = db.Column(db.String(255), nullable=True)
    document_checklist = db.Column(db.Text, nullable=False) # comma-separated or JSON list

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'eligibility_criteria': self.eligibility_criteria,
            'subsidy_percentage': self.subsidy_percentage,
            'application_link': self.application_link,
            'document_checklist': self.document_checklist
        }

class Notification(db.Model):
    __tablename__ = 'notifications'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    message = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), default='General') # Weather, Market, Scheme, Disease, Sowing
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('notifications', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'message': self.message,
            'category': self.category,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat()
        }

class EmergencyRequest(db.Model):
    __tablename__ = 'emergency_requests'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(50), default='Pending') # Pending, Notified, Resolved
    officer_notified = db.Column(db.String(100), nullable=True)
    offline_queued = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('emergency_requests', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'status': self.status,
            'officer_notified': self.officer_notified,
            'offline_queued': self.offline_queued,
            'created_at': self.created_at.isoformat()
        }

class ChatHistory(db.Model):
    __tablename__ = 'chat_histories'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True) # Can be anonymous
    message = db.Column(db.Text, nullable=False)
    response = db.Column(db.Text, nullable=False)
    language = db.Column(db.String(20), default='en')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'message': self.message,
            'response': self.response,
            'language': self.language,
            'created_at': self.created_at.isoformat()
        }
