const express = require('express');
const cors = require('cors');
const router = express.Router();
const authUser = require('../middlewares/is-auth');
const customerConroller = require('../controllers/customer.controller');

router.use(cors());

router.get('/getNearByPharmacy', authUser, customerConroller.getNearByPharmacy);

router.post('/createPrescription', authUser, customerConroller.createPrescription);

router.get('/getPrescriptionsList', authUser, customerConroller.getPrescriptionsList);

router.delete('/deletePrescription/:id', customerConroller.deletePrescription);

router.get('/getPrescription', authUser, customerConroller.get);


module.exports = router;