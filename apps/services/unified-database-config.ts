import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// ===== UNIFIED DATABASE CONFIGURATION =====
// Both backends now use the SAME database for data consistency

const DB_CONFIG = {
  dialect: 'postgres' as const,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'restate_db', // Unified database name
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 2,
    acquire: 30000,
    idle: 10000,
  },
  timestamps: true,
  timezone: 'UTC',
};

const sequelize = new Sequelize(DB_CONFIG);

// ===== CONNECTION VALIDATION =====
export async function validateDatabaseConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    console.log(`📊 Database: ${DB_CONFIG.database} @ ${DB_CONFIG.host}:${DB_CONFIG.port}`);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

export default sequelize;
