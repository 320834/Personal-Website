var http = require("http");
var fs = require("fs");
var querystring = require("querystring");
var cheerio = require("cheerio");
var jre = require('node-jre');

var server = http
  .createServer(function(req, res) {
    console.log(req.method + ": " + req.url);

    
    //This is for html files
    if(req.method === "GET" && req.url.includes(".html"))
    {

      var htmlFile = req.url;

      //console.log(req.url);

      if(req.url === "/snakegame.html")
      {
          console.log("called this block");
          var snakegame;
          snakegame = inputHighScores("websitefiles/highscore.json",'websitefiles/snakegame.html');

          res.writeHead(200, { "Content-Type": "text/html" });
          res.write(snakegame);
          res.end();
      }
      else
      {
          fs.readFile("websitefiles" + htmlFile, function(err, data) {
            res.writeHead(200, { "Content-Type": "text/html" });
            res.write(data);
            res.end();
          });
      }

    }
    //This is for photos
    else if(req.method === "GET" && req.url.includes("resources"))
    {
     //console.log("need photo");
      
      var nameOfFile = req.url;

      fs.readFile("websitefiles" + nameOfFile, function(err, data) {
            res.writeHead(200, { "Content-Type": "image/jpeg" });
            res.write(data);
            res.end();
      });
      
    }
    //Javascript files
    else if(req.method === "GET" && req.url.includes(".js"))
    {
        var htmlFile = req.url;

        fs.readFile("websitefiles" + htmlFile, function(err, data) {
          res.writeHead(200, { "Content-Type": "text/js" });
          res.write(data);
          res.end();
        });
    }
    //For POST
    else if(req.method === "POST" && req.url === "/newhighscore")
    {
      let body = "";

      req.on('data', chunk =>{
      body = body + chunk.toString();
      });

      req.on('end', ()=>{

      
      changeHighScore("websitefiles/highscore.json",body);


      setTimeout(function(){
        snakegame = inputHighScores("websitefiles/highscore.json","websitefiles/snakegame.html");
      },500);

      });

      setTimeout(function(){

      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write(snakegame); //write a response to the client
      res.end(); //end the response
      },1000);      

    }
    //For Post
    else if(req.method === "POST" && req.url === "/submitChar")
    {
       //console.log("Called this block");

       let str = "";
       req.on('data', chunk =>{
          str = str + chunk.toString();
       });

       req.on('end', ()=>{
          //console.log(str);

          str = str.replace("data=", "");

          //console.log(str);

          var letters = /^[A-Za-z]+$/;

          //Check if input is all in letters
          if(str.match(letters))
          {
            var output = jre.spawnSync([""], "WordFinder", [str], {encoding: 'utf-8'}).output[1];

            var htmlFile = inputWords(output);

            res.writeHead(200, { "Content-Type": "text/html" });
            res.write(htmlFile);
            res.end();
          }
          else
          {
            

            var htmlFile = inputWords("Please enter characters only");

            res.writeHead(200, { "Content-Type": "text/html" });
            res.write(htmlFile);
            res.end();
          }
       });
    }
    //Root of the website
    else {
      fs.readFile("websitefiles/home.html", function(err, data) {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.write(data);
        res.end();
      });

    }
  })
  .listen(80);

server.on("listening", function() {
  console.log("Server Sucessfully Running");
});

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
  
  if(highScore.length > 5)
  {
    highScore = highScore.slice(0,5);
  }



  highScore = JSON.stringify(highScore, null, 4);

  fs.writeFileSync(highScoreFile, highScore, 'utf8');
}

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

function inputWords(str)
{
  var htmlFile = fs.readFileSync("websitefiles/wordfinder.html",'utf8');

  const $ = cheerio.load(htmlFile);

  $("#inhere").text(str);

  return $.html();
}