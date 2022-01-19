require("dotenv").config();
const config = require(`./config.json`);

const express = require("express");
var moment = require('moment');
const app = express();

const lottoUtils = require("./utils/lottoUtils.js");

let lottoAddress = "";
let previousWinner = {};

lottoUtils.getLottoAddress().then(res => {
    lottoAddress = res;
});

setInterval(() => {
    if (moment().endOf("day") - Date.now() <= 10000) {
        lottoUtils.lottoDraw().then(res => {
            console.log(res);
            if (res["address"]) {
                previousWinner = res;
            };
        });
    };
}, 10000)

app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");

app.get("/", (req, res, next) => {
    // res.json({
    //     "code": 404,
    //     "error": "Page not found"
    // });
    res.redirect("/lotto");
    next();
})

app.get("/lotto", async (req, res) => {
    let jackpotBalance = await lottoUtils.accountBalance(lottoAddress);
    res.render("lotto", {
        "ticketPrice": config["ticket-price"],
        "jackpotAmount": parseInt(jackpotBalance.balance) + parseInt(jackpotBalance.pending),
        "previousWinner": previousWinner,
        "lottoAddress": lottoAddress
    });
})
    
app.listen((process.env["PORT"] || 3000), () => {
    console.log(`UI is live! http://localhost:${(process.env["PORT"] || 3000)}`);
})