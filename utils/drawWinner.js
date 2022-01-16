require(`dotenv`).config({ path: `../.env` });
const config = require(`../config.json`);

const axios = require(`axios`).default;
const bananojs = require(`@bananocoin/bananojs`);
bananojs.bananodeApi.setUrl(config["http-node"]);

const privateSeed = process.env["LOTTO_SEED"];
const privateKey = bananojs.getPrivateKey(privateSeed, 0);

let keys = [privateKey];

// const privateKey = bananojs.getPrivateKey(privateSeed, 0);

bananojs.getPublicKey(privateKey).then(pubKey => console.log(`Send funds to ${bananojs.getBananoAccount(pubKey)}`));

let sendBan = async (destAccount, amountRaw, pkI=0) => {
    const response = await bananojs.bananoUtil.sendFromPrivateKey(
        bananojs.bananodeApi,
        keys[pkI],
        destAccount,
        amountRaw,
        `ban_`
    );
    console.log(`payment successful: (${(amountRaw / 1e29).toFixed(8)} BAN)`, response);
    return response;
};

let getBlockInfo = async (blockHash) => {
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

let recvPending = async (pkI=0) => {
    const txList = await bananojs.receiveBananoDepositsForSeed(privateSeed, pkI, config["rep-account"]);
    console.log(txList);
};