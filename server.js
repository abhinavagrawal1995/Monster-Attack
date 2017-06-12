var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
// var session = require('express-session')
// var sqlite3 = require('sqlite3').verbose()
// var bodyParser = require('body-parser');
var path = require('path');
// var cookieParser = require('cookie-parser');
// var db = new sqlite3.Database('db.sql');
// var userStatus = []
var port = 3000;
var gamerouter = express.Router();
var stringSimilarity = require('string-similarity');

// app.use(session({ secret: "genie" }));
// app.use(bodyParser());
app.use(express.static(path.join(__dirname, '/public')));

/////////////////////////////////////////////////////////

http.listen(port, function () {
	console.log('listening on *:', port);
	// dbInit();
});

app.get('/', function (req, res) {
	console.log('starting');
	res.sendFile(__dirname + 'public/practice.html');
});


//////////////////////////////////////////////////////////

// app.post('/loginAction', function (req, res) {
// 	console.log("in login action", req.body);
// 	var post = req.body;
// 	q = "SELECT * FROM users where id like '" + post.username + "' and password like '" + post.password + "'";
// 	db.all(q, function (err, row) {
// 		if (row != null) {
// 			var secret = Math.random().toString(36).slice(-8);
// 			req.session.secret = secret;
// 			res.redirect('/menu?ssid=' + secret);
// 		}
// 		else {
// 			res.send('Bad user/pass');
// 		}
// 	});
// })

// function checkAuth(req, res, next) {
// 	console.log("in checkauth");
// 	if (!req.session.secret) {
// 		res.redirect('/');
// 	} else {
// 		next();
// 	}
// }

// function userdbInit() {
// 	db.serialize(function () {
// 		db.run("DROP TABLE IF EXISTS users");
// 		db.run("CREATE TABLE users (id TEXT,password TEXT,points INTEGER)");
// 		db.run("INSERT INTO users VALUES (?, ?, ?)", ['abc', 'abc', '0']);
// 		db.run("INSERT INTO users VALUES (?, ?, ?)", ['def', 'def', '0']);
// 		db.each("SELECT * FROM users", function (err, row) {
// 			console.log(row.id + ": " + row.password);
// 		});
// 	});
// }



io.on('connection', function (socket) {

	console.log("new connection");

	playerData = { wallet: "300", name: 'Abhinav' };

	var jsonAllQues = {
		"0": {
			"question": "A government requirement for the payer of an item of income to deduct tax from the payment, and pay that tax to the government",
			"answers": [
				{
					"id": 0,
					"text": "withholding tax",
					"points": 10
				},
				{
					"id": 1,
					"text": "retention tax",
					"points": 10
				},
				{
					"id": 2,
					"text": "witholding",
					"points": 8
				},
				{
					"id": 3,
					"text": "tax",
					"points": 6
				}
			]
		},
		"1": {
			"question": "1 x = 2,145 EUR. x = ?",
			"answers": [
				{
					"id": 0,
					"text": "XBT",
					"points": 10
				},
				{
					"id": 1,
					"text": "BTC",
					"points": 10
				},
				{
					"id": 2,
					"text": "Bitcoin",
					"points": 8
				},
				{
					"id": 3,
					"text": "Crypto currency",
					"points": 4
				}
			]
		},
		"2": {
			"question": "21,000,000",
			"answers": [
				{
					"id": 0,
					"text": "bitcoin circulation",
					"points": 8
				},
				{
					"id": 1,
					"text": "maximum bitcoin circulation",
					"points": 10
				},
				{
					"id": 2,
					"text": "total bitcoin",
					"points": 8
				},
				{
					"id": 3,
					"text": "bitcoin",
					"points": 6
				}
			]
		},
		"3": {
			"question": "Money's a matter of functions four: a M___, a M____, a Standard, a S____' - William Stanley Jevons.",
			"answers": [
				{
					"id": 0,
					"text": "Medium, Measure, Store",
					"points": 10
				},
				{
					"id": 1,
					"text": "Measure, Medium, Stor",
					"points": 8
				}
			]
			
		},
		"4": {
			"question": "Blockchain-based distributed computing platform",
			"answers": [
				{
					"id": 0,
					"text": "Ethereum",
					"points": 10
				},
				{
					"id": 1,
					"text": "Vitalik Buterin",
					"points": 8
				},
				{
					"id": 2,
					"text": "Ether",
					"points": 6
				}
			]
		},
		"5": {
			"question": "Object-oriented programming language for writing smart contracts",
			"answers": [
				{
					"id": 0,
					"text": "Solidity",
					"points": 10
				},
				{
					"id": 1,
					"text": "Ethereum",
					"points": 8
				},
				{
					"id": 2,
					"text": "Ether",
					"points": 6
				},
				{
					"id": 3,
					"text": "JavaScript",
					"points": 6
				},
				{
					"id": 4,
					"text": "ECMAScript",
					"points": 6
				}
			]
		},
		"6": {
			"question": "Ξ",
			"answers": [
				{
					"id": 0,
					"text": "Ether",
					"points": 10
				},
				{
					"id": 1,
					"text": "ETH",
					"points": 10
				},
				{
					"id": 2,
					"text": "Ethereum",
					"points": 6
				}
			]
		}
	}
	var pointsJson = {};

	var sentPoints = {};

	// Practice Mode
	socket.on('new practice', function (data) {

		gameData = {
			name: "Welcome Guest Player",
			points: 0
		};

		console.log('new practice for : ' + socket.id);

		socket.emit('game data', gameData);

		socket.on('getquestion', function (count) {
			console.log("setting q" + count);
			socket.emit('setquestion', jsonAllQues[String(count)].question);

			socket.on('submitAnswer', function (answer) {
				console.log('evaluating answer : ' + answer );
				var maxSimiliar = 0;
				var maxPoints = 0;
				jsonAllQues[String(count)].answers.forEach(function (set) {
					var text = set.text;
					var options = text.split(",");
					console.log(options);
					for (var i = 0; i < options.length; i++) {
						var similarity = stringSimilarity.compareTwoStrings(options[i], answer);
						pointsJson = { "points": 0 };
						if (similarity >= 0.8 && similarity > maxSimiliar) {
							maxSimiliar = similarity;
							maxPoints = set.points;
						}
					};
				});
				if(sentPoints[count]==1)
					return;
				else {			
					sentPoints[count]=1;						
					console.log("sendPoints"+count + " : " + maxPoints);
					socket.emit("sendPoints"+count, maxPoints); 
				}
			});
		});
	});
	socket.on('disconnect', function () {
		console.log('user disconnected');
	});
});

