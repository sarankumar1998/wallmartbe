const express = require("express");
const Router = express.Router();
const con = require("./db");
var moment = require("moment");

// byId
Router.get("/special/Obj/:id", function (req, res) {
  let user_id = req.params.id;
  con.query(
    "SELECT * FROM vendorview where userId=?",
    user_id,
    function (error, results) {
      if (error) throw error;
      return res.send(results);
    }
  );
});

Router.get("/special/users/:id", function (req, res) {
  let user_id = req.params.id;
  con.query(
    "SELECT * FROM users where id=?",
    user_id,
    function (error, results) {
      if (error) {
        console.log(error);
        return res.status(500).json(error);
      } else {
        res.status(200).send(...results);

      }
    }
  );
});

// for profile
Router.get("/profile/users/:id", function (req, res) {
  let user_id = req.params.id;
  con.query(
    "SELECT * FROM users where id=?",
    user_id,
    function (error, results) {
      if (error) {
        console.log(error);
        return res.status(500).json(error);
      } else {
        // below data for object
        res.status(200).send(...results);
      }
    }
  );
});

// getall
Router.get("/special/Obj/", function (req, res) {
  con.query("SELECT * FROM vendorview ", function (error, results) {
    if (error) throw error;
    return res.json(results);
  });
});

Router.post("/members", function (req, res) {
  // req  body
  var name = req.body.name;
  var email = req.body.email;
  var message = req.body.message;
  var mobile = req.body.mobile;
  var status = req.body.status;
  var userId = req.body.userId;

  // query
  var query = `INSERT INTO vendorview 
	(name, email, message, mobile,status,userId) 
	VALUES ("${name}", "${email}", "${message}", "${mobile}","${status}","${userId}")`;

  // Run the query
  con.query(query, function (error, data) {
    console.log(data);
    if (error) {
      console.log(error);
      return res.status(500).json(error);
    } else {
      res.status(200).json({ ...data });
    }
  });
});

Router.put("/members/update/:id", (req, res) => {
  // ID via params
  var { id } = req.params;

  // req body
  var { status } = req.body;
  var { Remarks } = req.body;

  // Query
  var query = `UPDATE vendorview SET status='${status}', Remarks='${Remarks} 'WHERE id=${id}`;

  // Run the query
  con.query(query, function (error, data) {
    if (error) {
      console.log(error);
      return res.status(500).json(error);
    } else {
      res.status(200).send({ ...data });
    }
  });
});
Router.delete("/member/remove/:id", function (req, res) {
  con.query(
    "DELETE FROM vendorview WHERE id=?",
    [req.params.id],
    function (error, results, fields) {
      if (error) {
        return res.status(500).json(error);
      } else
        res.json({
          message: "deleted successfully",
        });
    }
  );
});

module.exports = Router;
