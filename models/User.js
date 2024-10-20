const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: { type: String, unique: true },
    password: String,
    role: String,
    phone: String,
    profilePicture: String
});

module.exports = mongoose.model('User', userSchema);