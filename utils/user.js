const mongoose = require('mongoose');

const user = new mongoose.Schema({
    user_name: { type: String },
    password: { type: String },
    email: { type: String },
    dob: { type: String },
    sub_user: { type: String },
    user_role: { type: String }
	user_id: {type: String}
})

// eslint-disable-next-line no-undef
module.exports = User = mongoose.model('user', user, 'user');