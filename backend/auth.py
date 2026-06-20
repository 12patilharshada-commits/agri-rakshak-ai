import jwt
from datetime import datetime, timedelta
from flask import request, jsonify, current_app
from functools import wraps
from models import db, User

def generate_token(user):
    payload = {
        'exp': datetime.utcnow() + timedelta(days=7),
        'iat': datetime.utcnow(),
        'sub': user.id,
        'role': user.role
    }
    return jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm='HS256')

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
        
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        
        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = db.session.get(User, data['sub'])
            if not current_user:
                return jsonify({'message': 'User not found!'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token is invalid!'}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated

def register_user_logic():
    data = request.get_json()
    if not data:
        return jsonify({'message': 'No data provided'}), 400
        
    name = data.get('name')
    mobile = data.get('mobile')
    email = data.get('email')
    password = data.get('password')
    state = data.get('state')
    district = data.get('district')
    language = data.get('language', 'en')
    role = data.get('role', 'Farmer')
    
    if not all([name, mobile, email, password, state, district]):
        return jsonify({'message': 'Missing fields!'}), 400
        
    # Check duplicate
    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'Email already registered!'}), 400
    if User.query.filter_by(mobile=mobile).first():
        return jsonify({'message': 'Mobile number already registered!'}), 400
        
    user = User(
        name=name,
        mobile=mobile,
        email=email,
        state=state,
        district=district,
        language_preference=language,
        role=role
    )
    user.set_password(password)
    
    db.session.add(user)
    db.session.commit()
    
    token = generate_token(user)
    return jsonify({
        'message': 'Registration successful!',
        'token': token,
        'user': user.to_dict()
    }), 201

def login_user_logic():
    data = request.get_json()
    if not data:
        return jsonify({'message': 'No credentials provided'}), 400
        
    identifier = data.get('identifier') # Can be email or mobile
    password = data.get('password')
    
    if not identifier or not password:
        return jsonify({'message': 'Missing credentials!'}), 400
        
    # Find user by email or mobile
    user = User.query.filter((User.email == identifier) | (User.mobile == identifier)).first()
    
    if not user or not user.check_password(password):
        return jsonify({'message': 'Invalid credentials!'}), 401
        
    token = generate_token(user)
    return jsonify({
        'message': 'Login successful!',
        'token': token,
        'user': user.to_dict()
    }), 200

def reset_password_logic():
    data = request.get_json()
    email = data.get('email')
    new_password = data.get('newPassword')
    
    if not email or not new_password:
        return jsonify({'message': 'Missing email or new password!'}), 400
        
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'message': 'User with this email not found!'}), 404
        
    user.set_password(new_password)
    db.session.commit()
    return jsonify({'message': 'Password has been reset successfully!'}), 200

def google_login_logic():
    data = request.get_json()
    email = data.get('email')
    name = data.get('name')
    google_id = data.get('googleId')
    
    if not email or not name:
        return jsonify({'message': 'Google authentication failed!'}), 400
        
    user = User.query.filter_by(email=email).first()
    if not user:
        # Create user with a dummy password
        user = User(
            name=name,
            email=email,
            mobile='G-' + str(google_id)[:10] if google_id else 'GoogleUser',
            state='Maharashtra', # Defaults
            district='Pune',
            role='Farmer'
        )
        user.set_password(str(google_id or 'GoogleDummyPassword123'))
        db.session.add(user)
        db.session.commit()
        
    token = generate_token(user)
    return jsonify({
        'message': 'Google authentication successful!',
        'token': token,
        'user': user.to_dict()
    }), 200
