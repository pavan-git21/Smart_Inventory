# StockWise – Inventory & Demand Tracker

A full-stack web application for business owners to manage inventory, track sales, and gain demand insights.


---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | Next.js, React.js, TypeScript       |
| Styling    | Tailwind CSS                        |
| Backend    | Node.js, Express, TypeScript        |
| Database   | PostgreSQL                          |
| Auth       | JWT  + bcrypt                       |

---

## Features

- **Product Management** – Full CRUD: add, view, edit, delete products
- **Sales Tracking** – Record sales, auto-update stock, transaction history
- **Demand Reports** – Top selling products, category revenue, low stock alerts
- **Authentication** – JWT-based login/register with protected routes


---

## Project Structure

```
inventory-demand-tracker/
├── backend/          ← Express API (Node.js + TypeScript)
└── frontend/         ← Next.js (TypeScript + Tailwind)
```

---

## Setup Instructions

### 1. Database Setup

Install PostgreSQL and run:

```bash
psql -U postgres
\i backend/setup.sql
```

### 2. Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# Start development server
npm run dev
```

Backend runs on: `http://localhost:5000`

### 3. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local
cp .env.example .env.local
# Edit if backend URL is different

# Start development server
npm run dev
```

Frontend runs on: `http://localhost:3000`

---



