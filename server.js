const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

// Define express server amd port.
const app = express();
const PORT = process.env.PORT || 8000;

// Importing routes.
const auth_route = require('./app/routes/auth.route');
const user_route = require('./app/routes/user.route');
const customer_route = require('./app/routes/customer.route');
const pharmacist_route = require('./app/routes/pharmacist.route');


// Multer setup.
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images/');
    },

    filename: function (req, file, cb) {
        cb(null, new Date().toISOString() + '-' + file.originalname);
    }
});

// Parse multer request.
app.use(multer({ storage: storage }).array('image'));
app.use('/images', express.static(path.join(__dirname, 'images')));

// Parse requests of content-type - application/json
app.use(bodyParser.json());

// Parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// Set headers for all requests.
app.use(cors());
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});

// Difine API routes.
app.use(auth_route);
app.use(user_route);
app.use('/customer', customer_route);
app.use('/pharmacist', pharmacist_route);

// Central error handling middleware.
app.use((error, req, res, next) => {
    console.log(error);
    const statusCode = error.statusCode || 500;
    const data = error.data;
    const ErrorMessage = error.message;
    res.status(statusCode).json({ ErrorMessage: ErrorMessage, data: data });
});

// Difine simple route.
app.get("/", (req, res) => {
    res.status(200).send('Welcome to Mobile Pharmacy App APIs..');
});

// Define models and it's relationship.
const User = require('./app/models/user');
const Store = require('./app/models/store');
const Token = require('./app/models/app_token');
const Address = require('./app/models/address');
const Prescription = require('./app/models/prescription');
const Prescription_image = require('./app/models/prescription_image');
const Medicine = require('./app/models/medicine');
const Notification = require('./app/models/notification');
const Quote = require('./app/models/quote');
const Card = require('./app/models/card');
const Order = require('./app/models/order');
const Payment = require('./app/models/payment');

Store.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
Token.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
Address.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Prescription);
Prescription_image.belongsTo(Prescription, { constraints: true, onDelete: 'CASCADE' });
Prescription.hasMany(Prescription_image);
Medicine.belongsTo(Prescription, { constraints: true, onDelete: 'CASCADE' });
Prescription.hasMany(Medicine);
Notification.belongsTo(User);
Store.hasMany(Quote, { constraints: true, onDelete: 'CASCADE' });
Quote.belongsTo(Prescription);
Prescription.hasMany(Quote);
Order.belongsTo(User, { foreignKey: 'userId', targetKey: 'id' });
Order.belongsTo(Store, { foreignKey: 'storeId', targetKey: 'id' });
Order.belongsTo(Quote, { foreignKey: 'quoteId', targetKey: 'id' });
Payment.belongsTo(User);
Payment.belongsTo(Store);
Payment.belongsTo(Order);
Card.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });

/*
 * Sync MySQL database.
 * Live to on defined port.
 */
const sequelize = require("./app/utils/database");
sequelize
    .sync({ force: false })
    .then(_database => {
        console.log('Database Connected Successfully.')
    })
    .then((_result) => {
        app.listen(PORT, (_port) => {
            console.log('server running on port : ' + PORT);
        });
    })
    .catch(err => {
        console.log(err);
    });