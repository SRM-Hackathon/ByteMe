var express = require('express');
var app = express();
const bodyParser = require('body-parser');
const Pusher = require('pusher');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const pusher = new Pusher({
    appId: '621029',
    key: '4fb326c32e24cabfb9a8',
    secret: '00b6a03cadea6dca826e',
    cluster: 'ap2',
    encrypted: true
});

app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
  res.render('pad');
});
app.get('/(:id)', function(req, res) {
  res.render('pad');
});

app.post('/pusher/auth', (req, res) => {
  const socketId = req.body.socket_id;
  const channel = req.body.channel_name;
  var presenceData = {
      user_id: Math.random().toString(36).slice(2) + Date.now()
  }
  const auth = pusher.authenticate(socketId, channel, presenceData);
  res.send(auth);
});

var sharejs = require('share');


var redisClient;
console.log(process.env.REDISTOGO_URL);
if (process.env.REDISTOGO_URL) {
  var rtg   = require("url").parse(process.env.REDISTOGO_URL);
  redisClient = require("redis").createClient(rtg.port, rtg.hostname);
  redisClient.auth(rtg.auth.split(":")[1]);
} else {
  redisClient = require("redis").createClient();
}

var options = {
  db: {type: 'redis', client: redisClient}
};

sharejs.server.attach(app, options);

var port = process.env.PORT || 8000;
app.listen(port, function(){
  console.log("port is 8000")
});