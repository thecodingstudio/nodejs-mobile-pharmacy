const Sequelize = require('sequelize');

const sequelize = require('../utils/database');

const Address = sequelize.define('address', {
    primary_address: {
        type: Sequelize.STRING(45),
        allowNull: true
    },
    addition_address_info: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    address_type: {
        type: Sequelize.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
        comment: '0 = Home, 1  = Office, 2 = Location'
    },
    latitude : {
        type : Sequelize.STRING,
        allowNull: false,
        defaultValue : 21.228125
    },
    longitude : {
        type : Sequelize.STRING,
        allowNull: false,
        defaultValue : 72.833771
    },
    is_select : {
        type: Sequelize.TINYINT(1),
        allowNull: false
    },
    is_test: {
        type: Sequelize.TINYINT(1),
        defaultValue: 1
    },
    is_verify: {
        type: Sequelize.TINYINT(1),
        defaultValue: 1
    },
    is_active: {
        type: Sequelize.TINYINT(1),
        defaultValue: 1
    },
    is_delete: {
        type: Sequelize.TINYINT(1),
        defaultValue: 0
    }
}, {
    timestamps: true
});

module.exports = Address;