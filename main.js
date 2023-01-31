const {Blockchain, Transcation} = require("./Blockchain");
const EC = require('elliptic').ec;
const ec=new EC('secp256k1');
const mykey=ec.keyFromPrivate("388a7b55aebb0f7604f5c9b5d41fdec56d6c484df4414bd7dd27deb35b80f2bc");
const myWalletAddress = mykey.getPublic('hex');
let B_Coin =new Blockchain();

const tr1=new Transcation(myWalletAddress,"address12345", 20);

tr1.signTransaction(mykey);

B_Coin.addTransaction(tr1);

console.log("\n starting the minning... ");
B_Coin.minePendingTransactions(myWalletAddress)
console.log("my Balance is: ",B_Coin.getBalanceOfAddress(myWalletAddress));



console.log('is chain valid: ', B_Coin.isChainValid());