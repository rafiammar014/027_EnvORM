'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(path.join(__dirname, '..', 'config', 'config.js'))[env];
const db = {};

if (!config) {
  throw new Error(`No database configuration found for NODE_ENV="${env}"`);
}

let sequelize;
if (config.use_env_variable) {
  const connectionString = process.env[config.use_env_variable];

  if (!connectionString) {
    throw new Error(`Missing required environment variable: ${config.use_env_variable}`);
  }

  sequelize = new Sequelize(connectionString, config);
} else {
  const missingSettings = ['database', 'username', 'host']
    .filter((setting) => !config[setting]);

  if (missingSettings.length > 0) {
    throw new Error(`Missing database configuration: ${missingSettings.join(', ')}`);
  }

  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
