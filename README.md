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
