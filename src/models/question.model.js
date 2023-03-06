// @CreateTime: 2023/3/2
// @Author: key7men
// @Contact: key7men@gmail.com
// @Last Modified By: key7men
// @Last Modified Time: 23:03
// @Description: 记录消息事件ID，同一个事件，仅处理一次，并记录每个问题的内容与回答，以及回答所使用的tokens（tokens作为openai api消耗的一个计量单位）

const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  return sequelize.define('question', {
    id: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      comment: '主键id，直接用飞书事件的id'
    },
    user_id: {
      type: DataTypes.STRING(255),
      defaultValue: '',
      comment: '提问者'
    },
    question_content: {
      type: DataTypes.TEXT,
      defaultValue: '',
      comment: '问题内容'
    },
    answer_content: {
      type: DataTypes.TEXT,
      defaultValue: '',
      comment: '回答内容'
    },
    cost: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
      comment: '消耗的tokens'
    }
  }, {
    timestamps: true,
    createAt: 'create_time',
    updateAt: 'update_time'
  });
};
