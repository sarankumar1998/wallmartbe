var mysql = require('mysql');

var con = mysql.createConnection({
  host: "database1.ch2k4ecqqjte.eu-north-1.rds.amazonaws.com",
  user: "admin",
  password: "samsunga6+",
  database: 'wallmart',
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