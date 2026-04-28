import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MANAGED_ENV_KEYS = [
  'VITE_API_BASE_URL',
  'VITE_GROK_VIDEO_MAX_BYTES',
  'VITE_GROK_VIDEO_RATE_480P',
  'VITE_GROK_VIDEO_RATE_720P',
  'VITE_SITE_URL',
  'VITE_SORA_2_RATE',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_SUPABASE_PUBLISHABLE_API_KEY',
  'VITE_SUPABASE_URL',
  'VITE_VIDEO_UPLOAD_MAX_BYTES',
];

function loadFileEnv(mode) {
  const root = __dirname;
  const envFiles = [
    path.resolve(root, '.env'),
    path.resolve(root, `.env.${mode}`),
  ];
  const exampleFile = path.resolve(root, '.env.example');
  const managedKeys = new Set(MANAGED_ENV_KEYS);
  const fileEnv = {};

  for (const file of [exampleFile, ...envFiles]) {
    if (!fs.existsSync(file)) continue;
    const parsed = dotenv.parse(fs.readFileSync(file));
    for (const key of Object.keys(parsed)) {
      managedKeys.add(key);
    }
  }

  for (const key of managedKeys) {
    delete process.env[key];
  }

  for (const file of envFiles) {
    if (!fs.existsSync(file)) continue;
    const parsed = dotenv.parse(fs.readFileSync(file));
    Object.assign(fileEnv, parsed);
    dotenv.populate(process.env, parsed, { override: true });
  }

  return fileEnv;
}

function buildImportMetaEnv(fileEnv, mode) {
  return Object.fromEntries(
    Object.entries({
      ...fileEnv,
      MODE: mode,
      DEV: mode !== 'production',
      PROD: mode === 'production',
    })
      .filter(([key]) => key === 'MODE' || key === 'DEV' || key === 'PROD' || key.startsWith('VITE_'))
      .map(([key, value]) => [`import.meta.env.${key}`, JSON.stringify(value)])
  );
}

export default defineConfig(({ mode }) => {
  const fileEnv = loadFileEnv(mode);

  return {
    plugins: [react()],
    define: buildImportMetaEnv(fileEnv, mode),
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
      },
    },
  };
});
