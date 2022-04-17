const Sequelize = require('sequelize'),
    { v4: uuidv4 } = require('uuid');

const sequelize = require('../utils/database');

const Store = sequelize.define('store', {
    store_name: {
        type: Sequelize.STRING(50),
        allowNull: false
    },
    store_image: {
        type: Sequelize.STRING(255),
        defaultValue: null
    },
    license_id: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
    },
    pharmacy_id: {
        type: Sequelize.UUID,
        allowNull: true,
        unique: true
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
Store.beforeCreate(store => store.pharmacy_id = uuidv4().split('-')[0].toUpperCase());

module.exports = Store;