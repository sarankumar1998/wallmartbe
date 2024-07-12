var mysql = require('mysql2');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "jarvo",
  database:'wallmart',
  port:3306


});

con.connect(function(err) {
  if(err){
    console.log('check your connections');
  }
  else{
    console.log("Connected!");
  }

});

module.exports = con