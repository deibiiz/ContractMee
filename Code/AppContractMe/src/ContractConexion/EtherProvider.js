//ganache-cli --host 192.168.1.33 -d --db ganache_db
import Web3 from 'web3';
const MyContract1 = require('./MyContractAux.json');

const Url = "http://192.168.1.33:8545";
const provider = new Web3(new Web3.providers.HttpProvider(Url));
const contractAddress = '0xaD888d0Ade988EbEe74B8D4F39BF29a8d0fe8A8D';

const MyContract = new provider.eth.Contract(MyContract1.abi, contractAddress);

export { MyContract, provider };