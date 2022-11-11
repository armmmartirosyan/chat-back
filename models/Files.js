import { DataTypes, Model } from "sequelize";
import sequelize from "../services/sequelize";
import Messages from "./Messages";

class Files extends Model {

}

Files.init({
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  name: {
    type: DataTypes.TEXT(),
  },
  originalName: {
    type: DataTypes.TEXT(),
  },
  size: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  mimetype: {
    type: DataTypes.CHAR(255),
  },
}, {
  sequelize,
  modelName: 'files',
  tableName: 'files'
});

Files.belongsTo(Messages, {
  foreignKey: 'messageId',
  as: 'message',
  onUpdate: 'cascade',
  onDelete: 'cascade'
});

Messages.hasMany(Files, {
  foreignKey: 'messageId',
  as: 'files',
  onUpdate: 'cascade',
  onDelete: 'cascade'
});

export default Files;
