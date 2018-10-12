var mongoose = require("mongoose");

var questionSchema = new mongoose.Schema({
  author:{
      type:String
  },
  title:{
      type:String,
      required:true
  },
  proposal:{
    type:String,
    required:true
  },
  tags:[{
      type:String,
      required:true
  }],
  date:{
      type:Date,
      default:Date.now()
  },
  answers:[{
      type:String,
      userID:{
          type:mongoose.Schema.Types.ObjectId,
          ref: "user"
      }
  }],
  upvotes:{
      type:Number,
      default:0       
  }
});

module.exports = mongoose.model("question", questionSchema);