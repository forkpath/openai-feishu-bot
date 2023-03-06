const config = require('../config/config.js');

const Sequelize = require('sequelize');
const sequelize = new Sequelize(config.db.name, config.db.user, config.db.passwd, {
  host: config.db.host,
  port: config.db.port,
  dialect: 'postgres',
  dialectOptions: {
    supportBigNumbers: true
  },
  timezone: '+08:00',

  operatorsAliases: false,

  pool: {
    max: config.db.pool.maxConn,
    min: config.db.pool.minConn,
    acquire: config.db.pool.acquire,
    idle: config.db.pool.idle
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require('./user.model.js')(sequelize);
db.question = require('./question.model.js')(sequelize);

module.exports = db;
