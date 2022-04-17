const Sequelize = require('sequelize');

const sequelize = require('../utils/database');

const Prescription = sequelize.define('prescription', {
    name: {
        type: Sequelize.STRING(45),
        allowNull: true
    },
    text_note: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    status: {
        type: Sequelize.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
        comment: '0 = pending, 1  = completed, 2 = Rejected'
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

module.exports = Prescription;