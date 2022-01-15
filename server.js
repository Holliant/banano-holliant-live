const express = require('express')
const app = express()

app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");

app.get('/', (req, res) => {
    console.log("Here")
    res.send("Hi")
})

app.get('/lotto', (req, res) => {
    console.log("Here")
    res.send("Lotto page here")
})

app.listen(3000)
