var admin = require("firebase-admin");

var serviceAccount = require("../../firebase_config.json");


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

module.exports.admin = admin