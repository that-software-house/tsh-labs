# TSH Labs

Internal and client-facing AI laboratory for That Software House. Hosted on self-managed infrastructure.

## Tech Stack
- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Database:** Supabase
- **Host:** Mac Mini (lab.thatsoftwarehouse.com)

## Setup

### 1. Environment Variables
Create environment files in the root directory:

```bash
cp .env.development.example .env.development
cp .env.production.example .env.production
```

`.env` can hold shared defaults. `npm run dev` loads `.env` and `.env.development`; `npm run build` and `npm run preview` load `.env` and `.env.production`. File values override matching shell variables, and managed env keys from the shell are cleared before the files are loaded.

```env
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
VITE_API_BASE_URL=http://127.0.0.1:3001
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development
```bash
# Frontend
npm run dev

# Backend lives in ../tsh-labs-api
```

### 4. Build & Production
```bash
npm run build
npm run preview
```

## Moving projects
This repo is the permanent home for all AI-heavy TSH projects. When adding a new module:
1. Create the backend logic in `../tsh-labs-api/server/routes/`
2. Register the route in `../tsh-labs-api/server/index.js`
3. Create the frontend component in `src/components/apps/`
4. Register the project in `src/lib/projects.js`
