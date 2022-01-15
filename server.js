require("dotenv").config();

const express = require("express");
const app = express();

app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");

// app.get("/", (req, res) => {
//     res.render("index", {});
// })
    
app.get("/lotto", (req, res) => {
    res.render("lotto", {});
})

app.get("*", (req, res, next) => {
    res.json({
        "code": 404,
        "error": "Page not found"
    });
    next();
})
    
app.listen(process.env["PORT"] || 3000);