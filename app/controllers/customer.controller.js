const fs = require('fs');
const User = require('../models/user');
const Store = require('../models/store');
const Quote = require('../models/quote');
const Address = require('../models/address');
const Token = require('../models/app_token');
const Medicine = require('../models/medicine');
const Notification = require('../models/notification');
const Prescription = require('../models/prescription');
const Prescription_image = require('../models/prescription_image');

const notification = require('../services/notification');
const path = require('path');


/*
 * Get all pharmacy store.
 * In redius of 50 km to user's current location.
*/
exports.getNearByPharmacy = (req, res, next) => {

    // Find all active pharmacy store.
    Store.findAll({ where: { is_active: '1' } })
        .then(async stores => {

            // Check whether store exist or not.
            if (stores.length === 0) {
                return res.status(404).json({
                    ErrorMessage: "No store found!"
                });
            }

            let store_list = [];
            let flag = false;

            // Fetch user's selected/current address.
            const user = await Address.findOne({ where: { id: req.params.id } });

            // Check whether address exist or not.
            if (!user) {
                return res.status(404).json({
                    ErrorMessage: "Address not found!"
                });
            }

            // user's latitude and longitude.
            let user_latitude = user.latitude;
            let user_longitude = user.longitude;

            // Push pharmacy store with required data.
            for (i = 0; i < stores.length; i++) {

                // Fetch pharmacy store's address.
                const address = await Address.findOne({ where: { userId: stores[i].userId } });

                // Store's latitude and longitude.
                let store_latitude = address.latitude;
                let store_longitude = address.longitude;

                // Earth's redius.
                const R = 6371; // kms

                // φ, λ in radians
                const φ1 = (user_latitude * Math.PI) / 180;
                const φ2 = (store_latitude * Math.PI) / 180;

                // Difference of φ and λ in radians
                const Δφ = ((store_latitude - user_latitude) * Math.PI) / 180;
                const Δλ = ((store_longitude - user_longitude) * Math.PI) / 180;

                const a =
                    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

                // Distence between user's location to srote's location in km.
                const d = R * c;

                // Check whether distence is less then 50 km.
                if (d < 50) {

                    // Push store data and distrnce to store_list.
                    store_list.push({
                        id: stores[i].id,
                        store_image: stores[i].store_image,
                        store_name: stores[i].store_name,
                        address: address.primary_address,
                        distance: Math.round(d * 100) / 100
                    });
                }
                flag = true;
            }

            // Check if flag status.
            if (!flag) {
                console.log(store_list);
                return res.send({
                    message: 'No medicals found near your area!'
                });
            }

            store_list.sort(function (a, b) {
                return a.distance - b.distance;
            });

            // Send response.
            return res.send({
                message: 'Near by medicals list',
                data: store_list,
                total_store: store_list.length
            });

        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });

}


/*
 * Create prescription..
 * Save multiple images for prescription through from-data.
 * Save multiple medicine for prescription.
 * Send notifications.
*/
exports.createPrescription = async (req, res, next) => {

    // Check user is customer or not.
    if (req.user.role === 2) {
        return res.status(400).json({
            ErrorMessage: 'Pharmacist can not create prescription!'
        })
    }

    const payload = {
        text_note: req.body.text_note,
        userId: req.user.id
    }

    Prescription.create(payload)
        .then(async prescription => {

            // Check for select request files or not.
            if (!req.files) {
                return res.status(404).json({
                    message: "No file selected!"
                })
            }

            let image_list = [], medicine_list = [];

            /*
             * Check selected files are image or not.
             * Push single file with required data to image_list array
            */
            for (let i = 0; i < req.files.length; i++) {

                if (req.files[i].mimetype === 'image/png' || req.files[i].mimetype === 'image/jpg' || req.files[i].mimetype === 'image/jpeg') {

                    // Push image in image_list
                    image_list.push({
                        name: req.files[i].originalname,
                        url: req.files[i].path,
                        type: req.files[i].mimetype,
                        prescriptionId: prescription.id
                    });

                }
                else {
                    return res.status(409).json({
                        EorroMessage: 'Uploaded File is not image'
                    });
                }
            }

            // Parse object to JSON.
            const parseData = JSON.parse(req.body.medicine);

            // Push all medicine with required data to medicine_list. 
            for (let i in parseData) {
                medicine_list.push({
                    name: parseData[i],
                    prescriptionId: prescription.id
                });
            }

            // Store prescription images and medicines to database
            try {

                const storedImage = await Prescription_image.bulkCreate(image_list);
                const storeMedicine = await Medicine.bulkCreate(medicine_list);

                let resMed = [], resImg = [];

                // Push data to medicine payload.
                for (let i = 0; i < storeMedicine.length; i++) {
                    resMed.push({
                        id: storeMedicine[i].id,
                        name: storeMedicine[i].name
                    });
                }

                // Push data to image payload.
                for (let i = 0; i < storedImage.length; i++) {
                    resImg.push({
                        name: storedImage[i].name,
                        type: storedImage[i].type,
                        url: storedImage[i].url
                    });
                }

                // Save prescription name as first medicine of prescription.
                prescription.name = storeMedicine[0].name;
                await prescription.save();

                console.log('Prescription created Successfully..');

                // Create push notification message.
                const message_notification = {
                    notification: {
                        title: prescription.name,
                        body: prescription.text_note
                    }
                };

                /*
                 * Send notification to all active pharmacy.
                 * Store notification, sender, receiver, etc. details in database. 
                */

                // Find all pharmasict.
                const pharmacist = await User.findAll({ where: { role: 2 } });

                // Map element with id.
                const pharmacist_userId = pharmacist.map(element => element.id);

                // Srore and send notifications.
                for (let i = 0; i < pharmacist_userId.length; i++) {

                    const registrationToken = await Token.findOne({ where: { userId: pharmacist_userId[i] } });

                    notification.createNotification(registrationToken.device_token, message_notification);
                    const payload = {
                        sender: req.user.name,
                        title: prescription.name,
                        body: prescription.text_note,
                        receiver: pharmacist[i].name,
                        userId: req.user.id
                    }

                    await Notification.create(payload);
                }

                // Send response.
                return res.status(200).json({
                    id: prescription.id,
                    name: prescription.name,
                    image: resImg,
                    medicine: resMed,
                    text_note: prescription.text_note,
                    message: 'Prescription created Successfully..'
                });

            }
            catch (error) {

                // All prescription data deleted, If any error ouccurs.
                prescription.destroy();
                console.log(error);
                return res.status(400).json({ ErrorMessage: 'Prescription creation failed!' });

            }
        }).
        catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });

}


/*
 * Get all prescription list that created by logged-In user.
*/
exports.getPrescriptionsList = async (req, res, next) => {

    // Check whether user is customer or not.
    if (req.user.role === 2) {
        return res.status(400).json({
            ErrorMessage: 'Pharmacist can not create prescription!'
        });
    }

    // Pagination logic.
    const currentPage = req.query.page || 1;
    const perPage = 2;

    let result = [];

    const state = req.query.state || 'current';

    // Check whether prescription state current or past.
    if (state === 'current') {

        // Find all prescription with pagination logic.
        try {
            const current = await Prescription.findAll({
                offset: (currentPage - 1) * perPage,
                limit: perPage,
                where: { status: 0, userId: req.user.id }
            });

            result = current
        }
        catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        }
    }

    // Check whether prescription state current or past.
    if (state === 'past') {

        // Find all prescription with pagination logic.
        try {
            const past = await Prescription.findAll({
                offset: (currentPage - 1) * perPage,
                limit: perPage,
                where: { status: { [Op.ne]: 0 }, userId: req.user.id }
            });

            result = past
        }
        catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        }
    }

    // Check prescription's result lenght.
    if (result.length === 0) {
        return res.status(400).json({ ErrorMessage: 'No records found!' })
    }

    let list = [];

    // Push prescription data to list for reponse.
    for (let i = 0; i < result.length; i++) {
        list.push({
            id: result[i].id,
            text_note: result[i].text_note,
            createdAt: result[i].createdAt,
        });
    }

    // Send success response.
    return res.status(200).json({
        message: "prescription list fetched successfully..",
        data: {
            list: list
        }
    })

}


/*
 * Delete user's pending prescription.
*/
exports.deletePrescription = (req, res, next) => {

    // Find prescription through it's id.
    Prescription.findOne({ where: { id: req.params.id } })
        .then(async prescription => {

            // Check whether prescription exist or not
            if (!prescription) {
                const error = new Error('Prescription not exists!');
                error.statusCode = 404;
                throw error;
            }

            // Fetch all prescription's images to delete from server.
            const images = await Prescription_image.findAll({ where: { prescriptionId: prescription.id } });

            // Delete prescription's all images.
            for (let i = 0; i < images.length; i++) {
                clearImage(images[i].url)
            }

            // Delete prescription to database.
            prescription.destroy();

            // Sending success response.
            return res.status(200).json({
                message: 'Prescription deleted successfully..',
            });

        }).catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });

}


/*
 * Delete user's prescription.
*/
exports.get = async (req, res, next) => {

    const presId = req.query.prescriptionId;
    let prescription = {}, image = [], medicine = [], quote = [];

    try {
        // Fetch prescription all images and Push all fetched images to image array.
        const images = await Prescription_image.findAll({ where: { prescriptionId: presId } });
        for (let i = 0; i < images.length; i++) {
            image.push({ url: images[i].path });
        }

        // Fetch prescription all medicine and Push all fetched medicine to medicine array.
        const medicines = await Medicine.findAll({ where: { prescriptionId: presId } });
        for (let i = 0; i < medicines.length; i++) {
            medicine.push({ name: medicines[i].name });
        }

        // Fetch prescription all quote with required data and Push all fetched quote data to quote array.
        const quotes = await Quote.findAll({ where: { prescriptionId: presId } });
        for (let i = 0; i < quotes.length; i++) {
            quote.push({
                id: quotes[i].id,
                store_name: quotes[i].store_name,
                text_note: quotes[i].text_note,
                price: quotes[i].price,
                createdAt: quotes[i].createdAt
            });
        }

        // Push all prescription data to prescription object.
        prescription.images = image;
        prescription.list_of_medicine = medicine;
        prescription.pharmacist_replied = quote

        // Send success response.
        return res.status(200).json({
            message: "Prescription fetched successfully.",
            data: prescription
        });

    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

/*
 * To delete image from server.
*/
const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log(err));
}