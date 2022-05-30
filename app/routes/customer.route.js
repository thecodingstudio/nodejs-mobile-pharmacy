const express = require('express');
const cors = require('cors');
const router = express.Router();
const authUser = require('../middlewares/is-auth');
const customerController = require('../controllers/customer.controller');
const paymentController = require('../controllers/payment.controller');

router.use(cors());

router.get('/getNearByPharmacy', authUser, customerController.getNearByPharmacy);

router.get('/getNearByPharmacy/v1', authUser, customerController.getNearByPharmacyV1);

router.post('/createPrescription', authUser, customerController.createPrescription);

router.get('/getPrescriptionsList', authUser, customerController.getPrescriptionsList);

router.delete('/deletePrescription/:id', authUser, customerController.deletePrescription);

router.post('/checkout', authUser, paymentController.checkout);

router.get('/getOrderStatus', authUser, paymentController.getOrderStatus);

router.post('/addCard',authUser, paymentController.addCard);

router.get('/getCard', authUser, paymentController.getCard);

module.exports = router;