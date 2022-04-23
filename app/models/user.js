const Sequelize = require('sequelize');

const sequelize = require('../utils/database');

const User = sequelize.define('user', {
    role: {
        type: Sequelize.TINYINT(1),
        allowNull: false,
        validate: {
            notEmpty: true
        },
        comment: '0 = Admin, 1 = Coustomer, 2 = Pharmacist',
    },
    name: {
        type: Sequelize.STRING(50),
        allowNull: false
    },
    email: {
        type: Sequelize.STRING(50),
        allowNull: false,
        validate: {
            notEmpty: true,
            isEmail: true
        }
    },
    gender: {
        type: Sequelize.ENUM('MALE','FEMALE'),
        allowNull: false,
        validate: {
            notEmpty: true
        },
        comment: 'Male,Female'
    },
    password: {
        type: Sequelize.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    image: {
        type: Sequelize.STRING(100),
        defaultValue: null
    },
    phone: {
        type: Sequelize.BIGINT(20),
        defaultValue: null
    },
    stripe_id : {
        type : Sequelize.TEXT
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
    },
    resetToken: {
        type: Sequelize.TEXT,
        defaultValue: null
    },
    resetTokenExpiration: {
        type: Sequelize.DATE,
        defaultValue: null
    },
    createdAt: {
        type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    },
    updatedAt: {
        type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    }
});

module.exports = User;