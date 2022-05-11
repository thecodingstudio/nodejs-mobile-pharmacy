const User = require('../models/user');
const Store = require('../models/store');
const Quote = require('../models/quote');
const Token = require('../models/app_token');
const Order = require('../models/order');
const Payment = require('../models/payment');
const Prescription = require('../models/prescription');
const Notification = require('../models/notification');
const Medicine = require('../models/medicine');
const Prescription_image = require('../models/prescription_image');

const notification = require('../services/notification');

/*
 * Get all prescription requests.
 * Send full object of requests.
*/
exports.getRequests = async (req, res, next) => {
    // Check user is customer or not.
    if (req.user.role === 1) {
        return res.status(400).json({
            ErrorMessage: 'Customer can not access this routes!'
        })
    }

    // Pagination logic
    const currentPage = req.query.page || 1;
    const perPage = 2;

    // Find all prescription requests.
    const requets = await Prescription.findAll({
        offset: (currentPage - 1) * perPage,
        limit: perPage,
        where: { is_active: 1 }
    });

    let list = [];

    // Push all data of request.
    for (let i = 0; i < requets.length; i++) {

        // Find user who created prescription.
        const user = await User.findOne({ where: { id: requets[i].dataValues.userId } });

        // Fetch all medicine of prescription.
        const medicals = await Medicine.findAll({ where: { prescriptionId: requets[i].dataValues.id } });

        // Count all quotes on prescription.
        const quote = await Quote.findAll({ where: { prescriptionId: requets[i].dataValues.id } });
        let medicine_list = [], images_list = [];

        // Push medicine details to medicine_list array.
        for (let i = 0; i < medicals.length; i++) {
            medicine_list.push(medicals[i].name);
        }

        // Fetch all images of prescription and push to images_list array.
        const images = await Prescription_image.findAll({ where: { prescriptionId: requets[i].dataValues.id } });
        for (let i = 0; i < images.length; i++) {
            images_list.push(images[i].url);
        }

        // Push all data in object form to list for response. 
        list.push({
            id: requets[i].dataValues.id,
            userId: user.dataValues.name,
            user_image: user.dataValues.image,
            prescription_name: requets[i].dataValues.name,
            Prescription_image: images_list[0],
            text_note: requets[i].dataValues.text_note,
            createdAt: requets[i].dataValues.createdAt,
            images_list: images_list,
            medicine_list: medicine_list,
            createdAt: requets[i].dataValues.createdAt,
            total_quotes: quote.length
        });
    }

    // Check whether list is empty or not.
    if (list.length === 0) {
        return res.status(400).json({ ErrorMessage: 'No records found!' })
    }

    // Sending success response.
    return res.status(200).json({
        message: 'Data fetched successfully..',
        data: list
    });

}


/*
 * Add quote on prescription.
 * Send notification to user.
*/
exports.addQuote = async (req, res, next) => {

    // Check user is customer or not.
    if (req.user.role === 1) {
        return res.status(400).json({
            ErrorMessage: 'Customer can not access this routes!'
        })
    }

    // Fetch store details for logged-In user.
    const store = await Store.findOne({ where: { userId: req.user.id } });

    const payload = {
        store_name: store.store_name,
        price: req.body.price,
        text_note: req.body.text_note,
        storeId: store.id,
        prescriptionId: req.query.prescriptionId
    }

    // Create quote.
    Quote.create(payload).then(async quote => {

        // Create push notification message.
        const message_notification = {
            notification: {
                title: quote.store_name + ' Create an quotes on your prescription',
                body: quote.text_note
            }
        };

        /*
         * Send notification to user who created priscription.
         * Store notification, sender, receiver, etc. details in database. 
        */
        try {

            // Find prescription.
            const priscription = await Prescription.findOne({ where: { id: req.query.prescriptionId } });

            console.log(priscription.userId);
            // Find user.
            const user = await User.findByPk(priscription.userId);

            // Find device_token for send noticication.
            const registrationToken = await Token.findOne({ where: { userId: priscription.userId } });

            // Srore and send notifications.
            notification.createNotification(registrationToken.device_token, message_notification);
            const payload = {
                sender: req.user.name,
                title: quote.store_name + ' Create an quotes on your prescription',
                body: quote.text_note,
                receiver: user.name,
                userId: req.user.id
            }

            await Notification.create(payload);
        }
        catch (error) {
            return res.status(400).json({
                message: 'Some thing went wrong!'
            })
        }

        return res.status(200).json({
            message: 'Quote created successfully!'
        });

    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });

}

/*
 * Collect payment at store or COD.
 * Send notification to customer.
*/
exports.collect_payment_offline = async (req, res, next) => {

    // Find order through orderId.
    try {
        const order = await Order.findByPk(req.body.orderId);

        // Make order status as in-progress
        order.status = 1;
        await order.save();

        const payment = await Payment.findOne({ where: { orderId: order.id } });

        // Check whether payment is already done or not.
        if (payment.status !== 'SUCCESS') {

            payment.status = 'SUCCESS'
            await payment.save();

            // Send push notification to customer.
            const message_notification = {
                notification: {
                    title: 'Payment Status',
                    body: 'Payment done successfully.'
                }
            };
            try {

                // Find customer device token to send notification.
                const cusromer = await User.findByPk(payment.userId);

                const registrationToken = await Token.findOne({ where: { userId: cusromer.id } });

                // Send notification.
                notification.createNotification(registrationToken.device_token, message_notification);
                const payload = {
                    sender: req.user.name,
                    title: 'Payment Status',
                    body: 'Payment done successfully.',
                    receiver: cusromer.store_name
                }

                // Store notification. 
                await Notification.create(payload);

            } 
            catch (error) {
                return res.status(400).json({ ErrorMessage : "Notification sending failed!"});
            }

            const response_data = {
                orderId: payment.orderId,
                amount: payment.amount,
                order_status: order.status,
                payment_status: payment.status
            };

            // Send success response.
            return res.status(200).json({
                message: 'Payment done successfully.',
                data: response_data
            });

        } 
        else {
            return res.status(409).json({
                message: 'Payment already done.'
            });
        }

    } 
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

/*
 * When payment done and order complete successfully done.
 * Send notification to customer.
*/
exports.changeOrderStatus = async (req, res, next) => {
    // Check user is customer or not.
    if (req.user.role === 1) {
        return res.status(400).json({
            ErrorMessage: 'Customer can not access this routes!'
        })
    }

    // Fetch order and payment status.
    const order = await Order.findOne({ where: { quoteId: req.body.quoteId } });

    const payment = await Payment.findOne({ where: { orderId: order.id } });

    if (payment.status === 'SUCCESS') {

        if (order.status === 1) {
            if (order.checkout_type === 0 || order.checkout_type === 1) {
                order.status = 3;
                await order.save();

                // Send push notification all store.
                const message_notification = {
                    notification: {
                        title: 'Order Status',
                        body: 'Order Completed successfully.'
                    }
                };
                try {
                    const user = await User.findByPk(payment.userId);
                    const registrationToken = await Token.findOne({ where: { userId: user.id } });
                    notification.createNotification(registrationToken.device_token, message_notification);
                    const payload = {
                        sender: req.user.name,
                        title: 'Order Status',
                        body: 'Order Completed successfully.',
                        receiver: user.name
                    }
                    await Notification.create(payload);
                } catch (error) {
                    throw error;
                }

                return res.status(200).json({
                    message: 'Order completed successfully and user picked up order from store.'
                })
            }
            order.status = 2;
            await order.save();

            return res.status(200).json({
                message: 'Order completed and delivered successfully.'
            });
        }
        return res.status(400).json({ message: 'Order is either completed or cancelled!' });

    } else {
        return res.status(400).json({ message: 'Complete payment first!' });
    }


}