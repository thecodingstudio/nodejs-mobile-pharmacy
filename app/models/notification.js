const Sequelize = require('sequelize');

const sequelize = require('../utils/database');

const Notification = sequelize.define('notification', {
    sender: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    receiver: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    title: {
        type: Sequelize.STRING(100),
        defaultValue: null,
    },
    body: {
        type: Sequelize.TEXT + ' CHARSET utf8mb4 COLLATE utf8mb4_bin',
        defaultValue: null,
    },
    payload: {
        type: Sequelize.INTEGER,
        defaultValue: null,
    },   
    is_seen: {
        type: Sequelize.BOOLEAN,
        defaultValue: 0,
        comment: '0 = Not_seen, 1 = Seen'
    },
    is_test: {
        type: Sequelize.TINYINT(1),
        defaultValue: 1
    },
    is_delete: {
        type: Sequelize.TINYINT(1),
        defaultValue: 0
    },
    createdAt: {
        type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    },
    updatedAt: {
        type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    }
},
{
    freezeTableName: true,
    timestamps: true,
});

module.exports = Notification;