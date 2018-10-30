var stage;
var circle;
var endGame = false;
var block;

var xaxispos = true;
var xaxisneg = false;
var yaxispos = false;
var yaxisneg = false;

var stageDimensions = 500;

var score = 0;
var scoreText;

var loop;
var food;

var snake = [];

function init()
{
	//code i guess goes here
	stage = new createjs.Stage("demoCanvas");

	score = 0;
	scoreText = new createjs.Text("Score: " + score,"20px Arial","#0307F9");
	scoreText.x = 10;
	scoreText.y = 10;
	stage.addChild(scoreText);

	//Initializes the starting snake.
	for(var i = 0; i < 4; i++)
	{
		block = new createjs.Shape();
		block.graphics.beginFill("#17F903").drawRect(0,0,20,20);

		//Explictly places position
		if(i === 0)
		{
			block.x = 80;
			block.y = 40;
		}
		else
		{
			block.x = 80 - (20 * i);
			block.y = 40;
		}

		stage.addChild(block);
		snake.push(block);

		stage.update();
	}

	//Spawns food
	spawnFood();
}

function changeMove(event)
{
	var v = event.which || event.keyCode;

	if(!endGame)
	{

		//a = 97
		if(v === 97)
		{
			if(xaxispos === true)
			{

			}
			else
			{
				xaxispos = false;
				xaxisneg = true;
				yaxispos = false;
				yaxisneg = false;
			}

			clearInterval(loop);

			stage.update();
		}   

    	//s = 115
    	if(v === 115)
    	{
    		if(yaxisneg === true)
    		{

    		}
    		else
    		{
    			xaxispos = false;
    			xaxisneg = false;
    			yaxispos = true;
    			yaxisneg = false;
    		}

    		clearInterval(loop);

    		stage.update();
    	}

    	//d = 100
    	if(v === 100)
    	{
    		if(xaxisneg === true)
    		{

    		}
    		else
    		{
    			xaxispos = true;
    			xaxisneg = false;
    			yaxispos = false;
    			yaxisneg = false;
    		}



    		clearInterval(loop);

    		stage.update();
    	}

    	//w = 119
    	if(v === 119)
    	{
    		if(yaxispos === true)
    		{

    		}
    		else
    		{
    			xaxispos = false;
    			xaxisneg = false;
    			yaxispos = false;
    			yaxisneg = true;
    		}



    		clearInterval(loop);

    		stage.update();
    	}

    	 //The loop code that moves last block in snake to front
    	 loopFunction(v);

    	}


    }


//The main function of the game. Includes a loop that checks 
//every 75 milliseconds
function loopFunction(v)
{
    if(v === 97 || v === 115 || v === 100 || v === 119)
    {
    
    	loop = setInterval(function()
   		{
			//2 
			if(xaxispos)
			{
				lastToFront(2);
			}

			//4
			if(xaxisneg)
			{
				lastToFront(4);
			}	

			//1
			if(yaxispos)
			{
				lastToFront(1);
			}

			//3
			if(yaxisneg)
			{
				lastToFront(3);
			}

			//Check if game is won
			if(winGame())
			{
				clearInterval(loop);
				endGame = true;
				alert("You Win");

				//Post scores to server
				post("/scoreSnake",{score: this.score},"POST");

				restart();
			}

			//Check if lost conditions are met. If so then it prompts user that they 
			//have lost and restarts the game
			checkLoseConditions()


			//Check collsion for food
			if(checkCollision(snake[0],food))
			{
				//Add block to end of snake
				addEnd();
				//Remove Food
				removeFood();

				//Spawn and new food
				spawnFood();

				score++;
				scoreText.text = "Score: " + score;


			}

			stage.update();


		}, 75);
    	
    }
}

/*
This function moves the last element (blocks) in array to front.
Once the block is moved to the front of the array, it changes 
the position on the canvas according to the paramter

@parameter This tells where the last block should be placed.

*/
function lastToFront(move)
{
	var last = snake.pop();

	//Move element to front of array.
	snake.unshift(last);

	switch(move)
	{

		case 1:
		//Up
		snake[0].x = snake[1].x;
		snake[0].y = snake[1].y + 20; 
		break;

		//right
		case 2:
		snake[0].x = snake[1].x + 20;
		snake[0].y = snake[1].y;
		break;

		case 3:
		snake[0].x = snake[1].x;
		snake[0].y = snake[1].y - 20;
		break;

		case 4:
		snake[0].x = snake[1].x - 20;
		snake[0].y = snake[1].y;
		break;
	}
}

function checkLoseConditions()
{
	//This block checks if the snake is in the dimensions
	if(snake[0].x < 0 || snake[0].x > stageDimensions)
	{
		clearInterval(loop);
		endGame = true;
		alert("You Lost");
		//Post scores to server

		post("/scoreSnake",{score: this.score},"POST");

		restart();


	}
	else if(snake[0].y < 0 || snake[0].y > stageDimensions)
	{
		clearInterval(loop);
		endGame = true;

		alert("You Lost");

		//Posts score to server
		post("/scoreSnake",{score: this.score},"POST");

		restart();
		
	}

	//Check collsion with snake block
	for(var i = 1; i < snake.length; i++)
	{
		if(checkCollision(snake[0], snake[i]))
		{
			clearInterval(loop);
			endGame = true;

			alert("You Lost");

			//Posts score to server
			post("/scoreSnake",{score: this.score},"POST");
			restart();

		}	
	}
}

//Restarts the game once player lose
function restart()
{

	
	xaxispos = false;
	xaxisneg = false;
	yaxispos = false;
	yaxisneg = false;

	snake = [];
	init();
	endGame = false;
}


//Checks the collision between two objects.
//@paramter Has to be Shape objects
function checkCollision(block, target)
{
	if(block.x === target.x && block.y === target.y)
	{
		console.log("Hit Block");
		return true;
	}

	return false;
}

//Add block to end of snake if food has been eaten.
function addEnd()
{
	//Check all four sides of last block

	//Get last element
	var last = snake[snake.length - 1];
	var secondLast = snake[snake.length - 2];

	var blockRe;

	if(last.x === secondLast.x && last.y - 20 === secondLast.y)
	{
		//Add below
		blockRe =  new createjs.Shape();
		blockRe.graphics.beginFill("#17F903").drawRect(0,0,20,20);
		stage.addChild(blockRe);

		blockRe.x = last.x;
		blockRe.y = last.y + 20;

		snake.push(blockRe);
		stage.update();

	}
	else if(last.x === secondLast.x && last.y + 20 === secondLast.y)
	{
		//Add above
		blockRe =  new createjs.Shape();
		blockRe.graphics.beginFill("#17F903").drawRect(0,0,20,20);
		stage.addChild(blockRe);

		blockRe.x = last.x;
		blockRe.y = last.y - 20;

		snake.push(blockRe);
		stage.update();
	}
	else if(last.x - 20 === secondLast.x && last.y === secondLast.y)
	{
		//Add right

		blockRe =  new createjs.Shape();
		blockRe.graphics.beginFill("#17F903").drawRect(0,0,20,20);
		stage.addChild(blockRe);

		blockRe.x = last.x + 20;
		blockRe.y = last.y;

		snake.push(blockRe);
		stage.update();
	}
	else if(last.x + 20 === secondLast.x && last.y === secondLast.y)
	{
		//Add left

		blockRe =  new createjs.Shape();
		blockRe.graphics.beginFill("#17F903").drawRect(0,0,20,20);
		stage.addChild(blockRe);

		blockRe.x = last.x - 20;
		blockRe.y = last.y;

		snake.push(blockRe);
		stage.update();
	}
}
	

//Functions spawn food randomly on the cavnas board
function spawnFood()
{
	//This do while loop finds the appropriate food
	do
	{
		var flag = false;
		var valueX = Math.floor(Math.random() * (stageDimensions));
		var valueY = Math.floor(Math.random() * (stageDimensions));

		if(valueX % 20 !== 0)
		{
			var r = valueX % 20;
			valueX = valueX - r;
		}

		if(valueY % 20 !== 0)
		{
			var r = valueY % 20;
			valueY = valueY - r;
		}

		for(var i = 0; i < snake.length; i++)
		{
			if(snake[i].x === valueX)
			{
				flag = true;
			}

			if(snake[i].y === valueY)
			{
				flag = true;
			}
		}

	}
	while(flag);
	
	//Actual spawning of food
	food = new createjs.Shape();
	food.graphics.beginFill("#ff0000").drawRect(0,0,20,20);

	food.x = valueX;
	food.y = valueY;
	stage.addChild(food);
	stage.update();
}

//Function to remove food once snake eats it
function removeFood()
{
	food.x = -50;
	food.y = -50;

	stage.removeChild(food);
	stage.update();
}


//Win game condition
//Returns true if snake covers entire board. 
function winGame()
{
	if(snake.length === (stageDimensions * stageDimensions)/400)
	{
		return true;
	}

	return false;
}

//Credit goes to a stack overflow person for this method
function post(path, params, method) {
    method = method || "post"; // Set method to post by default if not specified.

    console.log("Called this function");
    // The rest of this code assumes you are not using a library.
    // It can be made less wordy if you use one.
    var form = document.createElement("form");
    form.setAttribute("method", method);
    form.setAttribute("action", path);

    for(var key in params) {
        if(params.hasOwnProperty(key)) {
            var hiddenField = document.createElement("input");
            hiddenField.setAttribute("type", "hidden");
            hiddenField.setAttribute("name", key);
            hiddenField.setAttribute("value", params[key]);

            form.appendChild(hiddenField);
        }
    }

    document.body.appendChild(form);
    form.submit();
}

function alertInput()
{
	var person = prompt("Congragulations! You got a new high score. Please enter your name to immortalize your achievements on this website");

	if(person === null || person === "")
	{
		do
		{

			person = prompt("No I insist. Please enter a name. Or a bunch of letters");

		}while(person === null || person === "");
	}

	post("/scorePostSnake",{name: person, score: getScore()});
}

function getScore()
{
	var x = document.getElementById("input").textContent;
	return x;
}