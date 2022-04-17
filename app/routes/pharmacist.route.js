const express = require('express');
const cors = require('cors');
const router = express.Router();
const authUser = require('../middlewares/is-auth');
const pharmacistConroller = require('../controllers/pharmacist.controller');

router.use(cors());

router.post('/addQuote', authUser, pharmacistConroller.addQuote);

router.get('/getRequests', authUser, pharmacistConroller.getRequests);

module.exports = router;