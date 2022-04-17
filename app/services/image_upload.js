const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: 'dobanpo5b',
    api_key: '518757692148854',
    api_secret: 'TQkyXqrNQH7z6wv1cOr2JZjm4KU'
});

module.exports = cloudinary;