const Sequelize = require('sequelize');

const sequelize = require('../utils/database');

const Quote = sequelize.define('quote', {
    store_name: {
        type: Sequelize.STRING(50),
        allowNull: false
    },
    price: {
        type : Sequelize.DECIMAL(5,2),
        allowNull : false
    },
    text_note: {
        type: Sequelize.TEXT,
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

module.exports = Quote;