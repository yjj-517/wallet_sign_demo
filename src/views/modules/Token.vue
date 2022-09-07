 <template>
  <div id="Token">
    <!-- 转账 -->
    <div class="Token_box">
      <p>
        <span>转账网络:</span>
        <el-select v-model="ethernetsNum" placeholder="请选择">
          <el-option
            v-for="(item, index) in ethernets"
            :key="index"
            :label="item.name"
            :value="index"
          >
          </el-option>
        </el-select>
      </p>
      <p>
        <span>合约地址:</span
        ><el-input
          v-model="nftaddress"
          placeholder="请输入合约地址"
          clearable
        ></el-input>
        <el-button class="usdt_box" type="primary" plain @click="onEthUSDT"
          >ETH-USDT</el-button
        >
        <el-button class="usdt_box" type="primary" plain @click="onBscUSDT"
          >BSC-USDT</el-button
        >
      </p>
      <p>
        <span>转账账号:</span
        ><el-input
          v-model="form.account1"
          placeholder="请输入转账账号"
          clearable
        ></el-input>
      </p>
      <p>
        <span>转入账号:</span
        ><el-input
          v-model="form.account2"
          placeholder="请输入转入账号"
          clearable
        ></el-input>
      </p>
      <p>
        <span>转账代币数量:</span
        ><el-input
          v-model="form.moneyToken"
          placeholder="请输入转账代币数量"
          clearable
        ></el-input>
      </p>
      <el-divider></el-divider>
      <p>
        <el-button type="primary" @click="found">构建交易对象</el-button>
      </p>
    </div>
    <!-- 邮费确认 -->
    <el-dialog
      class="postage"
      title="转账确认"
      :visible.sync="dialogVisible1"
      width="600px"
      v-loading="loading"
    >
      <div class="postage_box">
        <span>合约地址:</span><span>{{ this.nftaddress }}</span>
      </div>
      <div class="postage_box">
        <span>合约信息:</span
        ><span v-if="this.nftaddressCompany"
          >{{ this.nftaddressCompany }} ( 精度:{{ this.nftaddressNum }} )</span
        >
      </div>
      <div class="postage_box">
        <span>转账账号:</span><span>{{ this.form.account1 }}</span>
      </div>
      <div class="postage_box">
        <span>余额:</span><span>{{ this.form.balance }}</span>
      </div>
      <div class="postage_box">
        <span>剩余代币数量:</span><span>{{ this.balanceToken }} </span>
      </div>
      <div class="postage_box">
        <span>转入账号:</span><span>{{ this.form.account2 }}</span>
      </div>
      <div class="postage_box">
        <span>转账代币数量:</span><span>{{ this.form.moneyToken }} </span>
      </div>
      <div class="postage_box">
        <span>nonce:</span><span>{{ this.form.nonces }}</span>
      </div>
      <div class="postage_box">
        <span>chainId:</span><span>{{ this.form.chainIds }}</span>
      </div>
      <div class="postage_box">
        <span>data:</span><span>{{ this.form.data }}</span>
      </div>
      <div class="gas">
        <p class="gas_name">邮费设置(估计邮费价格):</p>
        <p class="gas_box">
          <span>gasLimit:</span>
          <el-input
            type="number"
            placeholder="请输入内容"
            v-model="form.gasLimit"
            show-word-limit
          >
          </el-input>
        </p>
        <p class="gas_box">
          <span>gasPrice:</span>
          <el-input
            type="number"
            placeholder="请输入内容"
            v-model="form.gasPrice"
            show-word-limit
          >
          </el-input>
          <span>(GWei)</span>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible1 = false">取 消</el-button>
        <el-button type="primary" @click="onDefine" :disabled="disabled"
          >确 定</el-button
        >
      </span>
    </el-dialog>
    <!-- 生成二维码 -->
    <el-dialog title="二维码生成" :visible.sync="dialogVisible2" width="500px">
      <span>创建交易成功,请下载二维码:</span>
      <Qrcode :raw="raw"></Qrcode>
    </el-dialog>
  </div>
</template>

<script>
import ethernet from "@/assets/js/ethernet.json"; //获取网络json文件
import Qrcode from "@/components/Qrcode.vue"; //二维码生成
import { ethers } from "ethers"; //ethers.js
import NFT from "../../assets/js/ERC20_ABI.json"; //ERC20标准json文件
export default {
  name: "Token",
  // 模板引入
  components: {
    Qrcode,
  },
  // 数据
  data() {
    return {
      loading: false, //加载
      dialogVisible1: false, //邮费弹框
      dialogVisible2: false, //二维码弹框
      ethernets: [], //以太网
      ethernetsNum: "", //选择网络index值
      nftaddress: "", //合约地址
      nftaddressCompany: "", //合约单位
      nftaddressNum: "", //合约规定位数
      balanceToken: 0, //账户代币余额
      form: {
        account1: "", //转账账号
        account2: "", //转入账号
        balance: 0, //账户余额
        gasPrice: 0, //gasPrice,gwei
        gasLimit: 0, //gasLimit
        chainIds: 0, //chainID
        nonces: 0, //账号nonce
        money: "0", //转账金额
        data: "", //附加消息,要部署的智能合约字节码
        moneyToken: "", //转账代币金额
      },
      disabled: true, //确认按钮
      raw: "", //签署信息
    };
  },
  // 方法
  methods: {
    async found() {
      if (this.form.account1 && this.form.account2 && this.form.moneyToken) {
        this.disabled = true;
        this.loading = true;
        this.dialogVisible1 = true;
        try {
          // 开始签署连接网络
          if (
            this.ethernets[this.ethernetsNum].name == "Private" ||
            this.ethernets[this.ethernetsNum].name == "BSC"
          ) {
            var provider = new ethers.providers.JsonRpcProvider(
              this.ethernets[this.ethernetsNum].url
            );
          } else {
            var provider = ethers.getDefaultProvider(
              this.ethernets[this.ethernetsNum].name,
              {
                etherscan: "4T7H8M6QV4BJRTMCDHYURSHDNSINMPUBMX",
              }
            );
          }
          // 构建合约ABI
          const tokenContract = new ethers.Contract(
            this.nftaddress,
            NFT.abi,
            provider
          );
          // 获取代币单位
          this.nftaddressCompany = await tokenContract.symbol();
          // 获取代币小数点
          this.nftaddressNum = await tokenContract.decimals();
          // 获取账户代币余额
          let btNum = await tokenContract.balanceOf(this.form.account1);
          this.balanceToken =
            btNum.toString() / Math.pow(10, this.nftaddressNum);
          // 重新构建abi
          const iface = new ethers.utils.Interface(NFT.abi);
          // 构建交易data
          this.form.data = iface.encodeFunctionData("transfer", [
            this.form.account2,
            (
              this.form.moneyToken * Math.pow(10, this.nftaddressNum)
            ).toString(),
          ]);
          // 获取余额
          const getBalance = await provider.getBalance(this.form.account1);
          this.form.balance = ethers.utils.formatUnits(
            getBalance.toString(),
            "ether"
          );
          // 获取网络chainID
          const netWork = await provider.getNetwork();
          this.form.chainIds = netWork.chainId;
          // 通过账号获取nonce
          this.form.nonces = await provider.getTransactionCount(
            this.form.account1
          );
          // 估计gasPrice
          let gasp = await provider.getGasPrice();
          this.form.gasPrice = ethers.utils.formatUnits(gasp, "gwei");
          // 估计gasLimit
          let gasl = await provider.estimateGas({
            from: this.form.account1,
            to: this.nftaddress,
            data: this.form.data,
          });
          this.form.gasLimit = gasl.toString();
          this.loading = false;
          this.disabled = false;
        } catch (e) {
          // 监听错误
          this.disabled = true;
          this.loading = false;
          let err = e.message.substr(0, e.message.indexOf("("));
          this.$alert(err, "错误提示:", {
            confirmButtonText: "确定",
          });
        }
      } else {
        this.$message.error("请填写相关数据!");
      }
    },
    async onDefine() {
      this.raw = "";
      // 构建交易对象
      const transaction = {
        nonce: this.form.nonces, //账号的前一个交易计数
        chainId: this.form.chainIds, //网络
        from: this.form.account1, //发起账户
        to: this.nftaddress, //目标账户
        gasLimit: this.form.gasLimit * 1, // 交易能消耗Gas的上限
        gasPrice: this.form.gasPrice * Math.pow(10, 9), //Gas价格
        value: this.form.money, //转账金额,这边不做处理,由app做处理
        // value: ethers.utils.parseEther(this.form.money), //要发送的以太币金额
        data: this.form.data, //要部署的智能合约字节码。
      };
      // 将交易对象生成二维码
      this.raw = JSON.stringify(transaction);
      if (this.raw) {
        this.dialogVisible1 = false;
        this.dialogVisible2 = true;
      } else {
        this.$message.error("生成二维码失败!");
      }
    },
    onEthUSDT() {
      // ETH-USDT合约地址
      this.nftaddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
    },
    onBscUSDT() {
      // BSC-USDT合约地址
      this.nftaddress = "0x55d398326f99059fF775485246999027B3197955";
    },
  },
  // 创建后
  created() {
    // 获取网络json文件
    this.ethernets = ethernet;
    this.ethernetsNum = 0;
  },
  // 挂载后
  mounted() {},
  // 更新后
  updated() {},
};
</script>

<style lang="less" scoped>
#Token {
  .Token_box {
    margin: 0 0 0 1rem;
    p {
      display: flex;
      margin: 1rem 0;
      line-height: 3rem;
      span {
        width: 10rem;
      }
      .el-input {
        width: 30rem;
      }
      .usdt_box {
        margin-left: 1rem;
      }
    }
  }
  .postage {
    .postage_box {
      line-height: 3rem;
      display: flex;
      span:nth-child(1) {
        width: 20%;
        font-weight: bold;
      }
      span:nth-child(2) {
        width: 70%;
        overflow: hidden; //溢出隐藏
        white-space: nowrap; //禁止换行
        text-overflow: ellipsis; //...
      }
    }
    .gas {
      .gas_name {
        line-height: 3rem;
        font-weight: bold;
      }
      .gas_box {
        display: flex;
        line-height: 3rem;
        span:nth-child(1) {
          font-weight: bold;
          margin-left: 4rem;
          width: 20%;
        }
        .el-input {
          margin-left: 1rem;
          width: 10rem;
        }
      }
    }
  }
}
</style> 