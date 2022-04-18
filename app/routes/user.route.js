const express = require('express');
const cors = require('cors');
const router = express.Router();
const authUser = require('../middlewares/is-auth');
const userConroller = require('../controllers/user.controller');

router.use(cors());

router.get('/getProfile', authUser, userConroller.getProfile);

router.post('/updateProfile', authUser, userConroller.updateProfile);

router.post('/addAddress', authUser, userConroller.postAddress);

router.post('/updateAddress/:id', authUser, userConroller.updateAddress);

router.delete('/deleteAddress/:id', authUser, userConroller.deleteAddress);

router.get('/getAddress', authUser, userConroller.getAddress);

module.exports = router;