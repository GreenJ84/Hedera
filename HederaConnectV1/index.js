const { Client, PrivateKey, AccountCreateTransaction, AccountBalanceQuery, Hbar, TransferTransaction } = require("@hashgraph/sdk");
require("dotenv").config();
    // Create our connection to the Hedera network
    // The Hedera JS SDK makes this really easy!
    const client = Client.forTestnet();


async function createNewAccount(){
    //Create new keys
    const newAccountPrivateKey = PrivateKey.generateED25519(); 
    const newAccountPublicKey = newAccountPrivateKey.publicKey;

    const newAccount = await new AccountCreateTransaction()
        .setKey(newAccountPublicKey)
        .setInitialBalance(Hbar.fromTinybars(1000))
        .execute(client);

    const getReceipt = await newAccount.getReceipt(client);
    const newAccountId = getReceipt.accountId;
    
    //Log the account ID
    console.log("The new account ID is: " +newAccountId);

    //Verify the account balance
    const accountBalance = await new AccountBalanceQuery()
    .setAccountId(newAccountId)
    .execute(client);

    console.log("The new account balance is: " +accountBalance.hbars.toTinybars() +" tinybar.");

    return newAccountId;
}

async function transferHbar(myAccountId, newAccountId){
    const sendHbar = await new TransferTransaction()
        .addHbarTransfer(myAccountId, Hbar.fromTinybars(-1000)) //Sending account
        .addHbarTransfer(newAccountId, Hbar.fromTinybars(1000)) //Receiving account
        .execute(client);

    //Verify the transaction reached consensus
    const transactionReceipt = await sendHbar.getReceipt(client);
    console.log("The transfer transaction from my account to the new account was: " + transactionReceipt.status.toString());

    //Request the cost of the query
    const queryCost = await new AccountBalanceQuery()
    .setAccountId(newAccountId)
    .getCost(client);

    console.log("The cost of query is: " +queryCost);

    //Check the old account's balance
    const getOldBalance = await new AccountBalanceQuery()
    .setAccountId(myAccountId)
    .execute(client);

    console.log("The old account balance after the transfer is: " +getOldBalance.hbars.toTinybars() +" tinybar.")

    //Check the new account's balance
    const getNewBalance = await new AccountBalanceQuery()
    .setAccountId(newAccountId)
    .execute(client);

    console.log("The new account balance after the transfer is: " +getNewBalance.hbars.toTinybars() +" tinybar.")

}

async function main() {

    //Grab your Hedera testnet account ID and private key from your .env file
    const myAccountId = process.env.MY_ACCOUNT_ID;
    const myPrivateKey = process.env.MY_PRIVATE_KEY;

    // If we weren't able to grab it, we should throw a new error
    if (myAccountId == null ||
        myPrivateKey == null ) {
        throw new Error("Environment variables myAccountId and myPrivateKey must be present");
    }

    client.setOperator(myAccountId, myPrivateKey);

    // const newAccountID = createNewAccount();

    transferHbar(myAccountId, '0.0.48664118');
}
main();
