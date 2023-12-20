const MyContract = artifacts.require("MyContract");

contract("MyContract", accounts => {
  
  const [owner, buyer] = accounts; //owner es el que despliega el contrato y buyer generalmente es la segunda cuenta de ganache
  const mintPrice = web3.utils.toWei("1", "ether"); 
  const overpayAmount = web3.utils.toWei("50", "ether");

  it("Acuñar un NFT cuando se envia el suficiente dinero", async () => {
    const contract = await MyContract.deployed();
    

    const initialBalance = await web3.eth.getBalance(buyer);
    await contract.mint({ from: buyer, value: mintPrice });
    const finalBalance = await web3.eth.getBalance(buyer);
    const cost = web3.utils.toBN(initialBalance).sub(web3.utils.toBN(finalBalance));

    console.log("Dirección del comprador:", buyer);
    console.log("Costo:", cost.toString());
    console.log("Precio de acuñado:", mintPrice);
    assert(cost.gte(web3.utils.toBN(mintPrice)), "El valor enviado debe de ser al menos 1 ether");
  });
  

  it("Devolver el sobrante cuando se paga de mas", async () => {
    const contract = await MyContract.deployed();
    
    const initialBalance = await web3.eth.getBalance(buyer);
    await contract.mint({ from: buyer, value: overpayAmount });
    const finalBalance = await web3.eth.getBalance(buyer);
    const expectedFinalBalance = web3.utils.toBN(initialBalance).sub(web3.utils.toBN(overpayAmount));

    console.log("Dirección del comprador:", buyer);
    console.log("Saldo inicial:", initialBalance);
    console.log("Saldo final:", finalBalance);
    console.log("Saldo sin devolver sobrante:", expectedFinalBalance.toString());
    console.log("Sobrante devuelto:", (finalBalance - expectedFinalBalance).toString());
    assert(finalBalance > expectedFinalBalance, "Los fondos deben de ser devueltos al comprador");
  });
});
