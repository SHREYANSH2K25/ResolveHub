import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// BACKEND/src/config -> BACKEND
const backendDir = path.resolve(__dirname, '..', '..');

// Prefer BACKEND/.env, but support BACKEND/env (some repos use this locally)
const candidateEnvPaths = [
  path.join(backendDir, '.env'),
  path.join(backendDir, 'env'),
];

const envPath = candidateEnvPaths.find((p) => fs.existsSync(p));

// Don't override already-defined environment variables.
dotenv.config(envPath ? { path: envPath, override: false } : undefined);
