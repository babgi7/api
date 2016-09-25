var mysql      = require('mysql');
var express    = require('express');
var bodyParser = require('body-parser');
var port = process.env.PORT || 8080;
var app        = express();
var _    = require('underscore');

var router = express.Router();              // get an instance of the express Router


var connection = mysql.createConnection({
  host     : '',
  user     : '',
  password : '',
  database : 'ungrnet_GameRecycle'
});


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.get('/api', function(req, res) {
  connection.connect(function(err) {
    if (err) {
      console.error('error connecting: ' + err.stack);
    }
    connection.query("SELECT * FROM user", function(err, rows, fields) {
    if (err) throw err;
     console.log('The solution is: ', rows);
     res.send(rows)
   });
    console.log('connected as id ' + connection.threadId);

  });

})


app.get('/article', function(req, res){
  connection.connect(function(err) {
    if (err) {
      console.error('error connecting: ' + err.stack);
      res.send(err.stack)
    }
    connection.query("SELECT * FROM article", function(err, rows, fields) {
    if (err) throw err;
     res.send(rows)
   });
    console.log('connected as id ' + connection.threadId);

  });
})

app.post('/singup', function(req, res) {
// var query = "INSERT INTO user (name, username, email, password) \
// VALUES('"+req.body.name+"', '"+req.body.username+"', '"+req.body.email+"', '"+req.body.password+"')"

var verification = "SELECT username, email FROM user"
console.log(verification);
connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    res.send(err.stack)
  }
  connection.query(verification, function(err, rows, fields) {
  if (err) throw err;
  //res.send(rows)
  var findings=[]
   _.each(rows, function(row,index){
     console.log(row);
    if(row.username == req.body.username){
      findings.push({username:'username exsit'})
    }
    if(row.email == req.body.email)   {
      findings.push({email:'email exsit'})
    }
   })
   console.log();
   if(findings.length == 0){
    // connection.connect(function(err) {})
     var query = "INSERT INTO user (name, username, email, password) \
     VALUES('"+req.body.name+"', '"+req.body.username+"', '"+req.body.email+"', '"+req.body.password+"')"
     if(err) console.log(err);
     connection.query(query, function(err, rows, fields) {
      if (err) throw err;
      console.log(rows);
    })

     res.send('you can singup')
   }



 });
  console.log('connected as id ' + connection.threadId);
});

})



app.listen(port);
console.log('http://localhost:' + port);
