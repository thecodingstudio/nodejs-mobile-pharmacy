const { admin } = require('../utils/firebase_config');

// Push-Notification options.
const options = {
    contentAvailable: true,
    priority: "high",
    timeToLive: 60 * 60 * 24
};

/*
 * To Send push-notification. 
*/
exports.createNotification = (registrationToken, message_notification) => {
    return new Promise(async (resolve) => {
        admin.messaging().sendToDevice(registrationToken, message_notification, options)
            .then(response => {
                console.log('notification send to Device! ', response.results);
                resolve(true);
            })
            .catch(error => {
                console.log('notification error! ', error);
                resolve(error);
            });
    });
};