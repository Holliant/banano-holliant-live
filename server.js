require("dotenv").config();
const config = require(`./config.json`);

const express = require("express");
const app = express();

const lottoUtils = require("./utils/lottoUtils.js");

let lottoAddress = "";
let previousWinner = {
    "address": "ban_3freefkgfnazw7ajt1xyqgmijsjb9oc3mykm18pewy11wd7twd5hf4cbxekh",
    "hash": "F136DD03A2E4E39EF642ADF8551D6B74868D1B6BD3F647B912176AB7F06A6EFC",
    "amount": 10.52
};

lottoUtils.getLottoAddress().then(res => {
    lottoAddress = res;
});

app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
    
app.get("/lotto", (req, res) => {
    res.render("lotto", {
        "ticketPrice": config["ticket-price"],
        "jackpotAmount": 314,
        "lottoEnd": Date.now() + 60000,
        "previousWinner": previousWinner,
        "lottoAddress": lottoAddress
    });
})

app.get("*", (req, res, next) => {
    // res.json({
    //     "code": 404,
    //     "error": "Page not found"
    // });
    res.redirect("/lotto");
    next();
})
    
app.listen((process.env["PORT"] || 3000), () => {
    console.log(`UI is live! http://localhost:${(process.env["PORT"] || 3000)}`);
})