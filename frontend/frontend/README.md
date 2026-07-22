# CafeX Frontend

The CafeX client is a standard React application powered by Vite.

## Run locally

```bash
cd frontend/frontend
npm install
npm run dev
```

The development server runs at `http://localhost:3000`. Set `VITE_API_URL` in
`.env` when the backend API is hosted somewhere other than
`http://localhost:4000/api`.

## Project structure

```text
frontend/frontend/
├── public/
├── src/
│   ├── assets/
│   ├── component/
│   ├── pages/
│   ├── service/
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .env
├── .gitignore
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
└── vite.config.js
```
