
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
//Define Functions
function getnow(){
	now = new Date();
	hours = now.getHours();
	minutes = now.getMinutes();
	seconds = now.getSeconds();
	return hours + ":" + minutes + ":" + seconds;
}
function stringcrettime(str){
	return str + "            - " +getnow();
}
function deleteFromArray(ary, pattarn){
	for(var i = 0; i < ary.length; i++){
		if(ary[i] == pattarn){
			ary.splice(i,1);
		}
	}
	return ary;
}
//=================
//Define variables
var log = new Array;
var active = 0;
var users = new Array;
var i = 0;
var counter = 0;
//=================

io.sockets.on('connection', function(socket){
	var address = socket.handshake.address;
	users.push(address.address);
	counter++;
	console.log("New Connection : " + address.address);
	socket.on('post', function(data){
		var str = data.method;
		if(data.uid) var uid = data.uid;

		switch(str){
			case "subscribe":
				io.sockets.emit('message', {
					method: "info",
					text:   stringcrettime("ようこそ！"),
					uid: uid
				});
				io.sockets.emit('message', {
					method: "subscribe",
					id: active + 1,
					uid: uid
				});
				io.sockets.emit('message', {
					method: "new",
					id: active + 1,
					counter: counter
				});
				active += 1;
				break;
			case "post":
				str = stringcrettime(data.text);
				log.push(str);
				console.log(address.address + " : " + str);
				if(log[log.length - 2] != data.text) {
					io.sockets.emit('message', {
						method: "post",
						text: str,
						uid: uid
					});
				}
				break;
			case "getlog":
				for(var i = 0; i < log.length; i++){
					io.sockets.emit('message', {
						method: "log",
						text:log[i],
						uid: uid
					});
				}
				break;
		}
	});
	socket.on('disconnect', function (){
		counter--;
		console.log("disconnect:" + address.address);
		users = deleteFromArray(users, address.address);
		io.sockets.emit('message', {
			method:"disconnect",
			counter: counter
		});
	});
});
app.get('/', function(req, res){
	res.render('index');
});
