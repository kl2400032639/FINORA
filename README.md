# Finora v2 - Expense Management SaaS

A premium, full-stack Expense Management SaaS built with the MERN stack (MongoDB, Express, React, Node.js).

## 🚀 Features
- **Secure Authentication**: JWT-based login/signup with route protection.
- **Dynamic Dashboard**: Financial overview, monthly budget tracking, and real-time balance.
- **Expense Tracking**: Add, edit, delete, and categorize expenses.
- **AI Insights**: Rule-based smart spending insights based on past history.
- **Modern UI/UX**: Dark mode by default, glassmorphism UI, responsive design.

## 🛠️ Tech Stack
- **Frontend**: React (Vite), React Router, Axios, CSS Modules (Custom Design System)
- **Backend**: Node.js, Express, Mongoose, JWT Auth, Multer
- **Database**: MongoDB

## 📦 Setup Instructions

### 1. Prerequisites
- [Node.js](https://nodejs.org/) installed
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) installed and running locally on port 27017.

### 2. Backend Setup
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd finora-v2/backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the backend server (runs on `http://localhost:5000`):
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd finora-v2/frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend server:
   ```bash
   npm run dev
   ```
4. Open your browser and go to `http://localhost:5173`

## 📚 API Documentation (Local)
- `POST /api/auth/signup` - Create a new user
- `POST /api/auth/login` - Authenticate user & get token
- `GET /api/expenses` - Get all expenses with filters/pagination
- `POST /api/expenses` - Add a new expense (supports multipart for receipts)
- `GET /api/analytics/insights` - Get AI spending insights

Made with ❤️ by Madhuri
## Screenshots

### Login Page
<img width="1194" height="718" alt="{08920931-C7CB-40CC-9B72-2583FCA374AA}" src="https://github.com/user-attachments/assets/c06e441b-13bd-41f1-8044-23abf9134bd7" />
### EXPENSES
<img width="1250" height="772" alt="{26CFD61E-CA27-44C5-B2CF-2B3DC2E602D1}" src="https://github.com/user-attachments/assets/d4f1bf5b-40ee-4a45-ab41-8fe3dc870777" />
### Dashboard
<img width="1249" height="746" alt="{C679769D-F27C-48CD-A462-9154AF4D8ECF}" src="https://github.com/user-attachments/assets/d57a1f37-8228-49d2-beb4-ddf8833541ee" />
### Analytics
<img width="1252" height="750" alt="{19405016-3639-43E6-B82C-900962BF7F67}" src="https://github.com/user-attachments/assets/f15492eb-98b3-41fd-a1c2-c893a3d57afb" />
### GOAL
<img width="1237" height="750" alt="{A6761EDD-699F-4A30-AC0F-5D3B90D6AEE2}" src="https://github.com/user-attachments/assets/75c1b902-fcc2-4c09-b642-16a6f9359a4b" />

