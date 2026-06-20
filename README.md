# AgriRakshak AI – Smart Farming Assistant Platform

AgriRakshak AI is a full-stack, AI-powered agricultural helper system. It features weather forecasts, AI crop predictions, disease classification, market trend analytics, localized voice assistant (Marathi, Hindi, English), and emergency services.

## Project Structure
```
agri-rakshak/
├── backend/            # Python Flask Backend
└── frontend/           # Vite + React + TypeScript Frontend
```

## Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)

### Setting Up the Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On Mac/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the backend server:
   ```bash
   python app.py
   ```
   The backend server runs at `http://127.0.0.1:5000`.

### Setting Up the Frontend
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the packages:
   ```bash
   npm install
   ```
3. Start the local Vite development server:
   ```bash
   npm run dev
   ```
   The frontend app runs at `http://localhost:5173`.
