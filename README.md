# MindPulse

MindPulse is a mental health and burnout prediction platform that combines machine learning, generative AI, and modern web development. It includes a Python-based ML backend, a FastAPI/Node.js API layer, and a React + Vite frontend for a complete assessment and prediction experience.

## Features

- Burnout risk prediction using trained machine learning models
- FastAPI Python API for model inference and dataset handling
- Node.js backend supporting authentication and AI route handling
- React + Tailwind CSS frontend with user assessment, results, and history pages
- Local dataset support for model training and evaluation

## Repository Structure

- `api/` - Python FastAPI application files
- `data/` - Local dataset files (not committed for GitHub)
- `frontend/` - React + Vite frontend application
- `node_backend/` - Node.js backend server and routes
- `model/` - Stored trained ML model artifacts
- `ml_utils.py`, `models.py`, `train_burnout_model.py` - Machine learning model training and utilities
- `requirements.txt` - Python package dependencies
- `.env.example` - Example environment variable template

## Setup

### 1. Python environment

```powershell
python -m venv ml_env
.\
l_env\Scripts\Activate.ps1
pip install -r requirements.txt
```

### 2. Node backends

#### Node backend
```powershell
cd node_backend
npm install
npm start
```

#### Frontend
```powershell
cd frontend
npm install
npm run dev
```

### 3. Environment variables

Create a `.env` file at the repository root and configure any required secrets. For example:

```text
HF_TOKEN=your_actual_huggingface_token_here
```

> Do not commit the real `.env` file to Git.

## Usage

- Run the Python/ML backend and FastAPI server as required for inference and training.
- Start the Node.js backend from `node_backend/` to serve authentication and prediction routes.
- Start the frontend from `frontend/` for the web interface.

## Notes

- The dataset `data/student_mental_health_burnout_1M.csv` is large and excluded from version control.
- The local databases `burnout.db` and `predictions.db` are also excluded from Git tracking.

## License

This project is licensed under the MIT License. See `LICENSE` for details.
