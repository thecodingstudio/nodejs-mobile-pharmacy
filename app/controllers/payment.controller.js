require('dotenv').config();
const User = require('../models/user');
const Store = require('../models/store');
const Quote = require('../models/quote');
const Order = require('../models/order');
const Token = require('../models/app_token');
const Card = require('../models/card');
const Payment = require('../models/payment');
const Notification = require('../models/notification');

const notification = require('../services/notification');
const stripe = require('stripe')(process.env.STRIPE_SK);

/*
 * Create card for loggedIn user.
*/
exports.addCard = async (req, res, next) => {
    try {

        // Find user.
        const user = await User.findByPk(req.user.id);

        // Create card.
        const card = await stripe.customers.createSource(
            user.stripe_id,
            {
                source: {
                    'object': 'card',
                    'number': req.body.number,
                    'exp_month': req.body.exp_month,
                    'exp_year': req.body.exp_year,
                    'cvc': req.body.cvc
                }
            }
        );

        // Save card id in database.
        const result = await Card.create({ card_id: card.id, userId: req.user.id });

        return res.status(200).json({
            message: 'Card saved successfully.',
            data: result
        });

    }
    catch (err) {
        console.log(err);
        return res.status(500).send({ status: 500, ErrorMessage: err.message || 'Something went wrong!' });
    }
}

/*
 * Get saved card for loggedIn user.
*/
exports.getCard = async (req, res, next) => {
    try {

        // Find user.
        const user = await User.findByPk(req.user.id);

        //Find saved card of user.
        try {
            const cards = await stripe.customers.listSources(
                user.stripe_id,
                { object: 'card' }
            );
            // Sending response.
            return res.status(200).json({
                message: cards
            });

        } catch (err) {
            console.log(err);
            return res.status(500).send({ status: 500, ErrorMessage: err.message || 'Something went wrong!' });
        }
    }
    catch (err) {
        console.log(err);
        return res.status(500).send({ status: 500, ErrorMessage: err.message || 'Something went wrong!' });
    }
}


/*
 * Checkout.
*/
exports.checkout = async (req, res, next) => {

    try {

        // Find quote through primary key.
        const quote = await Quote.findByPk(req.body.quoteId);
        const delivery_charge = req.body.delivery_charge;

        const order_payload = {
            quoteId: quote.id,
            payment_method: req.body.payment_method,
            status: 0,
            checkout_type: req.body.checkout_type,
            delivery_charge: Math.round((delivery_charge) * 100) / 100,
            amount: Math.round((parseFloat(quote.price) + delivery_charge) * 100) / 100,
            userId: req.user.id,
            storeId: quote.storeId
        }

        try {

            // Check whether order already exist or not.
            Order.findOne({ where: { quoteId: quote.id } })
                .then(async check => {
                    if (check !== null) {
                        if (check.status === 0 || check.status === 1 || check.status === 2) {
                            return res.status(409).json({ ErrorMessage: 'Order already exisit!' });
                        }
                    }

                    // If oreder not exist then create new address.
                    const order = await Order.create(order_payload);
                    let response;

                    /*
                     * Check whether payment_method is online or COD.
                     * If payment_method online then create payment intent for order.
                    */
                    if (order_payload.payment_method === 0) {

                        // Find user from database.
                        try {
                            const user = await User.findByPk(req.user.id);

                            // Cheack whether user exists in stripe or not. 
                            if (!user.stripe_id) {
                                return res.status(404).json({ ErrorMessage: 'Stipe account not found!' });
                            }

                            // Retrive saved card data using card_id.
                            const cards = await stripe.customers.retrieveSource(
                                user.stripe_id,
                                req.body.card_id
                            );

                            // Create payment intent for user.
                            const payment_intent = await stripe.paymentIntents.create({
                                payment_method_types: ['card'],
                                description: 'Pay for medicine',
                                receipt_email: user.email_id,
                                amount: parseFloat(order.amount) * 100,
                                currency: 'usd',
                                customer: user.stripe_id,
                                payment_method: cards.id
                            });

                            // Payment_payload for ONLINE order.
                            const payment_payload = {
                                transaction_id: payment_intent.client_secret,
                                amount: order.amount,
                                userId: req.user.id,
                                storeId: order.storeID,
                                status: 'PENDING',
                                orderId: order.id
                            }

                            // Create payment for Online order.
                            response = payment_payload;
                            const payment = await Payment.create(payment_payload);

                        }
                        catch (error) {
                            return res.status(404).json({ ErrorMessage: 'Order createtion failed due to craeting payment_intent' });
                        }
                    }

                    /*
                     * Check whether payment_method is online or COD.
                     * If payment_method COD then create payment for order.
                    */
                    if (order_payload.payment_method === 1) {

                        // Payment_payload for COD order.
                        const payment_payload = {
                            transaction_id: 'offline',
                            amount: order.amount,
                            userId: req.user.id,
                            storeId: order.storeID,
                            status: 'PENDING',
                            orderId: order.id
                        }

                        // Create payment for COD order.
                        response = payment_payload;
                        const payment = await Payment.create(payment_payload);

                    }

                    // Send push notification all store.
                    const message_notification = {
                        notification: {
                            title: 'Order Status',
                            body: 'Order created successfully.'
                        }
                    };

                    try {

                        // Find pharmacist device_token for send notification.
                        const pharmacist = await Store.findByPk(quote.storeId);
                        const registrationToken = await Token.findOne({ where: { userId: pharmacist.userId } });

                        // Send push notification.
                        notification.createNotification(registrationToken.device_token, message_notification);
                        const payload = {
                            sender: req.user.name,
                            title: 'Order Status',
                            body: 'Order created successfully.',
                            receiver: pharmacist.store_name
                        }

                        await Notification.create(payload);

                    }
                    catch (error) {
                        return res.status(404).json({
                            ErrorMessage: 'Device token not found or valid!'
                        });
                    }

                    // Send success response.
                    return res.status(200).json({
                        message: 'Order palced successfully..',
                        data: response
                    });

                })
                .catch(err => {
                    if (!err.statusCode) {
                        err.statusCode = 500;
                    }
                    next(err);
                });

        }
        catch (err) {
            return res.status(404).json({
                ErrorMessage: 'Order creation failed!'
            });
        }
    }
    catch (err) {
        return res.status(404).json({
            ErrorMessage: 'Quote not found!'
        });
    }
}