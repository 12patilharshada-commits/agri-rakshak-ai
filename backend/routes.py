from flask import Blueprint, request, jsonify, current_app
from models import db, User, Farm, Crop, WeatherData, DiseaseReport, MarketPrice, GovScheme, Notification, EmergencyRequest, ChatHistory
from auth import token_required, register_user_logic, login_user_logic, google_login_logic, reset_password_logic
from ai_modules import recommend_crop, detect_disease, ask_chatbot
from datetime import datetime, timedelta
import random
import json

api = Blueprint('api', __name__)

# --- Auth Routes ---
@api.route('/auth/register', methods=['POST'])
def register():
    return register_user_logic()

@api.route('/auth/login', methods=['POST'])
def login():
    return login_user_logic()

@api.route('/auth/google', methods=['POST'])
def google_login():
    return google_login_logic()

@api.route('/auth/reset-password', methods=['POST'])
def reset_password():
    return reset_password_logic()

# --- User Profile ---
@api.route('/user/profile', methods=['GET', 'PUT'])
@token_required
def profile(current_user):
    if request.method == 'GET':
        return jsonify(current_user.to_dict()), 200
        
    data = request.get_json()
    current_user.name = data.get('name', current_user.name)
    current_user.state = data.get('state', current_user.state)
    current_user.district = data.get('district', current_user.district)
    current_user.language_preference = data.get('language', current_user.language_preference)
    db.session.commit()
    return jsonify({'message': 'Profile updated successfully!', 'user': current_user.to_dict()}), 200


# --- Weather API ---
@api.route('/weather', methods=['GET'])
def get_weather():
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    location = request.args.get('location', 'Pune')
    
    # Check if we have cached weather data (under 2 hours old)
    cached = WeatherData.query.filter_by(location=location).first()
    two_hours_ago = datetime.utcnow() - timedelta(hours=2)
    
    if cached and cached.updated_at > two_hours_ago:
        return jsonify(cached.to_dict()), 200
        
    # Standardize Weather Forecast with synthetic metrics for offline demonstration
    temp = round(random.uniform(22.0, 35.0), 1)
    humidity = round(random.uniform(40.0, 85.0), 1)
    wind = round(random.uniform(5.0, 20.0), 1)
    condition = random.choice(['Sunny', 'Cloudy', 'Heavy Rain', 'Drizzle', 'Windy'])
    
    forecast = []
    today = datetime.now()
    for i in range(7):
        day_date = today + timedelta(days=i)
        forecast.append({
            'date': day_date.strftime('%Y-%m-%d'),
            'day': day_date.strftime('%A'),
            'temp': round(random.uniform(22.0, 36.0), 1),
            'humidity': round(random.uniform(40.0, 90.0), 1),
            'rain_probability': random.randint(0, 100) if condition in ['Heavy Rain', 'Drizzle'] else random.randint(0, 30),
            'condition': random.choice(['Sunny', 'Cloudy', 'Rainy']) if i > 0 else condition
        })
        
    if not cached:
        cached = WeatherData(
            location=location,
            temperature=temp,
            humidity=humidity,
            wind_speed=wind,
            condition=condition,
            forecast_json=json.dumps(forecast)
        )
        db.session.add(cached)
    else:
        cached.temperature = temp
        cached.humidity = humidity
        cached.wind_speed = wind
        cached.condition = condition
        cached.forecast_json = json.dumps(forecast)
        
    db.session.commit()
    return jsonify(cached.to_dict()), 200


# --- AI Crop Recommendation ---
@api.route('/ai/recommend-crop', methods=['POST'])
def get_crop_recommendation():
    data = request.get_json()
    soil = data.get('soilType')
    state = data.get('state')
    season = data.get('season')
    water = data.get('waterAvailability')
    
    if not all([soil, state, season, water]):
        return jsonify({'message': 'Missing soil, state, season or water features!'}), 400
        
    recommendation = recommend_crop(soil, state, season, water)
    return jsonify(recommendation), 200


# --- AI Disease Detection ---
@api.route('/ai/detect-disease', methods=['POST'])
@token_required
def get_disease_detection(current_user):
    crop_type = request.form.get('crop')
    file = request.files.get('image')
    
    if not crop_type:
        return jsonify({'message': 'Crop type is required!'}), 400
        
    filename = file.filename if file else None
    result = detect_disease(crop_type, filename)
    
    # Store disease report in database
    report = DiseaseReport(
        user_id=current_user.id,
        crop_type=crop_type,
        disease_name=result['disease_name'],
        confidence=result['confidence_score'],
        image_path=f"uploads/{filename}" if filename else None,
        treatment=result['treatment_advice'],
        prevention=result['prevention_tips']
    )
    db.session.add(report)
    db.session.commit()
    
    return jsonify(report.to_dict()), 201

@api.route('/disease-reports', methods=['GET'])
@token_required
def get_disease_reports(current_user):
    reports = DiseaseReport.query.filter_by(user_id=current_user.id).order_by(DiseaseReport.created_at.desc()).all()
    return jsonify([r.to_dict() for r in reports]), 200


# --- Market Prices API ---
@api.route('/market-prices', methods=['GET'])
def get_market_prices():
    prices = MarketPrice.query.order_by(MarketPrice.current_price.desc()).all()
    # If table is empty, seed initial records
    if not prices:
        crops = ['Wheat', 'Rice', 'Sugarcane', 'Cotton', 'Tomato', 'Onion', 'Soybean']
        markets = ['Pune APMC', 'Mumbai Mandi', 'Nashik Market', 'Nagpur APMC', 'Kolhapur Market']
        for c in crops:
            for m in markets:
                base = random.randint(1800, 7500) if c not in ['Sugarcane'] else random.randint(280, 450)
                pred_pct = random.uniform(-0.15, 0.20)
                new_price = MarketPrice(
                    crop_name=c,
                    market_name=m,
                    state='Maharashtra',
                    district=m.split(' ')[0],
                    current_price=base,
                    predicted_price=round(base * (1 + pred_pct), 1)
                )
                db.session.add(new_price)
        db.session.commit()
        prices = MarketPrice.query.order_by(MarketPrice.current_price.desc()).all()
        
    return jsonify([p.to_dict() for p in prices]), 200


# --- Gov Schemes API ---
@api.route('/gov-schemes', methods=['GET'])
def get_gov_schemes():
    schemes = GovScheme.query.all()
    if not schemes:
        # Seed standard schemes
        schemes_data = [
            {
                'title': 'PM Kisan Samman Nidhi',
                'description': 'Direct financial assistance of ₹6,000 per year in three equal installments to small and marginal farmer families.',
                'eligibility_criteria': 'Small and marginal farmers, holding cultivable land in their names.',
                'subsidy_percentage': 100,
                'application_link': 'https://pmkisan.gov.in/',
                'document_checklist': 'Aadhaar Card, Land Holding Documents (7/12 extract), Bank Passbook'
            },
            {
                'title': 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
                'description': 'Low premium crop insurance to protect farmers against yield losses due to natural disasters, pests, or disease.',
                'eligibility_criteria': 'All farmers growing notified crops in notified areas, including sharecroppers.',
                'subsidy_percentage': 80,
                'application_link': 'https://pmfby.gov.in/',
                'document_checklist': 'Land record documents, Sowing certificate, Aadhaar, Bank details'
            },
            {
                'title': 'Drip Irrigation Subsidy (PMKSY)',
                'description': 'Financial support to install water-saving micro-irrigation systems like drip and sprinkler equipment.',
                'eligibility_criteria': 'All landowning farmers. Priority given to water-stressed regions.',
                'subsidy_percentage': 55,
                'application_link': 'https://mahadbt.maharashtra.gov.in/',
                'document_checklist': 'Soil testing report, 7/12 land extract, Micro-irrigation design certificate, Aadhaar'
            }
        ]
        for s in schemes_data:
            ns = GovScheme(
                title=s['title'],
                description=s['description'],
                eligibility_criteria=s['eligibility_criteria'],
                subsidy_percentage=s['subsidy_percentage'],
                application_link=s['application_link'],
                document_checklist=s['document_checklist']
            )
            db.session.add(ns)
        db.session.commit()
        schemes = GovScheme.query.all()
        
    return jsonify([s.to_dict() for s in schemes]), 200


# --- AI Assistant Chat ---
@api.route('/ai/chat', methods=['POST'])
def chat():
    data = request.get_json()
    message = data.get('message')
    language = data.get('language', 'en')
    user_id = data.get('userId')
    
    if not message:
        return jsonify({'message': 'Message is required!'}), 400
        
    response = ask_chatbot(message, language)
    
    # Log chat history
    log = ChatHistory(
        user_id=user_id,
        message=message,
        response=response,
        language=language
    )
    db.session.add(log)
    db.session.commit()
    
    return jsonify(log.to_dict()), 200


# --- Farms Registry ---
@api.route('/farms', methods=['GET', 'POST'])
@token_required
def handle_farms(current_user):
    if request.method == 'GET':
        farms = Farm.query.filter_by(owner_id=current_user.id).all()
        # Seed a dummy farm if new user
        if not farms:
            dummy = Farm(
                owner_id=current_user.id,
                size=4.5,
                location="18.5204, 73.8567", # Pune coords
                soil_type="Black Soil",
                water_availability="Borewell",
                health_score=88,
                ndvi_data=json.dumps([0.62, 0.65, 0.68, 0.70, 0.72, 0.69])
            )
            db.session.add(dummy)
            db.session.commit()
            farms = [dummy]
        return jsonify([f.to_dict() for f in farms]), 200
        
    data = request.get_json()
    new_farm = Farm(
        owner_id=current_user.id,
        size=float(data.get('size', 2.0)),
        location=data.get('location', "18.5204, 73.8567"),
        soil_type=data.get('soilType', "Black Soil"),
        water_availability=data.get('waterAvailability', "Rainfed"),
        health_score=random.randint(70, 95),
        ndvi_data=json.dumps([round(random.uniform(0.3, 0.8), 2) for _ in range(6)])
    )
    db.session.add(new_farm)
    db.session.commit()
    return jsonify(new_farm.to_dict()), 201


# --- Farm Crops ---
@api.route('/farms/<int:farm_id>/crops', methods=['GET', 'POST'])
@token_required
def handle_crops(current_user, farm_id):
    farm = db.session.get(Farm, farm_id)
    if not farm or farm.owner_id != current_user.id:
        return jsonify({'message': 'Farm not found or access denied!'}), 404
        
    if request.method == 'GET':
        crops = Crop.query.filter_by(farm_id=farm_id).all()
        if not crops:
            # Seed a crop
            sowing = datetime.now() - timedelta(days=60)
            dummy_crop = Crop(
                farm_id=farm_id,
                crop_name="Wheat",
                expected_yield=3.2,
                sowing_date=sowing.date(),
                status="Growing"
            )
            db.session.add(dummy_crop)
            db.session.commit()
            crops = [dummy_crop]
        return jsonify([c.to_dict() for c in crops]), 200
        
    data = request.get_json()
    sowing_date = datetime.strptime(data.get('sowingDate'), '%Y-%m-%d').date()
    new_crop = Crop(
        farm_id=farm_id,
        crop_name=data.get('cropName'),
        expected_yield=float(data.get('expectedYield', 2.5)),
        sowing_date=sowing_date,
        status="Growing"
    )
    db.session.add(new_crop)
    db.session.commit()
    return jsonify(new_crop.to_dict()), 201


# --- Notifications ---
@api.route('/notifications', methods=['GET', 'PUT'])
@token_required
def handle_notifications(current_user):
    if request.method == 'GET':
        notifications = Notification.query.filter_by(user_id=current_user.id).order_by(Notification.created_at.desc()).all()
        # Seed if empty
        if not notifications:
            alerts = [
                {'title': 'Heavy Rain Warning', 'msg': 'Possibility of heavy showers in your district tonight. Protect freshly harvested grains.', 'cat': 'Weather'},
                {'title': 'Wheat Price Update', 'msg': 'Wheat rates are up 5.4% in Pune APMC. Great time to sell.', 'cat': 'Market'},
                {'title': 'Subvention Subsidy Extended', 'msg': 'Application deadline for solar pump subsidy extended to next Friday.', 'cat': 'Scheme'}
            ]
            for a in alerts:
                n = Notification(
                    user_id=current_user.id,
                    title=a['title'],
                    message=a['msg'],
                    category=a['cat']
                )
                db.session.add(n)
            db.session.commit()
            notifications = Notification.query.filter_by(user_id=current_user.id).order_by(Notification.created_at.desc()).all()
        return jsonify([n.to_dict() for n in notifications]), 200
        
    # Mark all as read
    Notification.query.filter_by(user_id=current_user.id).update({Notification.is_read: True})
    db.session.commit()
    return jsonify({'message': 'All notifications marked as read!'}), 200


# --- SOS / Emergency ---
@api.route('/emergency/sos', methods=['POST'])
@token_required
def handle_sos(current_user):
    data = request.get_json()
    lat = float(data.get('lat', 18.5204))
    lon = float(data.get('lon', 73.8567))
    offline = bool(data.get('offline', False))
    
    sos = EmergencyRequest(
        user_id=current_user.id,
        latitude=lat,
        longitude=lon,
        status='Notified',
        officer_notified='District Agriculture Officer (Pune Branch)',
        offline_queued=offline
    )
    db.session.add(sos)
    db.session.commit()
    
    # Auto-generate emergency notification
    n = Notification(
        user_id=current_user.id,
        title='SOS Activated',
        message=f'Your emergency request was received. Geolocation: {lat}, {lon}. Agriculture Officer has been notified.',
        category='General'
    )
    db.session.add(n)
    db.session.commit()
    
    return jsonify({
        'message': 'SOS request received successfully!',
        'sos': sos.to_dict()
    }), 201
