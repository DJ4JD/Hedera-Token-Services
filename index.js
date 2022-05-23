require("dotenv").config();

const { AccountBalanceQuery, AccountId, Client, CustomFixedFee, CustomRoyaltyFee, Hbar, PrivateKey, ScheduleCreateTransaction, ScheduleInfoQuery, ScheduleSignTransaction, TokenAssociateTransaction, TokenBurnTransaction, TokenCreateTransaction, TokenGrantKycTransaction, TokenInfoQuery, TokenMintTransaction, TokenSupplyType, TokenType, TokenUnfreezeTransaction, TransferTransaction } = require("@hashgraph/sdk");

async function main() {

  //configure our client 
  const operatorKey = PrivateKey.fromString(process.env.PRIVATE_KEY)
  const operatorId = AccountId.fromString(process.env.ACCOUNT_ID);

  let client = Client.forTestnet();
  client.setOperator(operatorId, operatorKey);

  // Create a new HTS token 
  var createTokenTx = await new TokenCreateTransaction()
    .setTokenName("cliqueUP")
    .setTokenSymbol("CUP")
    .setDecimals(0)
    .setInitialSupply(100)
    .setTreasuryAccountId(operatorId)
    .execute(client);

    var createReceipt = await createTokenTx.getReceipt(client);
    var newTokenId = createReceipt.tokenId;

    console.log('new token id: ', newTokenId.toString());

    //associate a new account with a token
  const account2Id = AccountId.fromString(process.env.ACCOUNT_ID_2)
  const account2Key = PrivateKey.fromString(process.env.PRIVATE_KEY_2)

  //associate new account with the token 
  var associateTx = await new TokenAssociateTransaction()
    .setAccountId(account2Id)
    .setTokenIds([newTokenId])
    .freezeWith(client)
    .sign(account2Key);
  
  var submitAssociateTx = await associateTx.execute(client);
  var associateReceipt = await submitAssociateTx.getReceipt(client);

  console.log('associate tx receipt: ', associateReceipt);

  //Transfer Tokens between accounts 
  var transferTx = await new TransferTransaction()
    .addTokenTransfer(newTokenId, operatorId, -10) //deduct 10 tokens from treasury
    .addTokenTransfer(newTokenId, account2Id, 10)
    .execute(client);

  var transferReceipt = await transferTx.getReceipt(client);

  console.log('transfer tx receipt: ', transferReceipt);

  //balance query 
  var account1balance = await new AccountBalanceQuery().setAccountId(operatorId).execute(client);
  console.log('account 1 balance: ', account1balance.tokens.toString());

  var account2balance = await new AccountBalanceQuery().setAccountId(account2Id).execute(client);
  console.log('account 2 balance: ', account2balance.tokens.toString());
}

main();