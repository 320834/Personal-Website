var http = require("http");
var fs = require("fs");
var querystring = require('querystring');
var cheerio = require('cheerio');

var home = fs.readFileSync('WebsiteFiles/home.html');
var snakegame = fs.readFileSync('WebsiteFiles/snakegame.html');

var server = http.createServer(function (req, res)
{
	console.log(req.method + ": " + req.url);
	if(req.method === 'POST' && req.url === '/scorePostSnake')
	{
		let body = "";

		req.on('data', chunk =>{
			body = body + chunk.toString();
		});

		req.on('end', ()=>{

			
			changeHighScore("snakeHighScore.json",body);


			setTimeout(function(){
				snakegame = inputHighScores("snakeHighScore.json","WebsiteFiles/snakegame.html");
			},500);

		});

		setTimeout(function(){

			res.writeHead(200, {'Content-Type': 'text/html'});
			res.write(snakegame); //write a response to the client
			res.end(); //end the response
		},1000);

	}
	else if(req.method === 'POST' && req.url === '/scoreSnake')
	{
		let body = "";
		var newScore = 0;
		

		var highScoreSnake = JSON.parse(fs.readFileSync('snakeHighScore.json'),'utf8');

		//Get the score from end of a snake game
		req.on('data', chunk =>{
			body = body + chunk.toString();
		});

		req.on('end', ()=> {
			var stringquery = querystring.parse(body);

			console.log(stringquery['score']);
			newScore = stringquery['score'];
		});

		setTimeout(function(){

			//Checks if the score a new high score. If it is, then it prompts the user for
			//a name.
			if(checkHigh(highScoreSnake,newScore))
			{
				fs.readFile("WebsiteFiles/blank.html",function(err,data){

					var htmlString = data;

					htmlString = editHTML(htmlString,"#input",newScore);

					res.writeHead(200, {'Content-Type' : 'text/html'});
					res.write(htmlString);
					res.end();

				});
			}
			else
			{

				snakegame = inputHighScores("snakeHighScore.json","WebsiteFiles/snakegame.html");
				//If the score isn't part of the top then it doesn't ask for input.

				res.writeHead(200, {'Content-Type' : 'text/html'});
				res.write(snakegame);
				res.end();

			}

		},500);

	}
	else if(req.method === 'GET' && req.url === '/wordfinder.html')
	{
		fs.readFile("WebsiteFiles/wordfinder.html", function (err, data) {
     		res.writeHead(200, {'Content-Type': 'text/html'});
      		res.write(data);
      		res.end();
   		});
	}
	else if(req.method === 'GET' && req.url === '/snakegame.html')
	{
		snakegame = inputHighScores("snakeHighScore.json","WebsiteFiles/snakegame.html");

     	res.writeHead(200, {'Content-Type': 'text/html'});
      	res.write(snakegame);
      	res.end();

	}
	else if(req.method === 'GET' && req.url === '/snake.js')
	{
		fs.readFile("WebsiteFiles/snake.js", function (err, data) {
     		res.writeHead(200, {'Content-Type': 'text/js'});
      		res.write(data);
      		res.end();
   		});
	}
	else if(req.method === 'GET' && req.url === '/styles.css')
	{
		fs.readFile("WebsiteFiles/styles.css", function (err, data) {
     		res.writeHead(200, {'Content-Type': 'text/css'});
      		res.write(data);
      		res.end();
   		});
	}
	else if(req.method === 'GET' && req.url === '/Applet.jar')
	{
		fs.readFile("WebsiteFiles/Applet.jar", function (err, data) {
     		res.writeHead(200, {'Content-Type': 'application/java-archive'});
      		res.write(data);
      		res.end();
   		});
	}
	else if(req.method === 'GET' && req.url === '/Applet1.class')
	{
		fs.readFile("WebsiteFiles/Applet1.class", function (err, data) {
     		res.writeHead(200, {'Content-Type': 'application/java-vm'});
      		res.write(data);
      		res.end();
   		});
	}
	else if(req.method === 'GET' && req.url === '/Applet1$1.class')
	{
		fs.readFile("WebsiteFiles/Applet1$1.class", function (err, data) {
     		res.writeHead(200, {'Content-Type': 'application/java-vm'});
      		res.write(data);
      		res.end();
   		});
	}
	else if(req.method === 'GET' && req.url === '/HashTable.class')
	{
		fs.readFile("WebsiteFiles/HashTable.class", function (err, data) {
     		res.writeHead(200, {'Content-Type': 'application/java-vm'});
      		res.write(data);
      		res.end();
   		});
	}
	else if(req.method === 'GET' && req.url === '/Node.class')
	{
		fs.readFile("WebsiteFiles/Node.class", function (err, data) {
     		res.writeHead(200, {'Content-Type': 'application/java-vm'});
      		res.write(data);
      		res.end();
   		});
	}
	else if(req.method === 'GET' && req.url === '/WordFinder.class')
	{
		fs.readFile("WebsiteFiles/WordFinder.class", function (err, data) {
     		res.writeHead(200, {'Content-Type': 'application/java-vm'});
      		res.write(data);
      		res.end();
   		});
	}
	else
	{
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.write(home);
		res.end();
	}

}).listen(8080);

server.on('listening', function(){
	console.log("Server Sucessfully Running");
});

//top10 has to be an .json object while score has to be a string
function checkHigh(top10,score)
{

	for(var i = 0; i < 10; i++)
	{

		if(top10[i] === undefined)
		{
			return true;
		}

		if(parseInt(top10[i]['score'],10) <= parseInt(score,10))
		{
			return true;
		}

	}
	

	return false;
	
}

//htmlFile has to be a string with html elements. ID is the id inside an
//element. Value is the content to put inside id.
function editHTML(htmlFile,id,value)
{
	const $ = cheerio.load(htmlFile);

	$(id).text(value);

	return $.html();
}

//Body has to be a string and highScoreFile has to be .json file with an array inside it
function changeHighScore(highScoreFile, body)
{
	//Gets the file for highscore
	var highScore = JSON.parse(fs.readFileSync(highScoreFile, 'utf8'));

	//Gets the file for response
	var stringquery = querystring.parse(body);
	highScore.push(stringquery);
	
	for(var i = highScore.length - 1; i > 0; i--)
	{
		if(parseInt(highScore[i]['score'], 10) >= parseInt(highScore[i-1]['score'], 10))
		{
			//swap things
			var temp = highScore[i];
			highScore[i] = highScore[i-1];
			highScore[i-1] = temp;
		}
		else
		{
			console.log("End swap");
			break;
		}
	}
	
	if(highScore.length > 10)
	{
		highScore = highScore.slice(0,10);
	}



	highScore = JSON.stringify(highScore, null, 4);

	fs.writeFileSync(highScoreFile, highScore, 'utf8');
}

//Inputs the contents from highscore file into the html file using cheerio which is similar ot jquery.
//elementName: If it is id then use #name
function inputHighScores(fileHighScoreName,fileHtmlName)
{
	//For scripts
	//When file is first loaded
	//Update webpage of change

	//Load highScoreFile and html file
	var highscore = JSON.parse(fs.readFileSync(fileHighScoreName, 'utf8'));
	var htmlFile = fs.readFileSync(fileHtmlName,'utf8');

	//Load html file
	const $ = cheerio.load(htmlFile);

	//Changed the html 
	var string = "";
	var tagName = "";
	var tagScore = "";
	var digit = 0;
	for(var i = 0; i<highscore.length;i++)
	{
		digit = i + 1;
		tagName = "#" + digit.toString() + "n";
		tagScore = "#" + digit.toString() + "s";
		

		$(tagName).text(highscore[i]['name']);
		$(tagScore).text(highscore[i]['score']);

	}
   	return $.html();
}