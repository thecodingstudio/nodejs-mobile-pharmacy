const Sequelize = require('sequelize');

const sequelize = require('../utils/database');

const Order = sequelize.define('order', {
    payment_method: {
        type: Sequelize.TINYINT(1),
        defaultValue: 0
    },
    status: {
        type: Sequelize.TINYINT(1),
        defaultValue: 0,
        comment :'0 = ordered, 1 = in-progress, 2 = delivered 3 = picked up, 4=cancelled'
    },
    checkout_type : {
        type: Sequelize.TINYINT(1),
        defaultValue: 0
    },
    delivery_charge : {
        type : Sequelize.FLOAT,
    },
    amount :{
        type : Sequelize.FLOAT,
    },
    is_test: {
        type: Sequelize.TINYINT(1),
        defaultValue: 0
    },
    is_verify: {
        type: Sequelize.TINYINT(1),
        defaultValue: 0
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

module.exports = Order;