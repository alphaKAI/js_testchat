
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/users', user.list);

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

var io = require('socket.io').listen(server);
function getnow(){
	now = new Date();
	hours = now.getHours();
	minutes = now.getMinutes();
	seconds = now.getSeconds();
	return hours + ":" + minutes + ":" + seconds
}
function stringcrettime(str){
	return str + "            - " +getnow()
}
var log = new Array;
var active = 0;
var user = new Array;
var i = 0;
io.sockets.on('connection', function(socket){
	socket.on('post', function(data){
		var str = data.mode;
		switch(str){
			case "subscribe":
				io.sockets.emit('message', {mode: "info", text: stringcrettime("ようこそ！")});
				io.sockets.emit('message', {mode: "subscribe", id: active + 1});
				active += 1;
				break;
			case "post":
				str = stringcrettime(data.text);
				log.push(str);//Add to log	
		    var address = socket.handshake.address;
				console.log(address.address + " : " + str);
				if(log[log.length - 2] != data.text){
					io.sockets.emit('message', {mode: "post", text: str});
				}
				break;
			case "getlog":
				for(var i = 0; i < log.length; i++){
					io.sockets.emit('message', {mode: "post", text:log[i]});
				}
				break;
		}
	});
});
app.get('/', function(req, res){
	res.render('index');
});
