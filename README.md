# Team-39 Monorepo ReadMe

This repository contains multiple applications: Next.js frontend (QueueIt), Vite React frontend (SPEAR Frontend), Spring Boot backends (QueueIt Backend, SPEAR Backend), and a Python FastAPI service (Match_connect).

## Tech Stack & Versions

- Frontend (QueueIt Next.js)
  - `next` ^15.2.3, `react` ^19.0.0, `react-dom` ^19.0.0
  - UI: `@mui/material` ^6.4.1, `@emotion/react` ^11.14.0
  - Charts: `chart.js` ^4.4.8, `react-chartjs-2` ^5.3.0
  - Tailwind: `tailwindcss` ^3.4.1, `postcss` ^8, `autoprefixer` ^10.4.20

- Frontend (SPEAR Frontend - Vite React)
  - `vite` ^5.4.8, `react` ^18.3.1, `react-dom` ^18.3.1
  - UI: `@mui/material` ^6.1.9, `@emotion/react` ^11.13.5
  - Tailwind: `tailwindcss` ^3.4.13

- Backend (QueueIt - Spring Boot)
  - Spring Boot parent: 3.3.4
  - Java: 21
  - Web: `spring-boot-starter-web`
  - Data: `spring-boot-starter-data-jpa`, `mysql-connector-j` (runtime)
  - WebFlux: `spring-boot-starter-webflux` 3.4.0
  - WebSocket: `spring-boot-starter-websocket`

- Backend (SPEAR Backend - Spring Boot)
  - Spring Boot parent: 3.2.10
  - Java: 17
  - Security: `spring-boot-starter-security`, `spring-security-crypto`
  - JWT: `jjwt-*` 0.12.5
  - Mail: `spring-boot-starter-mail` 3.4.5
  - Data: `spring-boot-starter-data-jpa`, `mysql-connector-j` (runtime)

- Service (Match_connect - FastAPI + FAISS)
  - Python: 3.11+ recommended
  - Frameworks: `fastapi` 0.115.12, `uvicorn` 0.34.2, `starlette` 0.46.2
  - ML: `faiss-cpu` 1.11.0, `sentence-transformers` 3.3.1, `torch` 2.7.0, `transformers` 4.46.3, `scikit-learn` 1.6.1
  - DB: `mysql-connector-python` 9.1.0

## Repository Structure

- `queueit-nextjs-revamp-Jandel/` — Next.js frontend
- `SPEAR_Frontend-main/` — Vite React frontend
- `QueueIt-Queueit-backend-revamp/` — Spring Boot backend (QueueIt)
- `SPEAR_Backend-master/` — Spring Boot backend (SPEAR)
- `Match_connect/` — FastAPI service and AI components

## Deployment Instructions

### Prerequisites
- Node.js 20+ (for Next.js 15 and Vite 5)
- JDK 21 (for QueueIt) and JDK 17 (for SPEAR)
- Maven 3.9+
- Python 3.11+
- MySQL database instances available and configured

### Environment Variables
Configure each backend with the necessary DB and secrets. Typical Spring Boot properties (in `application.properties` or env):
- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `SPRING_JPA_HIBERNATE_DDL_AUTO`

For the FastAPI service, set:
- `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`

### Frontend: QueueIt (Next.js)

1) Install dependencies
```
powershell
cd "d:\My Personal Projects\Team-39\queueit-nextjs-revamp-Jandel"
pm install
```
2) Start dev server (default on port 5173)
```
powershell
npm run dev
```
3) Build & start production
```
powershell
npm run build
npm run start
```

### Frontend: SPEAR (Vite React)

1) Install dependencies
```
powershell
cd "d:\My Personal Projects\Team-39\SPEAR_Frontend-main"
npm install
```
2) Start dev server
```
powershell
npm run dev
```
3) Build & preview
```
powershell
npm run build
npm run preview
```

### Backend: QueueIt (Spring Boot)

1) Build & run
```
powershell
cd "d:\My Personal Projects\Team-39\QueueIt-Queueit-backend-revamp\capstone"
./mvnw.cmd clean package; java -jar target\capstone-0.0.1-SNAPSHOT.jar
```
Adjust `application.properties` for MySQL connection.

### Backend: SPEAR (Spring Boot)

1) Build & run
```
powershell
cd "d:\My Personal Projects\Team-39\SPEAR_Backend-master"
./mvnw.cmd clean package; java -jar target\SPEAR_Backend-0.0.1-SNAPSHOT.jar
```

### Service: Match_connect (FastAPI)

1) Create virtual environment and install
```
powershell
cd "d:\My Personal Projects\Team-39\Match_connect"
python -m venv .venv; .\.venv\Scripts\Activate.ps1; pip install -r requirements.txt
```
2) Run service
```
powershell
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

## Docker (Optional)
- See `docker-compose.ec2.yml` for EC2 deployment composition.
- Each module includes a `Dockerfile` (`Match_connect/Dockerfile`, `SPEAR_Backend-master/Dockerfile`, `QueueIt-Queueit-backend-revamp/capstone/Dockerfile`). Build images per module.

## Sample Accounts

- Admin:
  - Username: `admin123@cit.edu`
  - Password: `admin123`

If additional roles (Faculty, Mentor, Student) exist, provide their test accounts similarly once available.

## PDF Export

To generate a PDF from this `README.md`:
- VS Code: Open `README.md` and use an extension like "Markdown PDF" to export.
- Command line: Use `pandoc` — `pandoc README.md -o README.pdf`.

## Notes
- The specified versions are from package manifests and `pom.xml`/`requirements.txt` as of Dec 7, 2025.
- Align Node and JDK versions to match module requirements (Next.js 15 may require Node 18+, recommended Node 20+).