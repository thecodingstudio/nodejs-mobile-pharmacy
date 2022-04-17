const Sequelize = require('sequelize');

const sequelize = require('../utils/database');

const Prescription_image = sequelize.define('prescription_image', {
    name: {
        type: Sequelize.STRING(255),
        allowNull: false
    },
    url: {
        type: Sequelize.STRING(255),
        allowNull: false
    },
    type : {
        type: Sequelize.STRING(255),
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

module.exports = Prescription_image;