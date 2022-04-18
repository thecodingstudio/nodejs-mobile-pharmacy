const User = require('../models/user');
const Store = require('../models/store');
const Quote = require('../models/quote');
const Token = require('../models/app_token');

const notification = require('../services/notification');
const Prescription = require('../models/prescription');
const Notification = require('../models/notification');
const Medicine = require('../models/medicine');
const Prescription_image = require('../models/prescription_image');


/*
 * Get all prescription requests.
 * Send full object of requests.
*/
exports.getRequests = async (req, res, next) => {

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
            medicine_list.push(medicals[i].dataValues.name);
        }

        // Fetch all images of prescription and push to images_list array.
        const images = await Prescription_image.findAll({ where: { prescriptionId: requets[i].dataValues.id } });
        for (let i = 0; i < images.length; i++) {
            images_list.push(images[i].dataValues.path);
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
                userId : req.user.id
            }

            await Notification.create(payload);
        }
        catch (error) {
            throw error;
        }

        return res.status(200).json({
            message: 'Quote created successfully!'
        })
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });

}