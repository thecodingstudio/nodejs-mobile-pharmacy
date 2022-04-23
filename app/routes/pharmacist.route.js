const express = require('express');
const cors = require('cors');
const router = express.Router();
const authUser = require('../middlewares/is-auth');
const pharmacistController = require('../controllers/pharmacist.controller');

router.use(cors());

router.post('/addQuote', authUser, pharmacistController.addQuote);

router.get('/getRequests', authUser, pharmacistController.getRequests);

router.post('/collectPaymentOffline',authUser, pharmacistController.collect_payment_offline);

router.post('/changeOrderStatus',authUser, pharmacistController.changeOrderStatus);

module.exports = router;