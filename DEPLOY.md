# 🎬 CineSystem — Guía de Despliegue en Railway

## Estructura — Dos repositorios independientes

```
cine-backend/          ← Subir como un repo de GitHub
├── src/
├── database/          ← schema.sql + seed.sql (auto-ejecutados al arrancar)
├── Dockerfile
├── railway.toml
├── package.json
└── .env.example

cine-frontend/         ← Subir como otro repo de GitHub
├── src/
├── Dockerfile
├── nginx.conf
├── railway.toml
├── package.json
└── .env.example
```

> ⚠️ Son DOS repositorios separados en GitHub para que Railway detecte el Dockerfile en la raíz de cada uno.

---

## Paso 1 — Subir a GitHub

```bash
# Repo 1 — Backend
cd cine-backend
git init && git add . && git commit -m "feat: cinema backend"
git remote add origin https://github.com/TU_USUARIO/cine-backend.git
git push -u origin main

# Repo 2 — Frontend
cd ../cine-frontend
git init && git add . && git commit -m "feat: cinema frontend"
git remote add origin https://github.com/TU_USUARIO/cine-frontend.git
git push -u origin main
```

## Paso 2 — Railway: Crear proyecto

railway.app → New Project → Empty Project

## Paso 3 — MySQL

+ New → Database → MySQL
Anota: MYSQLHOST, MYSQLPORT, MYSQLUSER, MYSQLPASSWORD, MYSQLDATABASE

> El schema y seed se ejecutan automáticamente al primer arranque del backend.

## Paso 4 — Deploy Backend

+ New → GitHub Repo → selecciona cine-backend
Railway detecta el Dockerfile automáticamente.

Variables del servicio backend:
- MYSQLHOST, MYSQLPORT, MYSQLUSER, MYSQLPASSWORD, MYSQLDATABASE (del Paso 3)
- JWT_SECRET = string aleatorio largo (min 32 chars)
- JWT_EXPIRES_IN = 7d
- NODE_ENV = production
- FRONTEND_URL = (completar después)

Settings → Networking → genera URL pública. Cópiala.

## Paso 5 — Deploy Frontend

+ New → GitHub Repo → selecciona cine-frontend

Variables:
- VITE_API_URL = URL del backend (sin barra al final)

Settings → Networking → genera URL pública. Cópiala.

## Paso 6 — Conectar CORS

Backend → Variables → FRONTEND_URL = URL del frontend del Paso 5

## Paso 7 — Verificar

Login: admin@cine.com / Admin123!

---

## Credenciales seed

| Rol     | Email              | Password   |
|---------|--------------------|------------|
| Admin   | admin@cine.com     | Admin123!  |
| Cliente | cliente@cine.com   | Admin123!  |
