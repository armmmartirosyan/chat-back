import { DataTypes, Model } from "sequelize";
import md5 from "md5";
import sequelize from "../services/sequelize";

const { PASSWORD_SECRET } = process.env;

class Users extends Model {
  static passwordHash = (val) => md5(md5(val) + PASSWORD_SECRET)
}

Users.init({
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    unique: 'email',
    allowNull: false,
  },
  password: {
    type: DataTypes.CHAR(32),
    allowNull: false,
    set(val) {
      if (val) {
        this.setDataValue('password', Users.passwordHash(val))
      }
    },
    get() {
      return undefined;
    }
  },
  status: {
    type: DataTypes.ENUM('active', 'pending', 'deleted'),
    allowNull: false,
    defaultValue: 'pending'
  },
  lastVisit: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true,
    get() {
      let avatar = this.getDataValue('avatar');
      const email = this.getDataValue('email')
      if (!avatar && email) {
        return `https://www.gravatar.com/avatar/${md5(email.toLowerCase())}?d=wavatar`;
      }
      return avatar
    }
  },
  isOnline: {
    type: DataTypes.BOOLEAN,
  }
}, {
  sequelize,
  modelName: 'users',
  tableName: 'users'
});

export default Users;
