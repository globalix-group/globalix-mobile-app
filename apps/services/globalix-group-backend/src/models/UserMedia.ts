import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { v4 as uuidv4 } from 'uuid';

// ===== USER MEDIA MODEL =====
export class UserMedia extends Model {
  declare id: string;
  declare tenantId: string;
  declare userId: string;
  declare type: 'image' | 'video' | 'audio';
  declare url: string;
  declare thumbnailUrl: string | null;
  declare caption: string | null;
  declare privacy: 'public' | 'private' | 'followers';
  declare likes: number;
  declare views: number;
  declare duration: number | null; // For videos (in seconds)
  declare width: number | null;
  declare height: number | null;
  declare fileSize: number | null; // In bytes
  declare mimeType: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

UserMedia.init(
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
      type: DataTypes.ENUM('image', 'video', 'audio'),
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    thumbnailUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    caption: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    privacy: {
      type: DataTypes.ENUM('public', 'private', 'followers'),
      defaultValue: 'public',
    },
    likes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Video duration in seconds',
    },
    width: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    height: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'File size in bytes',
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'UserMedia',
    tableName: 'user_media',
    timestamps: true,
    indexes: [
      { fields: ['tenantId'] },
      { fields: ['userId'] },
      { fields: ['type'] },
      { fields: ['createdAt'] },
    ],
  }
);

export default UserMedia;
