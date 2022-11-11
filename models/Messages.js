import { DataTypes, Model } from "sequelize";
import sequelize from "../services/sequelize";
import Users from "./Users";


class Messages extends Model {

}

Messages.init({
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  text: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('text', 'voice', 'video'),
    allowNull: false,
    defaultValue: 'text'
  },
  seen: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  sequelize,
  modelName: 'messages',
  tableName: 'messages'
});

Messages.belongsTo(Users, {
  foreignKey: 'from',
  as: 'userFrom',
  onUpdate: 'cascade',
  onDelete: 'cascade'
});

Messages.belongsTo(Users, {
  foreignKey: 'to',
  as: 'userTo',
  onUpdate: 'cascade',
  onDelete: 'cascade'
});

export default Messages;
