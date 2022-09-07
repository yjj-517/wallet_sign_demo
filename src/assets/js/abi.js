//调用智能合约abi接口
import { ethers } from "ethers"; //引入ethers.js
import Web3Modal from "web3modal"; //引入web3modal
async function abiContract(nftaddress, NFT) {
  //连接钱包，获取签名
  const web3Modal = new Web3Modal({
    network: "mainnet",
    cacheProvider: true,
  });
  const connection = await web3Modal.connect();
  const provider = new ethers.providers.Web3Provider(connection);
  const signer = provider.getSigner();
  return {
    //连接合约与对应的abi接口，使其可以调用abi接口
    nftContract: new ethers.Contract(nftaddress, NFT, signer),
    tokenContract: new ethers.Contract(nftaddress, NFT, provider),
  }
}
export default abiContract;
