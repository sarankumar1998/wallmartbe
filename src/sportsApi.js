const express = require("express");
const Router = express.Router();
const con = require("./db");

// getall
Router.get("/getsports/", function (req, res) {
  con.query(
    // "SELECT * " +
    //   "FROM `slot` " +
    //   " INNER JOIN `address` ON `slot`.`id` = `address`.`slot_fk` INNER JOIN `sportsmain` ON `sportsmain`.`id` = `address`.`sportmainId`  ",

    "SELECT *  " + "FROM `mainslots` " + " INNER JOIN `address` ON `mainslots`.`zoneId` = `address`.`mainslotId` INNER JOIN `slot` ON `slot`.`id` = `address`.`slot_fkey`   INNER JOIN `sportsmain` ON `sportsmain`.`id` = `address`.`sportmainId`  ",

    function (error, results) {
      if (error) throw error;
      return res.send(results);
    }
  );
});



Router.put('/up/:id', (req, res)=>{
  // ID via params
  var {id} = req.params;

  // req body
  var {status} = req.body;
  var {userId} = req.body;



  // Query
  var query = `UPDATE slot SET status='${status}',userId='${userId}' WHERE id=${id}`;

  // Run the query
  con.query(query, function (error, data) {
    if (error) {
      console.log(error);
      return res.status(500).json(error);
    } else {
      res.status(200)
      .send({data});
    }
  });
});

  


Router.get("/getalltime/", function (req, res) {

  con.query(
    "SELECT * FROM slot ",
    function (error, results ) {
      if (error) throw error;
      return res.send(results);
    }
  );
});



module.exports = Router;
