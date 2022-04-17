const Sequelize = require('sequelize');

const sequelize = require('../utils/database');

const Token = sequelize.define('app_tokens', {
    token: {
        type: Sequelize.TEXT,
        allowNull: true,
        validate: {
            notEmpty: true
        }
    },
    token_type: {
        type: Sequelize.ENUM('access_token'),
        allowNull: false,
        defaultValue: 'access_token'
    },
    status: {
        type: Sequelize.ENUM('active', 'expired'),
        allowNull: false,
        defaultValue: 'active'
    },
    expiry: {
        type: Sequelize.STRING(30),
        defaultValue: null,
    },
    access_count: {
        type: Sequelize.INTEGER,
        defaultValue: null,
    },
    device_token: {
        type: Sequelize.STRING(255),
        defaultValue: null,
    },
    device_type: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: '0 = iOS, 1 = Android, 2 = Postman, 3 = Browser'
    },
    is_delete: {
        type: Sequelize.BOOLEAN,
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

module.exports = Token;