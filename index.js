var mysql      = require('mysql');
var express    = require('express');
var bodyParser = require('body-parser');
var port = process.env.PORT || 8080;
var app        = express();
var _    = require('underscore');
var jwt = require('jsonwebtoken');

var router = express.Router();              // get an instance of the express Router

var pool  = mysql.createPool({
  connectionLimit : 10,
  host     : '',
  user     : '',
  password : '',
  database : ''
});


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// issue a web token start here

// app.use(function(req, res, next){
//   console.log(req.path);
//  if(req.path != '/login'){
//    var token = req.headers['x-access-token'];
//    jwt.verify(token, 'secertKey', function(err, decoded) {
//     if(err){
//       res.status(401).json({message:"invalid token"})
//     }else {
//       next()
//     }
//  });
// }
//
// })

// issue webtoken ends here

app.get('/api', function(req, res) {
  // connection.connect(function(err) {
  //   if (err) {
  //     console.error('error connecting: ' + err.stack);
  //   }
  //   connection.query("SELECT * FROM user", function(err, rows, fields) {
  //   if (err) throw err;
  //    console.log('The solution is: ', rows);
  //    res.send(rows)
  //  });
  //   console.log('connected as id ' + connection.threadId);
  //
  // });

  pool.getConnection(function(err, connection) {
    connection.query( 'SELECT * FROM user', function(err, rows) {
      res.send(rows)
      // console.log(pool._freeConnections.indexOf(connection)); // -1
      //
      connection.release();
      //
      // console.log(pool._freeConnections.indexOf(connection)); // 0

   });
});


})


// post articals start here
app.post('/article', function(req, res){
  pool.getConnection(function(err, connection) {
    var query = "INSERT INTO article (title, body, photo, user_id) VALUES ('"+ req.body.title +"', '"+ req.body.body +"', '"+ req.body.photo +"', (SELECT user_id FROM user WHERE name = 'Mazen'))";
    connection.query(query, function(err, result) {
      if(err){
        console.log(err);
        res.send(err)
      }
      console.log(result);
        res.json({message:"Artical was added"})
    })
    connection.release();
    console.log('connection released');
  })
})
// post articals ends here

// get articals start here
app.get('/article', function(req, res){
  pool.getConnection(function(err, connection) {
    connection.query('SELECT * FROM article', function(err, rows) {
      if(err){
        console.log(err);
        res.send(err)
      }
        res.send(rows)
    })
    connection.release();
    console.log('connection released');
  })
})
// get articles ends here

// update articles starts here
app.put('/article', function(req, res){
  pool.getConnection(function(err, connection) {
    var query = "UPDATE article SET title ='"+ req.body.title +"', body='"+ req.body.body +"', photo='"+ req.body.photo +"' WHERE article_id = " + req.body.article_id + " AND user_id = " + req.body.user_id;
    connection.query(query, function(err, result) {
        console.log(result.affectedRows);
      if(err) {
        console.log(err);
        res.send(err)
      }
       if(result.affectedRows !=0) {
        res.json({message:"Artical was updated"})
      } else {
        res.json({message:"Something wrong happended"})
      }
    })
    connection.release();
    console.log('connection released');
  })
})
// update articles ends here

// delete articles starts here
app.delete('/article', function(req, res){
  pool.getConnection(function(err, connection) {
    var query = "DELETE FROM article WHERE article_id = " + req.body.article_id + " AND user_id = " + req.body.user_id;
    connection.query(query, function(err, result) {
      if(err){
        console.log(err);
        res.send(err)
      }
        console.log(result);
        res.json({message:"Artical was deleted"})
    })
    connection.release();
    console.log('connection released');
  })
})
// delete articles ends here




// login API starts here
app.post('/login', function(req, res){
  pool.getConnection(function(err, connection) {
    var query = "SELECT user_id FROM user WHERE username = '" + req.body.username +"' AND password = '"+ req.body.password +"'";
    connection.query(query, function(err, rows) {
      if (err) {
        console.log(err);
        res.send(err)
      }
       if(rows == 0){
         res.status(401).json({message:"username or password is invalid"})
       } else {
           var payload =  req.body.username + new Date()
           var token = jwt.sign({ foo: payload }, 'secertKey', {
            expiresIn: '24h' // expires in 24 hours
          });
         res.json({
           user_id:rows[0].user_id,
           token: token
         })
       }
    })
    connection.release();
    console.log('connection released');
  })
})
// login API ends here


// singup API start here
app.post('/singup', function(req, res) {
  pool.getConnection(function(err, connection) {
    connection.query('SELECT username, email FROM user', function(err, rows) {
      if (err) {
        console.log(err);
        res.send(err)
      }
      var findings;
      for (var i = 0; i < rows.length; i++) {
        if ((rows[i].username == req.body.username && rows[i].email == req.body.email)) {
          findings = {
            message: 'username and email exsit'
          };
          break;
        } else if ((rows[i].username == req.body.username && rows[i].email != req.body.email)) {
          findings = {
            message: 'username exsit'
          };
          break;
        } else if ((rows[i].username != req.body.username && rows[i].email == req.body.email)) {
          findings = {
            message: 'email exsit'
          };
          break;
        }
      }

      if (findings) {
        res.send(findings)
      } else {
        var query = "INSERT INTO user (name, username, email, password) \
         VALUES('" + req.body.name + "', '" + req.body.username + "', '" + req.body.email + "', '" + req.body.password + "')"
        connection.query(query, function(err, rows) {
          if (err) {
            console.log(err);
            res.send(err)
          }
          res.json({
            message: 'you singup'
          })
        })
      }
    });
    connection.release();
    console.log('connection released');
  });
});
// singup ends here

// forget password API starts here
app.post('/forgetpwd', function(req, res){
  pool.getConnection(function(err, connection) {
    var query = "SELECT username, email, user_id FROM user WHERE username ='"+ req.body.username +"' OR email = '"+ req.body.email + "'";
    connection.query(query, function(err, rows) {
      if(err){
        console.log(err);
        res.send(err)
      }
      if(rows == 0){
        res.json({message:'Invalid username or email'})
      }else {
        var userID = rows[0].user_id

        // TODO: right function to generat password temp PWD
        var tempPWD = "ZZZZZO00000"
        query = "UPDATE user SET password = '" + tempPWD + "' WHERE user_id = " + userID;
        connection.query(query, function(err, result) {
         // TODO: send email to user
            if(err){
              console.log(err);
              res.send(err)
            }
            console.log(result);
            if(result.affectedRows != 0){
              res.json({message:'New password was generated, please check your email'})
            }else {
              res.json({message:'Something went wrong, please try again later'})
            }
        })
      }
    })
    connection.release();
    console.log('connection released');
  })
})
// forget password ends here


app.listen(port);
console.log('http://localhost:' + port);
