# CafeX frontend

The CafeX repository uses the requested nested frontend project. Application
code follows a familiar Vite-style `src` structure, with a minimal `app`
adapter retained for CafeX hosting.

```text
frontend/
└── frontend/
    ├── public/
    ├── src/
    │   ├── assets/
    │   ├── component/
    │   ├── data/
    │   ├── pages/
    │   │   ├── About.jsx
    │   │   ├── Contact.jsx
    │   │   ├── EditUser.jsx
    │   │   ├── ErrorFound.jsx
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   └── User.jsx
    │   ├── service/
    │   │   ├── Api.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── App.css
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── app/
    │   ├── globals.css
    │   ├── layout.tsx
    │   └── page.tsx
    ├── .env
    ├── .env.example
    ├── .gitignore
    ├── eslint.config.js
    ├── index.html
    ├── package-lock.json
    ├── package.json
    └── vite.config.js
```

See the root `README.md` for MySQL Workbench, backend, admin-account, and startup instructions.
