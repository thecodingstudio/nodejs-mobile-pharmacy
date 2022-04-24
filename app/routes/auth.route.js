const express = require('express');
const cors = require('cors');
const router = express.Router();
const is_auth = require('../middlewares/is-auth');
const authController = require('../controllers/auth.controller');

router.use(cors());

router.post('/register', authController.Register);

router.post('/login', authController.Login);

router.post('/refreshToken', authController.refreshToken);

router.post('/generateOTP', authController.generateOTP);

router.post('/verifyOTP', authController.verifyOTP);

router.post('/forgotPassword', authController.forgotPassword);

router.get('/resetPassword/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

router.post('/changePassword', authController.changePassword);

router.put('/logout', is_auth, authController.logout);

module.exports = router;