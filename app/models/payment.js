const Sequelize = require('sequelize');

const sequelize = require('../utils/database');

const Payment = sequelize.define('payment', {
    transaction_id: {
        type: Sequelize.STRING,
    },
    amount: {
        type: Sequelize.FLOAT,
    },
    status: {
        type: Sequelize.ENUM('PENDING', 'SUCCESS', 'FAILED'),
        defaultValue: 'PENDING',
        comment: 'PENDING, SUCCESS, FAILED'
    },
    is_test: {
        type: Sequelize.TINYINT(1),
        defaultValue: 0
    }
}, {
    timestamps: true
});

module.exports = Payment;