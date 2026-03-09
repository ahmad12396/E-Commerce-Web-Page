🛒 E-Commerce Store & Admin Dashboard
A full-stack application featuring a user-facing product store and a dedicated administrative dashboard for data management. Built with Django REST Framework, React, and PostgreSQL.

<img width="1920" height="1625" alt="screencapture-localhost-5173-2026-03-09-14_24_25" src="https://github.com/user-attachments/assets/ef171249-01bd-46e8-8418-4abdd2e9eeb7" />

🚀 Project Overview
This project is split into two main functionalities:

Store App (User-Facing): Allows users to browse products, manage their cart, and place orders.

Dashboard App (Admin-Facing): A secure area for staff to manage orders, view database statistics, and handle deletions.

🛠️ Tech Stack
Frontend: React, Tailwind CSS, React Context API (Cart Management)

Backend: Django, Django REST Framework (DRF)

Database: PostgreSQL (managed via pgAdmin 4)

Authentication: JWT (JSON Web Tokens) with separated Admin/User token logic

📂 Project Structure
Plaintext
├── backend/                 # Django Project
│   ├── store/               # Models: Products, Cart, Orders
│   ├── dashboard/           # Admin-specific logic and management
│   ├── requirements.txt     # Python dependencies
│   └── .env                 # Database & Secret keys (Ignored by Git)
├── frontend/                # React Project
│   ├── src/
│   │   ├── context/         # Cart and Auth Contexts
│   │   ├── utils/           # authFetch and token utilities
│   │   └── components/      # Product/Admin UI
│   └── .env                 # API URL (Ignored by Git)
└── README.md
⚙️ Installation & Setup
1. Database Setup (PostgreSQL)
Open pgAdmin 4 and create a new database.

Configure your credentials in the .env file (see Environment Variables).

2. Backend Setup (Django)
Bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
3. Frontend Setup (React)
Bash
cd frontend
npm install
npm run dev
🔐 Environment Variables
Create a .env file in both the /backend and /frontend directories.

Backend (.env):

Ini, TOML
DB_NAME=your_db_name
DB_USER=postgres
DB_PASSWORD=your_pgadmin_password
DB_HOST=localhost
DB_PORT=5432
SECRET_KEY=your_django_secret_key
Frontend (.env):

Ini, TOML
VITE_DJANGO_BASE_URL=http://127.0.0.1:8000
📝 Features & Best Practices
Token Separation: Distinct handling for User and Admin JWT tokens in localStorage to prevent session overlapping.

Optimized Rendering: Uses useMemo for heavy cart calculations and loading states in useEffect to prevent UI flickering on refresh.

PostgreSQL Integration: Robust data persistence using psycopg2 for high-performance database queries.

Clean API Utility: Centralized authFetch with automatic token refresh logic for 401 Unauthorized responses.

🤝 Contributing
Fork the Project

Create your Feature Branch (git checkout -b feature/AmazingFeature)

Commit your Changes (git commit -m 'Add some AmazingFeature')

Push to the Branch (git push origin feature/AmazingFeature)

Open a Pull Request
