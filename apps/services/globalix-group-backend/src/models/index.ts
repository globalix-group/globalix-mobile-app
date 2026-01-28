import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// ===== USER MODEL =====
export class User extends Model {
  declare id: string;
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
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
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

export default sequelize;
