const sha256=require( 'crypto-js/sha256');
const EC = require('elliptic').ec;
const ec=new EC('secp256k1');

class Transcation{
    constructor(fromAddress, toAddress, amount){

        this.fromAddress=fromAddress;
        this.toAddress= toAddress;
        this.amount= amount;
    }

    calculateHash(){
        return sha256(this.fromAddress+ this.toAddress+ this.amount).toString();
    }

    signTransaction(signingKey){

        if(signingKey.getPublic('hex') !== this.fromAddress){
            throw new Error('you cannot sign for other wallet transaction');
        }
        const sign= signingKey.sign(this.calculateHash(),'base64');
        this.signature = sign.toDER('hex');
    }

    isValid(){
        if(this.fromAddress === null) return true;
        if(this.signature || this.signature.length == 0){
            throw new Error( 'no signature in this transaction');
        }

        const publickey = ec.keyFromPublic(this.fromAddress,'hex');

        return publickey.verify(this.calculateHash(), this.signature);
    }
}

class Block{
    constructor(timestamp, transactions, previousHash=''){
        this.timestamp =timestamp;
        this.transactions =transactions;
        this.previousHash =previousHash;
        this.hash= this.calculateHash();
        this.nonce =0;
    }

    calculateHash(){
        
        return sha256(this.previousHash + this.timestamp + JSON.stringify(this.transactions) +this.nonce).toString();
    }

    mineBlock(difficulty){
        while(this.hash.substring(0,difficulty) !== Array(difficulty+1).join("0")){
            this.nonce++;
          this.hash = this.calculateHash();  
        }

        console.log("block mined: "+this.hash);
    }

    hasValidTransaction(){
        for(const tx of  this.transactions){
            if(!tx.isValid()){
                return false;
            }
        }

        return true;
    }

}

class Blockchain{

    constructor(){
        this.chain=[this.createGenesisBlock()];
        this.difficulty = 3;
        this.pendingTransactions = [];
        this.miningReward= 100;
    }

    createGenesisBlock(){
        return new Block("18/01/2023","GEnesisBlock",'0');
    }

    getLatestBlock(){
        return this. chain[this.chain.length-1];
    }

    minePendingTransactions(minerAddress){
       
        let block=new Block(Date.now(),this.pendingTransactions);
        block.mineBlock(this.difficulty);
        console.log("successfully mined");
        this.chain.push(block);
        this.pendingTransactions =[
            new Transcation(null,minerAddress,this.miningReward)
        ];
    }

    addTransaction(transaction){

        if(!transaction.fromAddress || !transaction.toAddress){
            throw new Error('Sender or Receiver address shoud not be empty!');
        }
        if(!transaction.isValid){
            throw new Error('Cannot add an invalid Transaction!');
        }
        this.pendingTransactions.push(transaction);
    }

    getBalanceOfAddress(address){
        let balance = 0;
        for(const block of this.chain){
            for(const trans of block.transactions){
                if (trans.fromAddress == address) {
                    balance -= trans.amount;
                }
                if (trans.toAddress == address) {
                    balance += trans.amount;
                }

            }
        }

        return balance;
    }

    isChainValid(){

        for(var i=1; i<this.chain.length; i++){
            const currentBlock =this.chain[i];
            const previousBlock = this.chain[i-1];

            if(!currentBlock.hasValidTransaction()){
                return false;
            }

            if(currentBlock.hash != currentBlock.calculateHash()){
                return false;
            }

            if(currentBlock.previousHash != previousBlock.hash){
                return false;
            }
        }

        return true;
    }
}

module.exports.Blockchain = Blockchain;
module.exports.Transcation = Transcation;