const Sequelize = require('sequelize');

const sequelize = require('../utils/database');

const Medicine = sequelize.define('medicine', {
    name: {
        type: Sequelize.STRING(100),
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

module.exports = Medicine;