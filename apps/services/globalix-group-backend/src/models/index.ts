import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import ChatMessage from './ChatMessage';
import UserMedia from './UserMedia';

// ===== TENANT MODEL =====
export class Tenant extends Model {
  declare id: string;
  declare name: string;
  declare status: 'active' | 'suspended' | 'archived';
  declare planId: string | null;
  declare branding: Record<string, any> | null;
  declare dataRetentionPolicy: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Tenant.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'suspended', 'archived'),
      defaultValue: 'active',
    },
    planId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    branding: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    dataRetentionPolicy: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Tenant',
    tableName: 'tenants',
  }
);

// ===== PLAN MODEL =====
export class Plan extends Model {
  declare id: string;
  declare name: string;
  declare stripePriceIdMonthly: string | null;
  declare stripePriceIdAnnual: string | null;
  declare priceMonthly: number;
  declare priceAnnual: number;
  declare limits: Record<string, any>;
  declare features: Record<string, any>;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Plan.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    stripePriceIdMonthly: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    stripePriceIdAnnual: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    priceMonthly: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    priceAnnual: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    limits: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    features: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
  },
  {
    sequelize,
    modelName: 'Plan',
    tableName: 'plans',
  }
);

// ===== SUBSCRIPTION MODEL =====
export class Subscription extends Model {
  declare id: string;
  declare tenantId: string;
  declare planId: string;
  declare stripeCustomerId: string | null;
  declare stripeSubscriptionId: string | null;
  declare status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'incomplete';
  declare currentPeriodEnd: Date | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Subscription.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    tenantId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tenants',
        key: 'id',
      },
    },
    planId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'plans',
        key: 'id',
      },
    },
    stripeCustomerId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    stripeSubscriptionId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('trialing', 'active', 'past_due', 'canceled', 'incomplete'),
      defaultValue: 'trialing',
    },
    currentPeriodEnd: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Subscription',
    tableName: 'subscriptions',
  }
);

// ===== FEATURE FLAG MODEL =====
export class FeatureFlag extends Model {
  declare id: string;
  declare tenantId: string;
  declare key: string;
  declare enabled: boolean;
  declare createdAt: Date;
  declare updatedAt: Date;
}

FeatureFlag.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    tenantId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tenants',
        key: 'id',
      },
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'FeatureFlag',
    tableName: 'feature_flags',
    indexes: [{ fields: ['tenantId', 'key'], unique: true }],
  }
);

// ===== AI INSIGHT MODEL =====
export class AiInsight extends Model {
  declare id: string;
  declare tenantId: string;
  declare entityType: string;
  declare entityId: string;
  declare status: 'pending' | 'approved' | 'rejected';
  declare summary: string | null;
  declare recommendation: string | null;
  declare confidence: number | null;
  declare rationale: string | null;
  declare dataSources: Record<string, any> | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

AiInsight.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    tenantId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tenants',
        key: 'id',
      },
    },
    entityType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    entityId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
    },
    summary: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    recommendation: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    confidence: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    rationale: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    dataSources: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'AiInsight',
    tableName: 'ai_insights',
    indexes: [{ fields: ['tenantId', 'entityType', 'entityId'] }],
  }
);

// ===== AUDIT LOG MODEL =====
export class AuditLog extends Model {
  declare id: string;
  declare tenantId: string;
  declare actorId: string;
  declare action: string;
  declare metadata: Record<string, any>;
  declare createdAt: Date;
  declare updatedAt: Date;
}

AuditLog.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    tenantId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tenants',
        key: 'id',
      },
    },
    actorId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
  },
  {
    sequelize,
    modelName: 'AuditLog',
    tableName: 'audit_logs',
    indexes: [{ fields: ['tenantId', 'createdAt'] }],
  }
);

// ===== USER MODEL =====
export class User extends Model {
  declare id: string;
  declare tenantId: string;
  declare email: string;
  declare password: string;
  declare name: string;
  declare avatar: string;
  declare phone: string;
  declare bio: string;
  declare preferences: Record<string, any>;
  declare isEmailVerified: boolean;
  declare isPhoneVerified: boolean;
  declare createdAt: Date;
  declare updatedAt: Date;

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    tenantId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tenants',
        key: 'id',
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    preferences: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isPhoneVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    indexes: [
      {
        unique: true,
        fields: ['tenantId', 'email'],
      },
    ],
    hooks: {
      beforeCreate: async (user: User) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
      beforeUpdate: async (user: User) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
    },
  }
);

// ===== PROPERTY MODEL =====
export class Property extends Model {
  declare id: string;
  declare tenantId: string;
  declare title: string;
  declare description: string;
  declare location: string;
  declare latitude: number;
  declare longitude: number;
  declare price: number;
  declare beds: number;
  declare baths: number;
  declare sqft: number;
  declare images: string[];
  declare amenities: string[];
  declare type: string;
  declare status: string;
  declare ownerId: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Property.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    tenantId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tenants',
        key: 'id',
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    beds: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    baths: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    sqft: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    images: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    amenities: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    type: {
      type: DataTypes.ENUM('Penthouses', 'Villas', 'Estates', 'Commercial', 'Condos'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('Available', 'Sold', 'Rented', 'Reserved'),
      defaultValue: 'Available',
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'Property',
    tableName: 'properties',
  }
);

// ===== CAR MODEL =====
export class Car extends Model {
  declare id: string;
  declare tenantId: string;
  declare name: string;
  declare brand: string;
  declare model: string;
  declare year: number;
  declare price: number;
  declare pricePerDay: number;
  declare specs: string;
  declare images: string[];
  declare features: string[];
  declare category: string;
  declare availability: boolean;
  declare ownerId: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Car.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    tenantId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tenants',
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    brand: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    model: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    pricePerDay: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    specs: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    images: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    features: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    availability: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'Car',
    tableName: 'cars',
  }
);

// ===== INQUIRY MODEL =====
export class Inquiry extends Model {
  declare id: string;
  declare tenantId: string;
  declare userId: string;
  declare propertyId: string;
  declare message: string;
  declare status: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Inquiry.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    tenantId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tenants',
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    propertyId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'properties',
        key: 'id',
      },
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Contacted', 'Viewed', 'Closed'),
      defaultValue: 'Pending',
    },
  },
  {
    sequelize,
    modelName: 'Inquiry',
    tableName: 'inquiries',
  }
);

// ===== NOTIFICATION MODEL =====
export class Notification extends Model {
  declare id: string;
  declare tenantId: string;
  declare userId: string;
  declare type: string;
  declare title: string;
  declare message: string;
  declare isRead: boolean;
  declare data: Record<string, any>;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Notification.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    tenantId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tenants',
        key: 'id',
      },
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
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    data: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
  },
  {
    sequelize,
    modelName: 'Notification',
    tableName: 'notifications',
  }
);

// ===== CONTACT MODEL =====
export class Contact extends Model {
  declare id: string;
  declare tenantId: string;
  declare name: string;
  declare email: string;
  declare phone: string;
  declare message: string;
  declare isResolved: boolean;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Contact.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    tenantId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tenants',
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isResolved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'Contact',
    tableName: 'contacts',
  }
);

// ===== CAR RESERVATION MODEL =====
export class CarReservation extends Model {
  declare id: string;
  declare tenantId: string;
  declare userId: string;
  declare carId: string;
  declare startDate: Date;
  declare endDate: Date;
  declare totalPrice: number;
  declare status: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

CarReservation.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    tenantId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tenants',
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    carId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'cars',
        key: 'id',
      },
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    totalPrice: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Confirmed', 'Cancelled', 'Completed'),
      defaultValue: 'Pending',
    },
  },
  {
    sequelize,
    modelName: 'CarReservation',
    tableName: 'car_reservations',
  }
);

// ===== ASSOCIATIONS =====
Tenant.hasMany(User, { foreignKey: 'tenantId', as: 'users' });
User.belongsTo(Tenant, { foreignKey: 'tenantId', as: 'tenant' });

Tenant.hasMany(Property, { foreignKey: 'tenantId', as: 'properties' });
Property.belongsTo(Tenant, { foreignKey: 'tenantId', as: 'tenant' });

Tenant.hasMany(Car, { foreignKey: 'tenantId', as: 'cars' });
Car.belongsTo(Tenant, { foreignKey: 'tenantId', as: 'tenant' });

Tenant.hasMany(Inquiry, { foreignKey: 'tenantId', as: 'inquiries' });
Inquiry.belongsTo(Tenant, { foreignKey: 'tenantId', as: 'tenant' });

Tenant.hasMany(Notification, { foreignKey: 'tenantId', as: 'notifications' });
Notification.belongsTo(Tenant, { foreignKey: 'tenantId', as: 'tenant' });

Tenant.hasMany(Contact, { foreignKey: 'tenantId', as: 'contacts' });
Contact.belongsTo(Tenant, { foreignKey: 'tenantId', as: 'tenant' });

Tenant.hasMany(CarReservation, { foreignKey: 'tenantId', as: 'reservations' });
CarReservation.belongsTo(Tenant, { foreignKey: 'tenantId', as: 'tenant' });

Tenant.hasMany(Subscription, { foreignKey: 'tenantId', as: 'subscriptions' });
Subscription.belongsTo(Tenant, { foreignKey: 'tenantId', as: 'tenant' });

Plan.hasMany(Subscription, { foreignKey: 'planId', as: 'subscriptions' });
Subscription.belongsTo(Plan, { foreignKey: 'planId', as: 'plan' });

Tenant.hasMany(FeatureFlag, { foreignKey: 'tenantId', as: 'featureFlags' });
FeatureFlag.belongsTo(Tenant, { foreignKey: 'tenantId', as: 'tenant' });

Tenant.hasMany(AiInsight, { foreignKey: 'tenantId', as: 'aiInsights' });
AiInsight.belongsTo(Tenant, { foreignKey: 'tenantId', as: 'tenant' });

Tenant.hasMany(AuditLog, { foreignKey: 'tenantId', as: 'auditLogs' });
AuditLog.belongsTo(Tenant, { foreignKey: 'tenantId', as: 'tenant' });

Tenant.hasMany(ChatMessage, { foreignKey: 'tenantId', as: 'chatMessages' });
ChatMessage.belongsTo(Tenant, { foreignKey: 'tenantId', as: 'tenant' });

Tenant.hasMany(UserMedia, { foreignKey: 'tenantId', as: 'media' });
UserMedia.belongsTo(Tenant, { foreignKey: 'tenantId', as: 'tenant' });
User.hasMany(Property, { foreignKey: 'ownerId', as: 'properties' });
Property.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

User.hasMany(Car, { foreignKey: 'ownerId', as: 'cars' });
Car.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

User.hasMany(Inquiry, { foreignKey: 'userId', as: 'inquiries' });
Inquiry.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Property.hasMany(Inquiry, { foreignKey: 'propertyId', as: 'inquiries' });
Inquiry.belongsTo(Property, { foreignKey: 'propertyId', as: 'property' });

User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(CarReservation, { foreignKey: 'userId', as: 'carReservations' });
CarReservation.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Car.hasMany(CarReservation, { foreignKey: 'carId', as: 'reservations' });
CarReservation.belongsTo(Car, { foreignKey: 'carId', as: 'car' });

User.hasMany(ChatMessage, { foreignKey: 'userId', as: 'chatMessages' });
ChatMessage.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(UserMedia, { foreignKey: 'userId', as: 'media' });
UserMedia.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export { ChatMessage, UserMedia };
export default sequelize;
