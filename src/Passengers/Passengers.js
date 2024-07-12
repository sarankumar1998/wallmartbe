const express = require("express");
const Router = express.Router();
const con = require("../db");



Router.get('/persons', (req, res) => {
    const query = 'SELECT * FROM passengers';
    con.query(query, (err, result) => {
      if (err) throw err;
      console.log('Retrieved persons from the DB:', result);
      res.send(result);
    });
  });

  // Delete a person from the database by ID
Router.delete('/persons/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'DELETE FROM passengers WHERE id = ?';
    con.query(sql, id, (err, result) => {
      if (err) throw err;
      console.log('Person deleted from the DB:', result);
      res.send(result);
    });
  });


// POST API to save data
Router.post('/pass', (req, res) => {
    const { persons } = req.body;
    console.log(persons,"persons");
    if (!persons || !Array.isArray(persons)) {
     
      return res.status(400).json({ error: 'Invalid data' });
    }
  
    const query = 'INSERT INTO passengers (name, age, userId) VALUES ?';
  
    const values = persons.map((person) => [person.name, person.age, person.userId]);
  
    con.query(query, [values], (error, results) => {
      if (error) {
        console.error('Error saving data:', error);
        return res.status(500).json({ error: 'Error saving data' });
      }
  
      console.log('Data saved successfully');
      return res.status(200).json({ success: "Save successfully" });
    });
  });
  
module.exports = Router;