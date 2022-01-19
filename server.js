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
    if (moment().endOf("hour") - Date.now() <= 10000) {
        lottoUtils.lottoDraw().then(lottoRes => {
            console.log(lottoRes);
            if (lottoRes["address"]) {
                previousWinner = lottoRes;
            };
        });
    };
}, 10000)

app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");

app.use(express.json()); // to support JSON-encoded bodies
app.use(express.urlencoded({ extended: true })); // to support URL-encoded bodies

app.use((err, req, res, next) => {
    // console.error(err);
    if (err) {
        res.json({
            "status": 500,
            "message": "Internal server error"
        });
    } else { next() };
})

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

app.post("/api*", async (req, res, next) => {
    if (!req.body || !req.body["token"] || req.body["token"] != process.env["API_TOKEN"]) {
        res.json({
            "status": 401,
            "message": "Unauthorized request"
        });
    } else {
        next();
    };
})

app.post("/api/draw_lotto", async (req, res) => {
    lottoUtils.lottoDraw().then(lottoRes => {
        console.log(lottoRes);
        if (lottoRes["address"]) {
            previousWinner = lottoRes;
        };
        res.json(lottoRes);
    })
})

app.listen((process.env["PORT"] || 3000), () => {
    console.log(`UI is live! http://localhost:${(process.env["PORT"] || 3000)}`);
})