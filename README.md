# CafeX Web App

CafeX is a full-stack café ordering and management application. The frontend is React on Vite/Vinext, the API is Node.js with Express, and all persistent application data uses **MySQL 8**. The SQL files are ready to run in **MySQL Workbench**; PostgreSQL and pgAdmin are not used.

## What is included

- Responsive CafeX landing page and searchable category menu
- Registration, login, JWT authentication, and customer profiles
- Favorites, persistent cart, pickup checkout, and order history
- Admin dashboard with live metrics, recent orders, and menu availability controls
- MySQL tables for users, categories, menu items, favorites, orders, and order items
- Secure password hashing, role authorization, request validation, rate limiting, and image uploads
- Seed data, automated backend tests, and a polished CafeX social-sharing card

## Project structure

```text
CafeX-Web/
├── backend/
│   ├── controller/       # Request handlers
│   ├── database/         # MySQL connection, schema, seed, Workbench guide
│   ├── middleware/       # JWT, roles, uploads, errors
│   ├── model/            # MySQL data access
│   ├── route/            # Express API routes
│   ├── tests/            # Node test suite
│   ├── uploads/          # Local menu image uploads
│   ├── app.js
│   └── server.js
└── frontend/
    ├── app/              # Sites/Vinext route shell and global styling
    ├── public/           # CafeX logo, café background, social card
    ├── src/
    │   ├── assets/       # Shared asset references
    │   ├── component/    # Reusable React UI
    │   ├── data/         # Frontend fallback data
    │   ├── pages/        # Page entry points
    │   ├── service/      # Backend API client
    │   └── types/        # Shared frontend types
    └── package.json
```

## 1. Set up MySQL Workbench

1. Open MySQL Workbench and connect to your local MySQL 8 server. See
   `backend/database/workbench/README.md` for the illustrated folder handoff.
2. Open `backend/database/schema.sql` and execute the complete script.
3. Open `backend/database/seed.sql` and execute it to add the starter CafeX menu.
4. Do not create a PostgreSQL database; the API uses `mysql2` exclusively.

## 2. Start the backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Edit `backend/.env` with the MySQL username and password shown in MySQL Workbench. The API runs at `http://localhost:4000`.

Create the first admin account after the schema is running:

```bash
npm run create-admin -- admin@cafex.com "StrongPassword123" "CafeX Admin"
```

## 3. Start the frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`. Customer accounts can be created from the **Sign in** panel. Use the admin account above to open the command center.

## Validation

```bash
cd backend && npm test
cd frontend && npm run build
```

## API overview

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/menu`, admin `POST/PATCH/DELETE /api/menu/:id`
- `GET/POST/DELETE /api/menu/:id/favorite`
- `GET/POST /api/orders`, admin `PATCH /api/orders/:id/status`
- Admin `GET /api/dashboard`
- `GET /api/health`

Menu uploads are served from `/uploads`. For production, move uploaded images to an object-storage service and set both frontend environment variables to the deployed URLs.
