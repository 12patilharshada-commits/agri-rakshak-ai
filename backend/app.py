import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from models import db
from routes import api

def create_app():
    app = Flask(__name__)
    
    # Load settings
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-12345')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///agri_rakshak.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Enable CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Register blueprints
    app.register_blueprint(api, url_prefix='/api')
    
    # Ensure upload directory exists
    upload_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)
        
    @app.route('/uploads/<filename>')
    def uploaded_file(filename):
        return send_from_directory(upload_folder, filename)
        
    # Health check route
    @app.route('/health', methods=['GET'])
    def health():
        return {"status": "healthy", "service": "AgriRakshak AI Backend"}, 200

    # Initialize Database
    db.init_app(app)
    with app.app_context():
        db.create_all()
        
    return app

app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)