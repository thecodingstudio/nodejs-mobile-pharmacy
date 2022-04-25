require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const stripe = require('stripe')(process.env.STRIPE_SK);
const { Op } = require('@sequelize/core');

// Import models.
const User = require('../models/user');
const Store = require('../models/store');
const Token = require('../models/app_token');

let tokenList = {};

/*
 * Regiser new user.
 * Check whether user is already exist or not.
 * If not then creat new user.
 * Create customer on Stripe.
*/
exports.Register = (req, res, next) => {

    User.findOne({ where: { email: req.body.email } })
        .then(async user => {

            // Check whether user is already exists or not.
            if (user) {
                const error = new Error('User already exists!');
                error.statusCode = 409;
                throw error;
            }

            // Create user with encrypted password.
            try {
                const hassed_password = await bcrypt.hash(req.body.password, 12);

                const payload = {
                    role: req.body.role,
                    name: req.body.name,
                    email: req.body.email,
                    gender: req.body.gender,
                    password: hassed_password,
                    image: req.body.image,
                    phone: req.body.phone
                }
                const new_user = await User.create(payload);

                // Check whether user is customer or pharmacist.
                try {
                    if (parseInt(new_user.role) === 2) {
                        const payload = {
                            store_name: req.body.store_name,
                            license_id: req.body.license_id,
                            store_image: req.body.store_image,
                            userId: new_user.id
                        }

                        // Create store for pharmacy user.
                        const new_store = await Store.create(payload);


                        // Create stripe customer account for pharmacist.
                        try {
                            const customer = await stripe.customers.create({
                                name: new_store.store_name,
                                email: new_user.email,
                                phone: new_user.phone,
                                description: 'I am pharmacist',
                            });

                            // Store stripe id for user in database.
                            new_user.stripe_id = customer.id;
                            await new_user.save();

                            // Send response for created pharmacist.
                            return res.status(200).json({
                                message: "Pharmacist created successfully",
                                data: {
                                    id: new_user.id,
                                    name: new_user.name,
                                    store_name: new_store.store_name,
                                    pharmacy_id: new_store.pharmacy_id
                                }
                            });
                        }
                        catch (err) {
                            new_user.destroy();
                            const error = new Error('Stripe user creation failed !');
                            error.statusCode = 422;
                            throw error;
                        }
                    }
                }
                catch (err) {
                    new_user.destroy();
                    const error = new Error('Store creation Failed!');
                    error.statusCode = 422;
                    throw error;
                }

                // Create stripe customer account for normal user.
                try {
                    const customer = await stripe.customers.create({
                        name: new_user.name,
                        email: new_user.email,
                        phone: new_user.mobile,
                        description: 'I am customer',
                    });
                    new_user.stripe_id = customer.id;
                    await new_user.save();

                    // Send response for created customer.
                    return res.status(200).json({
                        message: "Customer created successfully",
                        data: {
                            id: new_user.id,
                            name: new_user.name
                        }
                    });
                }
                catch (err) {
                    const error = new Error('Stripe user creation failed !');
                    error.statusCode = 422;
                    throw error;
                }

            }
            catch (err) {
                console.log(err)
                const error = new Error('User creation failed!');
                error.statusCode = 422;
                throw error;
            }

        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })

}


/*
 * Login controller.
*/
exports.Login = (req, res, next) => {

    User.findOne({ where: { email: req.body.email } })
        .then(async user => {

            // Check whether user is already exist or not.
            if (!user) {
                const error = new Error('User not exists!');
                error.statusCode = 404;
                throw error;
            }

            // Check whether password is equal or not.
            try {
                const isEqual = await bcrypt.compare(req.body.password, user.password);

                if (!isEqual) {
                    const error = new Error('Invalid password');
                    error.statusCode = 403;
                    throw error;
                }

                // generate access and refresh token.
                const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_LIFE });
                const refreshToken = jwt.sign({ user }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_LIFE });

                // Store access and refresh token in tokenList.
                tokenList[refreshToken] = { accessToken: accessToken, refreshToken: refreshToken };

                // Store token data in database
                try {

                    const token = await Token.findOne({ where: { userId: user.id } });

                    // Chech whether token exist or not.
                    if (token) {
                        token.access_count = token.access_count + 1;
                        token.token = accessToken;
                        token.status = 'active';
                        token.expiry = '1h';
                        token.device_token = req.body.device_token;

                        // Save updated token data.
                        try {

                            await token.save();

                            // Sending success response.
                            return res.status(200).json({
                                message: 'Logged-in successfully..',
                                data: {
                                    role: user.role,
                                    name: user.name,
                                    token: accessToken,
                                    refreshToken: refreshToken
                                }
                            });

                        }
                        catch (err) {
                            const error = new Error('Token Updation Failed!');
                            error.statusCode = 404;
                            throw error;
                        }

                    }

                    const payload = {
                        userId: user.id,
                        token: accessToken,
                        status: 'active',
                        expiry: '1h',
                        access_count: 1,
                        device_token: req.body.device_token
                    }

                    // Crete app_token if user is login first time.
                    await Token.create(payload);

                    // Sending success response.
                    return res.status(200).json({
                        message: 'Logged-in successfully',
                        data: {
                            name: user.name,
                            token: accessToken,
                            refreshToken: refreshToken
                        }
                    });

                }
                catch (err) {
                    const error = new Error('Login Failed!');
                    error.statusCode = 404;
                    throw error;
                }

            }
            catch (err) {
                const error = new Error('Login Failed!');
                error.statusCode = 404;
                throw error;
            }

        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
}


/*
 * Refresh token controller.
*/
exports.refreshToken = (req, res, next) => {

    const postData = req.body;

    // Chech whether refresh token is exist in token list.
    if (!(postData.refreshToken) && !(postData.refreshToken in tokenList)) {
        const error = new Error('User not Authenticated!');
        error.statusCode = 403;
        throw error;
    }

    // Verify token and check whether expired or not. 
    jwt.verify(postData.refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {

        if (!err) {

            // generate new access token using refresh token.
            const token = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_LIFE });

            return res.status(201).json({ token });

        }
        else {
            const error = new Error('Invalid Refresh Token!');
            error.statusCode = 403;
            throw error;
        }
    });

}

let forVerify = {};

/*
 * Generate OTP for phone number verificatio.
*/
exports.generateOTP = (req, res, next) => {

    const MOBILE = req.body.mobile;

    // Generate OTP.
    const OTP = Math.floor(1000 + (9999 - 1000) * Math.random());

    // Store OTP locally.
    forVerify['OTP'] = OTP;
    forVerify['MOBILE'] = MOBILE;

    // Sending response.
    return res.status(200).json({
        message: 'OPT generated successfully..',
        data: {
            mobile: MOBILE,
            OTP: OTP
        }
    });

}


/*
 * Verify OTP.
*/
exports.verifyOTP = (req, res, next) => {

    const otp = forVerify.OTP;
    const mobile = forVerify.MOBILE;

    // Chech whether OTP is match or not. 
    if (req.body.OTP === otp && req.body.mobile === mobile) {
        forVerify = {};

        // Sending success response.
        return res.status(200).json({
            message: 'Mobile number varifed.'
        });
    }
    else {

        //Sending failed response.
        return res.status(200).json({
            erroMessage: 'Invalid OTP!'
        });
    }

}


/*
 * Nodenaike transporter to sending mail.
*/
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'destinee.mohr20@ethereal.email',
        pass: 'gTueyF35BzrSuUNjtR'
    }
});


/*
 * Forgot password controller.
 * Create reset token.
 * Send reset password mail with reset token.
*/
exports.forgotPassword = (req, res, next) => {

    // Generating reset token using crypto.
    crypto.randomBytes(32, async (err, buffer) => {

        if (err) {
            const error = new Error('Token Creation Failed!');
            error.statusCode = 403;
            throw error;
        }
        const token = buffer.toString('hex');

        // Find user.
        User.findOne({ where: { email: req.body.email } })
            .then(async user => {

                // Check whether user exist or not.
                if (!user) {
                    const error = new Error('User not exists!');
                    error.statusCode = 404;
                    throw error;
                }
                user.resetToken = token;

                // Set reset token expiry 1h.
                user.resetTokenExpiration = Date.now() + 3600000;

                // Save reset token and send mail.
                try {

                    await user.save();

                    transporter.sendMail({
                        to: req.body.email,
                        from: 'admin@gmail.com',
                        subject: 'Mobile Pharmacy Password Assistance',
                        html: `
                    <p>Greeting from Mobile Pharmacy,</p>
                    <p><p>
                    <p>We received a request to reset the password for the Mobile Pharmacy account associated with this e-mail address. Click the link below to reset your password using our secure server:<p>
                    <p><p>
                    <p><a href="https://mobile-pharmacy.herokuapp.com/resetPassword/${token}">https://mobile-pharmacy.herokuapp.com/resetPassword/${token}</a></p>
                    <p><p>
                    <p>If clicking the link doesn't work, you can copy and paste the link into your web browser's address bar. You will be able to create a new password for your AWS account after clicking the link above.<p>
                    <p><p>
                    <p>Mobile Pharmacy will never email you and ask you to disclose or verify your password, credit card, or banking account number. If you receive a suspicious email with a link to update your account information, do not click on the link. Instead, report the e-mail to Mobile Pharmacy for investigation.<p>
                    <p>For help and support, visit the Mobile Pharmacy Support Center at <a href="https://www.thecodingstidio.in/support">https://www.thecodingstudio.in/support<a>.<p>
                    <p><p>
                    <p>Thank you for using Amazon Web Services.<p>
                    <p><p>
                    <p>Sincerely,<p>
                    <p>The Amazon Web Service Team<p>
                  `
                    });

                    return res.status(200).json({ message: 'Password reset link send to your email' })

                }
                catch (err) {
                    const error = new Error('User not saved!');
                    error.statusCode = 404;
                    throw error;
                }

            })
            .catch(err => {
                if (!err.statusCode) {
                    err.statusCode = 500;
                }
                next(err);
            });

    });

}

/*
 * Forgot password controller.
 * Get reset password link using valid reset token.
*/
exports.getNewPassword = async (req, res, next) => {

    // Get token from params
    const token = req.params.token;

    // Check reset token is velid or not.
    User.findOne({
        where: {
            resetToken: token,
            resetTokenExpiration: { [Op.gt]: Date.now() }
        } })
        .then(user => {
            res.render('auth/new-password', {
                path: '/new-password',
                pageTitle: 'New Password',
                userId: user.id,
                passwordToken: token
            });
        })
        .catch(err => {
            const error = new Error("Invalid reset token!");
            error.httpStatusCode = 400;
            return next(error);
        });

}

/*
 * Forgot password controller.
 * Get new password using valid reset token.
*/
exports.postNewPassword = (req, res, next) => {

    const newPassword = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const token = req.body.passwordToken;

    // Check whether password metched or not.
    if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: "Passwords does not match!" })
    }

    // Find user with valid reset token.
    User.findOne({
        where: {
            resetToken: token,
            resetTokenExpiration: {
                [Op.gt]: Date.now()
            }
        }
    })
        .then(async user => {

            if (!user) {
                const error = new Error('User not exists!');
                error.statusCode = 404;
                throw error;
            }

            // Encrypt new password.
            const hashedPassword = await bcrypt.hash(req.body.password, 12);

            user.password = hashedPassword;
            user.resetToken = null;
            user.resetTokenExpiration = null;

            // Save change to the database.
            await user.save();

            transporter.sendMail({
                to: user.email,
                from: 'admin@gmail.com',
                subject: 'Password reseted !',
                html: `
            <p>Hello ${user.name},</p>
            <p>Your password reset sucessfully !!</p>
          `
            });

            return res.status(200).json({ message: 'Password Reset Successfully..' })
        })
        .catch(err => {
            console.log(err);
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
}

/*
 * Change password through current password.
*/
exports.changePassword = (req, res, body) => {

    // Find user who send request.
    User.findOne({ where: { email: req.body.email } })
        .then(async user => {

            // Cheak Whether user exist or not.
            if (!user) {
                const error = new Error('User not exists!');
                error.statusCode = 404;
                throw error;
            }

            // Check whether password macth or not.
            const isEqual = await bcrypt.compare(req.body.currentPassword, user.password);
            if (!isEqual) {
                const error = new Error('Invalid Password');
                error.statusCode = 401;
                throw error;
            }

            // Crete new password and encrypt it.
            const new_password = await bcrypt.hash(req.body.newPassword, 12);
            user.password = new_password;

            // Save updated password in database.
            await user.save();

            return res.status(200).json({ message: 'Password changed successfully..' })

        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });

}

/*
 * Logout controller.
*/
exports.logout = (req, res, next) => {

    Token.findOne({ where: { userId: req.user.id } })
        .then(async token => {
            token.token = null;
            token.status = 'expired';
            await token.save();
            return res.status(200).json({ message: 'Logout successfully' });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });

}