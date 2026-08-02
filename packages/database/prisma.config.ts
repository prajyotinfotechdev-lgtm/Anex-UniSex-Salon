import { defineConfig } from '@prisma/config';
import dotenv from 'dotenv';
import path from 'path';

// Load the root .env
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

export default defineConfig({});
