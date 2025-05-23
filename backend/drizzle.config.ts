import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config({ path: '../../.env' });

console.log("DB_FILE_NAME from .env:", process.env.DB_FILE_NAME); 

export default defineConfig({
  out: './drizzle',
  schema: './src/schemas/schema.ts',
  dialect: 'sqlite',
  dbCredentials: {
    url: `file:${process.env.DB_FILE_NAME}`, 
  },
});
