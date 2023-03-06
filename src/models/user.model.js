// @CreateTime: 2023/3/2
// @Author: key7men
// @Contact: key7men@gmail.com
// @Last Modified By: key7men
// @Last Modified Time: 23:03
// @Description: 用户每天凌晨，会重置免费额度，即free字段会在每天0点重置为1；total字段根据会员等级level来判断重置数量

const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  return sequelize.define('user', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      comment: '主键id，直接用飞书用户的id'
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: '',
      comment: '用户名'
    },
    consumed: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '消费次数'
    },
    free: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: '免费次数'
    },
    total: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '会员当日次数'
    },
    level: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '用户等级,0表示非会员，1表示周会员，每天10个问题，每周9.9，2表示月会员，每天100个问题，每月49.9'
    }
  }, {
    timestamps: true,
    createAt: 'create_time',
    updateAt: 'update_time'
  });
};
