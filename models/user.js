var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
  username: String,
  password: String,
  name:String,
  tags:[{
  	type:String,
  	required:true
  }]
  
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("user", userSchema);