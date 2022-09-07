# walletsign

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

```
1.构建交易对象

import { ethers } from "ethers";

//连接网络
//以太主网
const provider = new ethers.getDefaultProvider("homestead");
//私网
//const provider = new ethers.providers.JsonRpcProvider("http://117.176.133.22:8545");
// 获取网络chainID
const netWork = await provider.getNetwork();
// 通过账号获取nonce
const nonces = await provider.getTransactionCount(account1);
// 估计gasPrice
let gasp = await provider.getGasPrice();
const gasPrice = ethers.utils.formatUnits(gasp, "gwei");
// 估计gasLimit
let gasl = await provider.estimateGas({
from: account1,
to: account2,
data: "0x",
value: ethers.utils.parseEther(this.money),
});
const gasLimit = gasl.toNumber();
console.log(gasLimit);
// 构建交易对象
let transaction = {
   nonce: nonces, //账号的前一个交易计数
   gasLimit: gasLimit, // 交易能消耗Gas的上限
   gasPrice: gasp, //Gas价格
   from: this.account1, //发起账户
   to: this.account2, //目标账户
   value: ethers.utils.parseEther(this.money),//要发送的以太币金额
   //value: this.money, //转账金额,这边不做处理,由app做处理
   chainId: netWork.chainId, //网络
   data: "0x", //要部署的智能合约字节码。
};
console.log(transaction);
```
```
2.2签署交易(使用私钥)

// 签署交易
// 私钥
const privateKey ="私钥";
// 定义钱包
const wallet = new ethers.Wallet(privateKey);
const signPromise = wallet.signTransaction(transaction);
await signPromise.then((signedTransaction) => {
console.log(signedTransaction);
})
```
```
2.3广播交易(交易上链)

// 发布广播
provider.sendTransaction(signedTransaction).then(async (tx) => {
console.log(tx);
// 确认交易上链成功
let res = await tx.wait();
console.log(res);
});
```
```
2.4通过生成的encodeABI来调用合约

//通过合约的abi使用ethers进行重新构建
const iface = new ethers.utils.Interface(ABI.abi);
//通过合约参数和合约方法生成hash
const encode = iface.encodeFunctionData("合约方法", ["合约参数",]);
//最后将生成的这个值传给构建交易对象的data.
console.log(signedTransaction);
})
```
