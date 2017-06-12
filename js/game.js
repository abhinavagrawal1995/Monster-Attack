$(document).ready(function () {

	var clock = $('#clock');
	var cstep = 1;
	var clockstepper=[{x:0,y:0},{x:2,y:0},{x:1,y:0},{x:0,y:1},{x:2,y:1},{x:1,y:1},{x:0,y:2},{x:2,y:2},{x:1,y:2}];
	var clocker;
	var points;
	var lives = 3;
	var socket = io();
	var qcount=0;
	var gameEnded = false;
	var submitted = false;
	var first = true;
	var explode = false;

 	$("#question").html("Click to begin");
	$("#hitit").val('Begin');

	$("#hitit").click(function() { 
			startGame();
			$("#hitit").unbind("click");
			$("#hitit").val('HIT IT.');
			$("#hitit").click(function() {
				if(gameEnded) 
					return;
				if(submitted)
					return;
				console.log("clicked");
				submitAns(setQuestion);
			});
		});

	function startGame() {	
		console.log("Starting");
		socket.emit('new practice', true);
		socket.on('game data', function(gameData){
			points = gameData.points;
		    $("#current_score").html("Score : " + points);
		    $("#pname").html("Hi CodeFather");
		    setQuestion();
		});
	}

	function setQuestion() {
		console.log("Set?");
		if(first) {
    		submitted=true;
    		startTimer();
    		first = false;
    	}   		
		if(gameEnded)
			return;	
		if(!submitted) {
			console.log("Dont set");
			return;
		}
		submitted = false;		
		console.log("setq" , qcount);		
		if(qcount == 5) {
			endGame();
			return;
		}
		cstep=0;
    	$("#answer-text").prop("disabled", false);		
    	$("#answer-text").val("");
        socket.emit('getquestion', qcount);
        socket.on('setquestion', function(question){
        	$("#question").html(question);
        });
        
    }

    submitAns = function(callback) { 
    	if(submitted)
    		return;
    	if(gameEnded)
    		return;
    	console.log("submitting");
    	submitted=true;
		socket.emit('submitAnswer', $("#answer-text").val());
		if(qcount == 5) {
			endGame();
			return;
		}
		socket.on("sendPoints"+qcount, function(maxPoints){
			console.log("sendPoints"+qcount);
			explode = true;
		    points = points + maxPoints;
    		$("#current_score").html("Score : " + points); 
    		if(maxPoints == 0) {
    			console.log("no point. BOOM");
    			explodeMonster();		
    		} 
			qcount++;	
			callback();
		});	
	}

    //call function from button listener where increase count
    


	var updateClock = function() {
		console.log("clock at " , cstep);
		if(cstep==9 || submitted) {
			cstep = 0;
			if(!submitted)
				submitAns(setQuestion);
			clock.css('background-position', clockstepper[cstep].x*(134) + 'px ' + -131*clockstepper[cstep].y + 'px');
			return;			
		}
		console.log("clock at " , cstep);
		clock.css('background-position', clockstepper[cstep].x*(134) + 'px ' + -131*clockstepper[cstep].y + 'px');
		cstep++;
	};


	var startTimer = function() {
		if(gameEnded)
			return;
		console.log("starting timer");
		clocker = setInterval(updateClock, 15000/9);
	}



	var monsters = [$("#mon1"),$("#mon2"),$("#mon3")];
	explodeMonster = function() {
		if(gameEnded)
			return;
		console.log(lives + " lives");
		lives--;		
		var mon = monsters[lives];
		mon.css('background-image','url("../images/explosion.gif")');
		mon.css('width','200px');
		mon.css('height','200px');
		setTimeout(function(){mon.css('visibility','hidden');}, 1000);
		if(lives == 0) {
			endGame();
			return;
		}
	}

	endGame = function() {
		submitted = true;
		gameEnded = true;
		$("#hitit").val('Game Over');
		$("#hitit").prop("disabled", true);
		$("#question").html("You got "+ points + " Points.");
		socket.disconnect();
		clearInterval(clocker);
		console.log("kbai");
	}
});
