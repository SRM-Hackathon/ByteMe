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

app.get("/projects",isloggedin,function(req,res){
  question.find({},function(err,questions){
    if (err){
      res.render("/")
    }
    qeus=[]
    questions.map(function(v){
      v.tags.foreach(function(s){
        if req.user.tags.contains(s){
          ques.add(v)
        }
      })
    })
    res.render("/questions",{projects:ques})
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
