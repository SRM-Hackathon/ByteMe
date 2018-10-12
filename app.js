var express = require("express");
var bodyParser = require("body-parser");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var mongoose = require("mongoose");
var user = require("./models/user");
var question = require("./models/question")
var app = express();
app.use(function(req,res,next){
  res.locals.current = req.user;
  next();
});

mongoose.connect("mongodb://deval:deval1@ds231133.mlab.com:31133/edunet");

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(require("express-session")({
  secret: "mySecret",
  resave: false,
  saveUninitialized: false
}));

app.set("view engine", "ejs");
app.use(passport.initialize());
app.use(passport.session());

// serializeUser will take data from the session which is encoded and decodes the data.
passport.use(new LocalStrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.get("/", function(req, res) {
  res.render("home");
});

app.get("/secret", isLoggedIn, function(req, res) {
  console.log(req.user)
  res.render("secret");
});

app.get("/login", function(req, res) {
  res.render("login");
});

//middleware is used to execute before the call back function, itis executed as soon as the route request is made and before the callback execution
app.post("/login", passport.authenticate("local", {
  successRedirect: "/secret",
  failureRedirect: "/login"
}), function(req, res) {
    res.render("home")
});

app.get("/register", function(req, res) {
  res.render("register");
});

app.post("/register", function(req, res) {
  var tags = req.body.tags.split(",")
  console.log(req.body.name,req.body.username,tags)
  user.register(new user({
    username: req.body.username,
    name:req.body.name,
    tags:tags
  }), req.body.password, function(err, user) {
    if (err) {
      console.log(err);
    }
    passport.authenticate("local")(req, res, function() {
      res.redirect("/secret");
    });
  });
});

app.get("/logout", function(req, res) {
  //passport will destroy all the user data in the session
  req.logout();
  res.redirect("/")
});

app.get("/user/:id",isLoggedIn,function(req,res){
  user.findById(req.params.id).exec(function(err,userfound){
    if(err){
      console.log(err)
    }else{
      res.render("user",{user:userfound,current:req.user})
    }
  })
})

app.get("/projectform", function(req,res){
  res.render("question",{current:req.user})
})


app.post("/projects",isLoggedIn,function(req,res){
  var author = req.user.username
  var tags = req.body.tags.split(",")
  question.create({author:author,title:req.body.title,proposal:req.body.proposal,tags:tags},function(err,ground){
    if(err)
      console.log("error is created",err)
    else{
      console.log("created",ground)
      res.redirect("projects")
    }
  })
})

app.get("/projects",function(req,res){
  question.find({},function(err,questions){
    if (err){
      console.log("error has taken place",err)
      res.render("/")
    }
    
    var ques=[]
    var tags=["webdev","ml"]
     for (var i = 0; i<questions.length ; i++) {
       for(var j = 0; i<questions[i].tags ; j++){
          console.log(questions[i].tags[j]);
          if(tags.includes(questions[i].tags[j])){
            ques.push(questions)
          }
        }
      }
    console.log(ques);
    res.render("projects",{projects:ques,current:req.user})
  })
})


app.post("/project/:id/vote",function(req,res){
  var body = req.body
  body.votes-=1
  question.findOneAndUpdate({id:req.params.id},body,function(err, doc){
    if(err)
      res.send(500,{error:err})
    else
      res.send("success upvote")
  })
})


app.get("/project/:id",function(req,res){
  question.findById(req.params.id).exec(function(err,ques){
    res.render("project_page",{project:ques})
  })
})

app.post("/project/:id/comment",function(req,res){
  question.findById(req.params.id,function(err,data){
    if(err){
      console.log("error",err)
      res.redirect("/")
    }else{
      data.comments.push(req.body.comment)
      data.save()
    }
  })
})


function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    //Herre the next method will tell express to execute the call back function(req, res)
    // only if  Authenticated
    return next();
  }
  res.redirect("/login");
}


app.listen(3000, function() {
  console.log("Server Started");
});
