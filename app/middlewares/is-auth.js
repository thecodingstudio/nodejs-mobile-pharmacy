require('dotenv').config();
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authenticated = req.get('Authorization');
    if (!authenticated) {
        return res.status(401).json({ message: "User not Authenticated" });
    }
    const token = authenticated.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (!err) {
            req.user = user.user;
            next();
        } else {
            return res.status(401).json({ message: "User not Authenticated" });
        }
    })
}