import os
from app import create_app

app = create_app()

if __name__ == '__main__':
    # Fallback to waitress if run directly
    port = int(os.environ.get('PORT', 5000))
    try:
        from waitress import serve
        print(f"Starting Waitress production server on port {port}...")
        serve(app, host='0.0.0.0', port=port)
    except ImportError:
        print(f"Starting Flask development server on port {port}...")
        app.run(host='0.0.0.0', port=port)
