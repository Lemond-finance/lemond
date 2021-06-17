'use strict';
import Sequelize from 'sequelize';
import configs from './db.json';
const Op = Sequelize.Op;

const dbHost = configs.mysql.host,
    dbPort = configs.mysql.port,
    dbUsername = configs.mysql.username,
    dbPassword = configs.mysql.password,
    dbName = configs.mysql.dbName;

//mysql connect option
const db = {
    sequelize: new Sequelize(dbName, dbUsername, dbPassword, {
        host: dbHost,
        dialect: 'mysql',
        port: dbPort,
        operatorsAliases: Op,
        pool: {
            max: 30,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        define: {
            freezeTableName: true,
            timestamps: false,
        }
    })
};

//user table model
db.Lend = db.sequelize.import("../model/lend.js")
db.Airdrop = db.sequelize.import("../model/airdrop.js")
db.Op = Op;

export default db;
