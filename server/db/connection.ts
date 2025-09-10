import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Environment variables
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/moviestreamer';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Create postgres client
const client = postgres(DATABASE_URL, {
  max: NODE_ENV === 'production' ? 20 : 5, // Connection pool size
  idle_timeout: 20,
  connect_timeout: 10,
  ssl: NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Create drizzle instance
export const db = drizzle(client, { 
  schema,
  logger: NODE_ENV === 'development' 
});

// Health check function
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await client`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Graceful shutdown
export async function closeDatabaseConnection(): Promise<void> {
  try {
    await client.end();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
}

// Export client for migrations
export { client };
