var express = require('express');
var app = express();
var brain = require('brain.js');
var fs = require('fs');
var terrain = {};

var net = new brain.NeuralNetwork();
try {
  var data = fs.readFileSync('my_learning.txt', 'utf8');
  var tabLearn = JSON.parse(data);
  net.train(tabLearn);
  console.log("txt : " + data);
} catch(e) {
  console.log('Error:', e.stack);
}


app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

app.get('/learn/:position', function(req, res){
  net = new brain.NeuralNetwork();
  var pos = req.params.position;
  var terrainKeys = Object.keys(terrain);
  var keyToRemove = terrainKeys.pop();
  console.log("to remove: "+ keyToRemove);
  delete terrain[keyToRemove];
  var newLearn = "{\"input\": "+JSON.stringify(terrain)+", \"output\":{\""+pos+"\": 1}}";
  console.log(newLearn);

  try {
    var data = fs.readFileSync('my_learning.txt', 'utf8');
    var tabLearn = JSON.parse(data);
    tabLearn.push(JSON.parse(newLearn));
    net.train(tabLearn);
    fs.writeFileSync('my_learning.txt', JSON.stringify(tabLearn), 'utf8');
    console.log("txt : " + data);
  } catch(e) {
    console.log('Error:', e.stack);
  }
//  var pos = JSON.parse(req.params.position);
  terrain = {}; // vider le terrain
  res.send("ok");
});

app.get('/play/:position', function(req, res){
  console.log("param : " + req.params.position);
  var pos = JSON.parse(req.params.position);
  var keys = Object.keys(pos);
  keys.forEach(function(element){
    terrain[element] = pos[element];
  });
  res.send("terrain :" + JSON.stringify(terrain));
});


app.get('/test', function(req, res){

  var output = net.run({jaune4: 1.1, jaune5:2.2, jaune6:3.3 }); // position des pions sur le terrain
  var bestChoice = getBestChoice(output);
  res.send(bestChoice[0]);  
});

app.get('/', function (req, res) {

    // le paramètre pour la finction run sera à récupérer en paramètre de la requête
    var output = net.run(terrain); // position des pions sur le terrain
    var bestChoice = getBestChoice(output);
    res.send(bestChoice[0]);
});


app.listen(8000, function () {
  console.log('Example app listening on port 8000!')
});


function getBestChoice(output){

  var keys = Object.keys(output); // le meilleur coup a jouer selon la situation (ce coup est déduit à partir des données d'entrainement)
  var bestChoice = [0, 0];
  keys.forEach(function(element){
    if(output[element] > bestChoice[1]){
      bestChoice[0] = element;
      bestChoice[1] = output[element];
    }
    console.log("out :" + output[element]);
    console.log("el : " + element);
  });
  return bestChoice;
}
