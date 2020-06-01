const mongoose = require('mongoose');

const user = new mongoose.Schema({
    user_name: { type: String },
    password: { type: String },
    email: { type: String },
    dob: { type: String },
    user_role: { type: String },
    full_name: { type: String },
    phone_number: { type: String },
    receiver_list: { type: Array },
    accounts: { type: Array },
    user_id: { type: String }
})

// eslint-disable-next-line no-undef
module.exports = User = mongoose.model('user', user, 'user');