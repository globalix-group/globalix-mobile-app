import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { v4 as uuidv4 } from 'uuid';

// ===== CHAT MESSAGE MODEL =====
export class ChatMessage extends Model {
  declare id: string;
  declare tenantId: string;
  declare userId: string;
  declare message: string;
  declare fromAdmin: boolean;
  declare read: boolean;
  declare createdAt: Date;
  declare updatedAt: Date;
}

ChatMessage.init(
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
      onDelete: 'CASCADE',
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    fromAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'ChatMessage',
    tableName: 'chat_messages',
    timestamps: true,
    indexes: [
      {
        fields: ['tenantId'],
      },
      {
        fields: ['userId'],
      },
      {
        fields: ['createdAt'],
      },
      {
        fields: ['read'],
      },
    ],
  }
);

export default ChatMessage;
