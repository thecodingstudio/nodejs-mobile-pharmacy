const express = require('express');
const cors = require('cors');
const router = express.Router();
const authUser = require('../middlewares/is-auth');
const userController = require('../controllers/user.controller');

router.use(cors());

router.get('/getProfile', authUser, userController.getProfile);

router.post('/updateProfile', authUser, userController.updateProfile);

router.post('/addAddress', authUser, userController.postAddress);

router.post('/updateAddress/:id', authUser, userController.updateAddress);

router.delete('/deleteAddress/:id', authUser, userController.deleteAddress);

router.get('/getAddress', authUser, userController.getAddress);

module.exports = router;