const Sequelize = require('sequelize');

const sequelize = require('../utils/database');

const Card = sequelize.define('card', {
    card_id: {
        type: Sequelize.STRING(45),
        allowNull: true
    },
    is_test: {
        type: Sequelize.TINYINT(1),
        defaultValue: 1
    },
    is_verify: {
        type: Sequelize.TINYINT(1),
        defaultValue: 0
    },
    is_active: {
        type: Sequelize.TINYINT(1),
        defaultValue: 0
    },
    is_delete: {
        type: Sequelize.TINYINT(1),
        defaultValue: 0
    }
}, {
    timestamps: true
});

module.exports = Card;