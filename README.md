# TSH Labs

Internal and client-facing AI laboratory for That Software House. Hosted on self-managed infrastructure.

## Tech Stack
- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Database:** Supabase
- **Host:** Mac Mini (lab.thatsoftwarehouse.com)

## Setup

### 1. Environment Variables
Create a `.env` file in the root directory:
```env
# Supabase
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_key

# Port
PORT=3001
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development
```bash
# Frontend
npm run dev

# Backend
npm run server
```

### 4. Build & Production
```bash
npm run build
npm start
```

## Moving projects
This repo is the permanent home for all AI-heavy TSH projects. When adding a new module:
1. Create the backend logic in `server/routes/`
2. Register the route in `server/index.js`
3. Create the frontend component in `src/components/apps/`
4. Register the project in `src/lib/projects.js`
