require(`dotenv`).config({ path: `../.env` });
const config = require(`../config.json`);

const axios = require(`axios`).default;
const bananojs = require(`@bananocoin/bananojs`);
bananojs.bananodeApi.setUrl(config["http-node"]);

const privateSeed = process.env["LOTTO_SEED"];
const privateKey = bananojs.getPrivateKey(privateSeed, 0);

let keys = [privateKey];

// const privateKey = bananojs.getPrivateKey(privateSeed, 0);

let lottoAddress = "";

const getLottoAddress = async () => {
    let tempLottoAddy = "";
    await bananojs.getPublicKey(privateKey).then(publicKey => {
        tempLottoAddy = bananojs.getBananoAccount(publicKey);
    });
    return tempLottoAddy;
}

const sendBan = async (destAccount, amountRaw, pkI=0) => {
    const response = await bananojs.bananoUtil.sendFromPrivateKey(
        bananojs.bananodeApi,
        keys[pkI],
        destAccount,
        amountRaw,
        `ban_`
    );
    console.log(`payment successful: (${(amountRaw / 1e29).toFixed(8)} BAN)`, response);
    return response;
}

const accountInfo = async (account) => {
    let accInfo = await bananojs.getAccountInfo(account, {
        "representative": "true"
    });
    return accInfo;
};

const getBlockInfo = async (blockHash) => {
    let toReturn = {};
    await axios.post(config["http-node"], {  
        "action": "block_info",
        "json_block": "true",
        "hash": blockHash
    })
    .then(res => {
        toReturn = res.data;
    })
    .catch(err => console.log(err));
    return toReturn;
}

const listPending = async (address) => {
    let toReturn = {};
    await axios.post(config["http-node"], {
        "action": "accounts_pending",
        "accounts": [address],
        "threshold": config["ticket-price"].toLocaleString("fullwide", { useGrouping: false }),
        "source": true
    })
    .then(res => {
        toReturn = res.data;
    })
    .catch(err => console.log(err));
    return toReturn;
}

const receivePending = async (pkI=0) => {
    const txList = await bananojs.receiveBananoDepositsForSeed(privateSeed, pkI, config["rep-account"]);
}

const pickWinner = async () => {
    let lottoEntries = [];
    await listPending(lottoAddress).then(res => {
        for (const [txHash, txInfo] of Object.entries(res["blocks"][lottoAddress])) {
            for (
                i = 0;
                i < Math.floor(txInfo["amount"] / config["ticket-price"]);
                i++
            ) {
                lottoEntries.push(txInfo["source"]);
            };
        };
    });
    return [lottoEntries[Math.floor(Math.random() * lottoEntries.length)], lottoEntries];
}

const lottoDraw = async () => {
    let winnerAddress;
    let totalEntries;
    let winnerTickets = 0;
    await pickWinner().then(res => {
        winnerAddress = res[0];
        totalEntries = res[1].length;
        res[1].forEach(userAddress => {
            if (userAddress == winnerAddress) winnerTickets += 1;
        });
    });
    await receivePending();
    let winAmount = (await accountInfo(lottoAddress)).balance;
    let payoutHash = await sendBan(winnerAddress, winAmount);
    return {
        "address": winnerAddress,
        "tickets": winnerTickets,
        "total": totalEntries,
        "hash": payoutHash
    };
}

(async () => {
    lottoAddress = await getLottoAddress();
    getLottoAddress().then(res => {
        lottoAddress = res;
    });
    // lottoDraw().then(res => console.log(res));
})();

module.exports = {
    lottoDraw: lottoDraw,
    getLottoAddress: getLottoAddress,
    accountInfo: accountInfo
};