var server = require('http').createServer();
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var path    = require('path'); 
var WebSocketServer = require('ws').Server
var wss = new WebSocketServer({ server: server });

var room = require('./routes/room');
//var user = require('./routes/user');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('port', process.env.PORT || 8000);
// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
console.log("p:"+process.env.PORT+" i:"+process.env.IP)
var port = process.env.PORT || 8000;        // set our port
//process.env.PORT, process.env.IP

if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// ROUTES FOR RENDER

app.get('/', function(req, res){
	res.render('index', { title: 'Gomura' }); 
});

app.get('/room/:room_name', function(req, res){
	res.render('room', { title: 'Gomura', room: req.params.room_name });
});
// ROUTES FOR OUR API
// =============================================================================
//var router = express.Router();              // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)

// =======================    ROOMS   =============================
//.route('/api')
app.get('/api/rooms', room.getAll);

app.post('/api/rooms', room.create);

app.get('/api/room/:room_name', room.getByName);
		
app.put('/api/room/:room_name', room.update);

app.delete('/api/room/:room_name', room.delete);

app.post('/api/room/:room_name/:user_name', room.addUser);

app.put('/api/room/:room_name/:user_name', room.userGame);


// =======================    USERS   =============================
//.route('/api')

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
//app.use('/api', app.router);

// START THE SERVER
// =============================================================================
//app.listen(port);

wss.on('connection', function connection(ws) {
	//var location = url.parse(ws.upgradeReq.url, true);
	// you might use location.query.access_token to authenticate or share sessions
	// or ws.upgradeReq.headers.cookie (see http://stackoverflow.com/a/16395220/151312)

	ws.on('message', function incoming(message) {
		console.log('received: %s', message);
		
		var data = JSON.parse(message);
		
		switch(data.type)
		{
			case 'newUser':
				//broadcast({type:'chatMsg', pseudo:conn.id, content:data.content}, null);
				wss.clients.forEach(function each(client) {
					client.send(JSON.stringify({type:'newUser', content:data.content}));
				});
			break;
			case 'nick':
				broadcast({type:'changeNick', oldNick:conn.id, newNick:data.content});
				clients[data.content] = clients[conn.id];
				delete clients[conn.id];
				conn.id = data.content;
			break;		
		}
	});

	ws.send(JSON.stringify({type:'newUser', content:'test1'}));
});

server.on('request', app);
server.listen(port, 'localhost', 0, function () { console.log('Listening on ' + server.address().port) });

mongoose.connect('localhost', 'GOMURA', 27017, function(err) {
  if (err) {
    console.log('Could not connect to mongo: ' + err);
    process.exit(1);
  }
  
 /* // We've connected to Mongo, so start the web server
  http.createServer(app).listen(app.get('port'), function(){
    console.log('Demo server listening on port ' + app.get('port'));
  });*/
});

process.on('uncaughtException', function (err) {
    console.log(err);
}); 