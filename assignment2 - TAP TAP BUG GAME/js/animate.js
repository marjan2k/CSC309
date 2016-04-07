var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var	m_pos_x = 0; //mouse pos on canvas x axis
var	m_pos_y = 0; //mouse pos on canvas y axis
//var rect = canvas.getBoundingClientRect(); //get canvas size
var timer = 5; //timer for returning to main menu


var score_l1=0;
var score_l2=0;
var high_score_l1=score_l1;
var high_score_l2=score_l2;

function high_score1() {
    document.getElementById("highscore").innerHTML = high_score_l1;
}
function high_score2() {
    document.getElementById("highscore").innerHTML = high_score_l2;
}
function show_canvas() {
	document.getElementById("menu").style.display="none";
	document.getElementById("canvas").style.display="";
	//document.getElementById("canvas").style.cursor = "crosshair";
	//document.getElementById("canvas").style.cursor = "url(data:images/cross4.gif), auto";
  	game_restart();
	//timer=60;//game start
}

var raf;
ctx.fillStyle = "#448080";
var paused = false;
var pause_btn = document.getElementById("pause");
var getInt = function(min,max){
  return Math.floor(Math.random()*(max-min+1)+min);
};

var calcAngle=function(x1,y1,x2,y2,top,right) {
      var width = Math.abs(x1-x2);
      var height = Math.abs(y1-y2);
      var angle = Math.atan(height/width)*180/Math.PI;
      if(top && right){
        angle = 360 - angle;
      }else if (top && !right) {
        angle = 180 + angle;
      }else if (!top && right) {
        ;
      }else {
        angle = 180 - angle;
      }
      return angle;
};

var Food = function(x,y) {
  //this.x = getInt(10,300);
  //this.y = getInt(200,550);
  this.x = x;
  this.y = y;
  this.image = new Image();
  this.eaten = false;
  this.image.src = 'images/apple-red.png';
}

Food.prototype.draw = function(){
//  this.image.onload = function () {
    ctx.drawImage(this.image,this.x,this.y);
//  };
};

Food.prototype.expired = function () {
  this.eaten = true;
};


//Bug object
var Bug = function(x,y,speed,color){
  this.x = x;
  this.y = y;
  this.body_len = 5;
  this.body_width = 5;
  this.radius = 2.5;
  this.color = color;
  this.angle = 90;
  this.speed = speed;
  this.alive = true;
  this.stop = false;
  this.avoid = false;
  this.vx = Math.cos(this.angle*Math.PI/180)*this.speed;
  this.vy = Math.sin(this.angle*Math.PI/180)*this.speed;
};

  Bug.prototype.setAngle = function(angle){
    this.angle = angle;
    this.vx = Math.cos(angle*Math.PI/180)*this.speed;
    this.vy = Math.sin(angle*Math.PI/180)*this.speed;
  };


  Bug.prototype.draw = function(){
      var body_coord = {
      end_y: 0,
      end_x: -this.body_len,
      start_y: 0,
      start_x: this.body_len,
      ref_lefty: -this.body_width,
      ref_leftx: 0,
      ref_righty: this.body_width,
      ref_rightx: 0
    };
    ctx.save();

    ctx.beginPath();
    ctx.moveTo(body_coord.end_x,body_coord.end_y);

    //Draw the body of the bug
    ctx.quadraticCurveTo(body_coord.ref_leftx,body_coord.ref_lefty,body_coord.start_x,body_coord.start_y);
    ctx.quadraticCurveTo(body_coord.ref_rightx,body_coord.ref_righty,body_coord.end_x,body_coord.end_y);
    if (this.alive) {
    ctx.fillStyle = this.color;
    }else {
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    }

    ctx.fill();

    // Draw the head of the bug
    ctx.beginPath();
    var rad2 = 0;
    var rad1 = (Math.PI*2);
    ctx.arc(body_coord.start_x+ this.radius,body_coord.start_y ,this.radius,rad1,rad2,true);
    ctx.fill();
    ctx.closePath();
    ctx.restore();

  };

  Bug.prototype.move = function(){
  var elapsed = 0.02;
  if(!this.alive || this.stop){
    this.stop = false;
    return;
  }
  var new_y =  this.y + this.vy*elapsed;
  var new_x =  this.x + this.vx*elapsed;
  this.y =  new_y ;
  this.x = new_x;
  };

  Bug.prototype.ate = function(x,y) {
    var dist = Math.hypot(x-this.x,y-this.y);
    if(dist < 5){
  }
    return(dist < 5);
  };

  Bug.prototype.moveLeft = function () {
    if(this.angle <= 0){
      this.setAngle(360-45);
    }else {
      this.setAngle(this.angle-45);
    }
  };


  Bug.prototype.moveRight = function () {
      this.setAngle(this.angle+45);
  };


  //Black bug
  var BlackBug = function (x,y) {
    Bug.call(this,x,y,150,"black");
    this.type = 2;
  };

  BlackBug.prototype = Object.create(Bug.prototype);
  BlackBug.prototype.constructor = BlackBug;
  BlackBug.prototype.setLevel2 = function(){this.speed = 200;};

  //Red bug
  var RedBug = function (x,y) {
    Bug.call(this,x,y,75,"red");
    this.type = 1;
  };

  RedBug.prototype = Object.create(Bug.prototype);
  RedBug.prototype.constructor = RedBug;
  RedBug.prototype.setLevel2 = function(){this.speed = 100;};

  //Orange bug
  var OrangeBug = function (x,y) {
    Bug.call(this,x,y,60,"orange");
    this.type = 0;
  };

  OrangeBug.prototype = Object.create(Bug.prototype);
  OrangeBug.prototype.constructor = OrangeBug;
  OrangeBug.prototype.setLevel2 = function(){this.speed = 80;};

//Timer object

  var Timer = function(){
    this.seconds = 60;
  };

  Timer.prototype.timer = function(){
    if(this.seconds > 0){
      this.seconds -= 1;
    }
    return this.seconds;
  };

  Timer.prototype.reset = function() {this.seconds = 60;};
  Timer.prototype.getSeconds = function() {return this.seconds};
  Timer.prototype.isFinished = function() {return this.seconds == 0};


//Game object
var Game = function(){
  this.clock = new Timer();
  this.bug_list = [];
  this.food_list = [];
  this.food_list.push(new Food(100,250));
  this.food_list.push(new Food(300,250));
  this.food_list.push(new Food(200,350));
  this.food_list.push(new Food(100,500));
  this.food_list.push(new Food(300,500));
  this.draw_id = -1;
  this.paused = false;
  this.game_over = false;
  this.level = 1;
  this.init_leve2 = false;
  this.bug_count = 0;
  this.red_count = 0;
  this.black_count = 0;
  this.orange_count = 0;
  this.animate_id = -1;
  this.clock_id = -1;
  this.checker_id = -1;
};

Game.prototype.populate = function(){
  // 0.3 for black and red
  //0.4 for orange


  var select_bug = getInt(0,2);
  var x = getInt(10,390);
  var y = 50;

  var orange_ratio = this.orange_count/this.bug_count;
  var black_ratio = this.black_count/this.bug_count;
  var red_ratio = this.red_count/this.bug_count;


  switch (select_bug) {
    case 0: //orange
    if (orange_ratio < 0.4) {
      var orange = new OrangeBug(x,y);
      if (this.level == 2) {
        orange.setLevel2();
      }
      this.bug_list.push(orange);
      this.orange_count++;
      this.bug_count++;
      break;
    }
    case 1: //black
      if( black_ratio < 0.3  && this.red_count > this.black_count){
        var black = new BlackBug(x,y);
        if (this.level == 2) {
          black.setLevel2();
        }
        this.bug_list.push(black);
        this.black_count++;
        this.bug_count++;
        break;
      }
    case 2: //red
    if(red_ratio < 0.3){
        var red = new RedBug(x,y);
        if (this.level == 2) {
            red.setLevel2();
        }
        this.bug_list.push(red);
        this.red_count++;
        this.bug_count++;
        break;
    }
    default:
      var orange = new OrangeBug(x,y);
      if (this.level == 2) {
        orange.setLevel2();
      }
      this.bug_list.push(orange);
      this.orange_count++;
      this.bug_count++;
      break;
  }

};

Game.prototype.updateLevel = function(){
  if(this.clock.isFinished()){
    if (this.food_list.length > 0) {
      if(this.level == 2) this.game_over = true;
      this.level +=1;
    }else{
      this.game_over = true;
    }
  }else if (this.food_list.length == 0) {
    this.game_over = true;
  }

  if(this.game_over){
    window.clearInterval(this.animate_id);
    window.clearInterval(this.clock_id);
    window.clearInterval(this.checker_id);
    return;
  }

  if(!this.init_leve2){
    this.level2();
  }
};

Game.prototype.level2 = function () {
  if (this.level == 2) {
      this.bug_list = [];
      this.food_list=[];
      this.food_list.push(new Food(100,250));
      this.food_list.push(new Food(300,250));
      this.food_list.push(new Food(200,350));
      this.food_list.push(new Food(100,500));
      this.food_list.push(new Food(300,500));
      this.bug_count = 0;
      this.red_count = 0;
      this.orange_count = 0;
      this.black_count = 0;
      this.clock.reset();
      this.init_leve2 = true;
  }
};



 Game.prototype.draw = function() {
  ctx.clearRect(0,45, canvas.width, canvas.height);
  ctx.fillRect(0,45, canvas.width, canvas.height);

  this.food_list.forEach(
    function(element, index, array) {
        ctx.save();
        element.draw();
        ctx.restore();
    }
  );

  //for each bug in the queue
  this.bug_list.forEach(
  function(element, index, array){
    ctx.save();
    ctx.translate(element.x,element.y);
    ctx.rotate(element.angle*Math.PI/180);
    element.draw();
    element.move();
    ctx.restore();
  });


};

Game.prototype.findFood = function() {
 var helper = function(element, index, array){
          var right = false;
          var top = false;
          var min_dist = Infinity;
          var angle = 90;

          var traverseFood = function (element2, index2,array2) {
                right = element.x > element2.x ? false : true;
                top = element.y > element2.y ? true : false;
                //calculate the angle
                var curr_angle = calcAngle(element.x,element.y,element2.x,element2.y,top,right);
                var dist = Math.hypot(element.x-element2.x,element.y-element2.y);
                angle = dist < min_dist ? curr_angle : angle;
                min_dist = dist < min_dist ? dist : min_dist;

                //check if you ate the food
                if (element.ate(element2.x,element2.y)) {
                    console.log(element2.x);
                    element2.expired();
                }
            };
          this.food_list.forEach(traverseFood);
          if(!element.avoid){
            element.setAngle(angle);
          }
};
    this.bug_list.forEach(helper,this);

};

Game.prototype.dropEatenFood = function() {
    this.food_list.sort(function(a,b) {
      if(a.eaten && !b.eaten){
        return -1;
      }

      if(!a.eaten && b.eaten){
        return 1;
      }

      return 0;
    });

    while (this.food_list.length > 0 && this.food_list[0].eaten) {
            this.food_list.shift();
    }
};

Game.prototype.avoidCollision = function () {


//check if someone is at the front
for (var i = 0; i < this.bug_list.length; i++) {
  var bug = this.bug_list[i];
  if(!bug.alive){continue;}
  var min_hypot = Infinity;
    for (var j = 0; j < this.bug_list.length; j++) {
      if(j == i){continue;}
      var bug2 = this.bug_list[j];
      if(!bug2.alive){
        continue;
      }

      if(bug.x == bug2.x && bug.y == bug2.y) {
        bug2.stop = true;
        continue;
      }
      var hypot = Math.hypot(bug2.x-bug.x,bug2.y-bug.y);
      min_hypot = min_hypot < hypot ? min_hypot : hypot;
      if(hypot < 40){
          //find is they are infront of you
          if(bug.y < bug2.y){
            bug.stop = true;
            break;
          }else if (bug.y > bug2.y) { // somebody is at my back
            //check if they are faster
            if(bug.type < bug2.type){
            //decide either to move left or right
              if(!bug.avoid){
                if(bug.x > bug2.x){
                  bug.moveLeft();
                  bug.avoid = true;
                  break;
                }else{
                  bug.moveRight();
                  bug.avoid = true;
                  break;
              }
            }
          }
      }
    }
  }

  if(min_hypot > 50){
    bug.avoid = false;
  }
}
};

Game.prototype.killBug = function (x,y) {

  var helper = function (element, index, array) {
	var hypot = Math.hypot(x-element.x,y-element.y);
	if (hypot <= 30){
		element.alive = false;
		if ( (bug_game.level==1) && (element.color=="black") ) score_l1 = score_l1 + 5;
		if ( (bug_game.level==1) && (element.color=="red") )   score_l1 = score_l1 + 3;
		if ( (bug_game.level==1) && (element.color=="orange") )score_l1 = score_l1 + 1;
		if ( (bug_game.level==2) && (element.color=="black") ) score_l2 = score_l2 + 5;
		if ( (bug_game.level==2) && (element.color=="red") )   score_l2 = score_l2 + 3;
		if ( (bug_game.level==2) && (element.color=="orange") )score_l2 = score_l2 + 1;
	}
  };
  this.bug_list.forEach(helper);
};

Game.prototype.cleanBug = function () {
  this.bug_list.sort(
    function (a,b) {
        if (!a.alive && b.alive) {
          return -1;
        }

        if(!b.alive && a.alive){
          return 1;
        }

        return 0;
    }
  );

  while (this.bug_list.length > 0 && !this.bug_list[0].alive) {
    this.bug_list.shift();
  }

};



var time_area = document.getElementById("time");

var bug_game = new Game();
//var bug_game;

var animate = function () {
  bug_game.dropEatenFood();
  bug_game.findFood();
  bug_game.avoidCollision();
  bug_game.draw();
};

var checker= function () {
  bug_game.updateLevel();
  bug_game.populate();
  bug_game.cleanBug();
};

var toPause = function(){
  paused = !paused;
  console.log(paused);

  if (paused) {
    window.clearInterval(bug_game.animate_id);
    window.clearInterval(bug_game.clock_id);
    window.clearInterval(bug_game.checker_id);
  }else {
    bug_game.animate_id = window.setInterval(function(){window.requestAnimationFrame(animate);},20);
    bug_game.clock_id = window.setInterval(updateTime,1000);
    bug_game.checker_id = window.setInterval(checker,1000);
  }
};

pause_btn.onclick = toPause;

var updateTime = function() {
  time_area.value=bug_game.clock.timer();
}


var displayTime = function() {
  time_area.value=bug_game.clock.getSeconds();
}


var refreshIntervalId = setInterval(function(){

	//information bar
	ctx.save();
	ctx.fillStyle = "black";
	ctx.fillRect(0,0,400,44);
	ctx.font='15pt Arial';
	ctx.fillStyle = "white";
	//ctx.fillText("Timer: " + timer, 50, 20);
	if(bug_game.level==1)ctx.fillText("Score: " + score_l1, 211, 30);
	if(bug_game.level==2)ctx.fillText("Score: " + score_l2, 211, 30);
	if(bug_game.level==3)ctx.fillText("Score: " + score_l2, 211, 30);
	if(bug_game.level<3)ctx.fillText("LVL: " + bug_game.level, 330, 30);
	if (!bug_game.game_over){
		ctx.fillText("Timer: " + bug_game.clock.getSeconds(), 5, 30);
		if(paused){
			ctx.fillStyle="green";
			ctx.fillText("Resume", 116, 30);
		}
		else if (!paused){
			ctx.font='bold 15pt Arial';
			ctx.fillStyle="red";
			ctx.fillText("||", 145, 30);
		}
	}
	else if(bug_game.game_over){
		ctx.save();
		ctx.font='15pt Arial';
		if(bug_game.level==3){
			ctx.fillStyle = "yellow";
			ctx.fillText("You Won!!!", 10, 18);
		}
		else{
			ctx.fillStyle = "red";
			ctx.fillText("Game Over!!!", 10, 18);
		}
		ctx.fillStyle = "green";
		ctx.fillText("Return to Main Menu", 10, 37);
		ctx.restore();
	}

	ctx.restore();
	if(high_score_l1<score_l1)high_score_l1=score_l1;
	if(high_score_l2<score_l2)high_score_l2=score_l2;

},20);

canvas.addEventListener('click', function(e){
	m_pos_x = e.clientX - (canvas.offsetLeft - window.pageXOffset);
	m_pos_y = e.clientY - (canvas.offsetTop - window.pageYOffset);
	//alert("x: "+m_pos_x+"y: "+m_pos_y);
	if ( (m_pos_x >= 125 && m_pos_x <= 200) && (m_pos_y >= 0 && m_pos_y <= 44) )
	{
		toPause();
	}else {
		bug_game.killBug(m_pos_x,m_pos_y);
	}
	if ( (bug_game.game_over) && (m_pos_x >= 0 && m_pos_x <= 200) && (m_pos_y >= 0 && m_pos_y <= 44))
	{
		document.getElementById("menu").style.display="";
		document.getElementById("canvas").style.display="none";
	}

}, false)


function game_start(){
bug_game.animate_id = window.setInterval(function(){window.requestAnimationFrame(animate);},20);
bug_game.clock_id = window.setInterval(updateTime,1000);
bug_game.checker_id = window.setInterval(checker,1000);
displayTime();

};

function game_restart(){

  score_l1=0;
  score_l2=0;
	bug_game = new Game();
	game_start();
};
