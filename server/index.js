const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql");

const db  = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "password",
    database: "recordstable",
});
app.use(bodyParser.urlencoded({extended: true}))
app.use(cors());
app.use(express.json());

app.get("/api/get", (req, res) => {
    const sqlSelect = "SELECT * FROM records ORDER BY generations DESC LIMIT 3";
    db.query(sqlSelect, (err, result) => {
        res.send(result);
    })
})

app.post("/api/add", (req, res) => {
    const generations = req.body.generations;
    let sqlInsert = "INSERT INTO records (generations) VALUES (?)";
    db.query(sqlInsert, [generations], (err, result) => {
        console.log(result);
    })
})

app.listen(3001, () => {
    console.log("Start listening at port 3001")
})