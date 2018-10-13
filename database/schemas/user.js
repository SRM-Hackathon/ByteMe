'use strict';

var Mongoose 	= require('mongoose');
var bcrypt      = require('bcrypt-nodejs');

const SALT_WORK_FACTOR = 10;
const DEFAULT_USER_PICTURE = "/img/user.jpg";

var UserSchema = new Mongoose.Schema({
    username: { type: String, required: true},
    password: { type: String, default: null },
    socialId: { type: String, default: null },
    picture:  { type: String, default:  DEFAULT_USER_PICTURE}
});

UserSchema.pre('save', function(next) {
    var user = this;

    // ensure user picture is set
    if(!user.picture){
        user.picture = DEFAULT_USER_PICTURE;
    }

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, null, function(err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});


UserSchema.methods.validatePassword = function(password, callback) {
    bcrypt.compare(password, this.password, function(err, isMatch) {
        if (err) return callback(err);
        callback(null, isMatch);
    });
};

// Create a user model
var userModel = Mongoose.model('user', UserSchema);

module.exports = userModel;