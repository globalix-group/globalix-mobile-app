import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { v4 as uuidv4 } from 'uuid';

// ===== ACTIVITY LOG MODEL =====
export class ActivityLog extends Model {
  declare id: string;
  declare userId: string;
  declare type: string; // login, signup, property_view, car_view, inquiry, purchase, etc.
  declare action: string;
  declare metadata: Record<string, any>;
  declare ipAddress: string;
  declare userAgent: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

ActivityLog.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    type: {
      type: DataTypes.ENUM('login', 'signup', 'property_view', 'car_view', 'inquiry', 'purchase', 'upload', 'error'),
      allowNull: false,
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'ActivityLog',
    tableName: 'activity_logs',
    timestamps: true,
  }
);

// ===== ANALYTICS MODEL =====
export class Analytics extends Model {
  declare id: string;
  declare date: Date;
  declare totalUsers: number;
  declare activeUsers: number;
  declare newSignups: number;
  declare totalLogins: number;
  declare totalViews: number;
  declare totalInquiries: number;
  declare totalEarnings: number;
  declare metadata: Record<string, any>;
}

Analytics.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      unique: true,
    },
    totalUsers: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    activeUsers: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    newSignups: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    totalLogins: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    totalViews: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    totalInquiries: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    totalEarnings: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
  },
  {
    sequelize,
    modelName: 'Analytics',
    tableName: 'analytics',
    timestamps: true,
  }
);

// ===== TRANSACTION MODEL (EARNINGS) =====
export class Transaction extends Model {
  declare id: string;
  declare userId: string;
  declare type: string; // property_sale, car_rental, commission, etc.
  declare amount: number;
  declare currency: string;
  declare status: string; // completed, pending, failed
  declare reference: string;
  declare metadata: Record<string, any>;
  declare createdAt: Date;
}

Transaction.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    type: {
      type: DataTypes.ENUM('property_sale', 'car_rental', 'commission', 'refund', 'payout'),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'USD',
    },
    status: {
      type: DataTypes.ENUM('completed', 'pending', 'failed'),
      defaultValue: 'pending',
    },
    reference: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
  },
  {
    sequelize,
    modelName: 'Transaction',
    tableName: 'transactions',
    timestamps: true,
  }
);

// ===== ADMIN USER MODEL =====
export class AdminUser extends Model {
  declare id: string;
  declare email: string;
  declare password: string;
  declare name: string;
  declare role: string; // superadmin, admin, moderator
  declare permissions: string[];
  declare isActive: boolean;
  declare lastLogin: Date;
  declare createdAt: Date;
}

AdminUser.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('superadmin', 'admin', 'moderator'),
      defaultValue: 'admin',
    },
    permissions: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'AdminUser',
    tableName: 'admin_users',
    timestamps: true,
  }
);

export default sequelize;
