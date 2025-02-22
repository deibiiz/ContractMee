//ganache-cli --host 192.168.1.33 -d --db ganache_db

let web3Instance = null;
let myContractInstance = null;

export async function getWeb3() {
    if (!web3Instance) {
        const { default: Web3 } = await import("web3");
        const Url = "http://192.168.1.33:8545"; //sustituir 192.168.1.33 por tu IP
        web3Instance = new Web3(new Web3.providers.HttpProvider(Url));
    }
    return web3Instance;
}

export async function getMyContract() {
    if (!myContractInstance) {
        const web3 = await getWeb3();
        const MyContract1 = require("./MyContractAux.json");
        const contractAddress = "0xA586074FA4Fe3E546A132a16238abe37951D41fE";
        myContractInstance = new web3.eth.Contract(MyContract1.abi, contractAddress);
    }
    return myContractInstance;
}

