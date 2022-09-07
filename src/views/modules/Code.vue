 <template>
  <div id="Code">
    <!-- 上传文件 -->
    <div class="Code_box">
      <p>
        <span>合约网络:</span>
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
        <span>账户地址:</span>
        <el-input
          v-model="form.account1"
          clearable
          placeholder="请输入账户地址"
        ></el-input>
      </p>
      <p>
        <span>合约地址:</span>
        <el-input
          v-model="form.account2"
          clearable
          placeholder="请输入合约地址"
        ></el-input>
      </p>
      <p>
        <span>转账金额:</span>
        <el-input
          v-model="form.money"
          clearable
          placeholder="请输入转账金额"
        ></el-input>
      </p>
      <el-divider></el-divider>
      <p>
        <span>合约ABI:</span>
        <el-button type="primary">
          <input
            class="Upload_box_input"
            ref="file"
            type="file"
            name="file"
            @change.stop="changesData"
          />
          <div class="json_box">
            <p>(仅支持json格式上传)</p>
            <p>{ "abi" : [ ] }</p>
          </div>
        </el-button>
      </p>
      <p>
        <span>合约方法:</span>
        <el-input
          v-model="meansform.means"
          clearable
          placeholder="请输入合约方法"
        ></el-input>
      </p>
      <p>
        <span>传入参数:</span>
        <el-input
          v-model="meansform.parameter1"
          clearable
          placeholder="请输入合约参数"
        ></el-input>
      </p>
      <p>
        <span></span>
        <el-input
          v-model="meansform.parameter2"
          clearable
          placeholder="请输入合约参数"
        ></el-input>
      </p>
      <p>
        <span></span>
        <el-input
          v-model="meansform.parameter3"
          clearable
          placeholder="请输入合约参数"
        ></el-input>
      </p>
      <p>
        <span>encodeABI:</span>
        <el-input
          v-model="form.data"
          disabled
          placeholder="自动生成encodeABI"
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
        <span>转账账号:</span><span>{{ this.form.account1 }}</span>
      </div>
      <div class="postage_box">
        <span>余额:</span><span>{{ this.form.balance }} </span>
      </div>
      <div class="postage_box">
        <span>合约账号:</span><span>{{ this.form.account2 }}</span>
      </div>
      <div class="postage_box">
        <span>转账金额:</span><span>{{ this.form.money }} </span>
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
export default {
  name: "Code",
  // 模板引入
  components: {
    Qrcode,
  },
  // 数据
  data() {
    return {
      ethernetsNum: "", //选择网络index值
      loading: false, //加载
      dialogVisible1: false, //遮罩层
      dialogVisible2: false, //遮罩层
      disabled: true, //按钮
      form: {
        account1: "", //转账账号
        account2: "", //转入账号/合约地址
        balance: 0, //账户余额
        gasPrice: 0, //gasPrice,gwei
        gasLimit: 0, //gasLimit
        chainIds: 0, //chainID
        nonces: 0, //账号nonce
        money: "0", //转账金额
        data: "", //附加消息,要部署的智能合约字节码。
      },
      // 传入的方法和参数
      meansform: {
        means: "", //方法
        parameter1: "", //参数
        parameter2: "", //参数
        parameter3: "", //参数
      },
      abiData: {}, //上传合约abi
      raw: "", //签署信息
    };
  },
  // 方法
  methods: {
    // 获取上传文件
    changesData(e) {
      this.abiData = {};
      const fileList = e.target.files[0];
      let reader = new FileReader();
      if (fileList.type == "application/json") {
        // 判断文件格式
        reader.readAsText(fileList);
        reader.onload = (e) => {
          // 获取bytecode
          const { abi } = JSON.parse(e.target.result);
          if (abi) {
            this.abiData = abi;
          } else {
            this.$message.error("上传文件错误!");
          }
        };
      } else {
        this.$message.warning("请上传JSON格式文件!");
      }
    },
    //构建交易对象
    async found() {
      if (this.meansform.means && Object.keys(this.abiData).length !== 0) {
        try {
          // 重新构建abi
          const iface = new ethers.utils.Interface(this.abiData);
          if (!this.meansform.parameter1) {
            // 生成函数encodeABI
            this.form.data = iface.encodeFunctionData(this.meansform.means, []);
          }
          if (!this.meansform.parameter2) {
            this.form.data = iface.encodeFunctionData(this.meansform.means, [
              this.meansform.parameter1,
            ]);
          } else if (!this.meansform.parameter3) {
            this.form.data = iface.encodeFunctionData(this.meansform.means, [
              this.meansform.parameter1,
              this.meansform.parameter2,
            ]);
          } else if (
            this.meansform.parameter1 &&
            this.meansform.parameter2 &&
            this.meansform.parameter3
          ) {
            this.form.data = iface.encodeFunctionData(this.meansform.means, [
              this.meansform.parameter1,
              this.meansform.parameter2,
              this.meansform.parameter3,
            ]);
          } else {
            this.$message.warning("请填写正确的参数");
          }
          // 执行获取交易的内容
          this.content();
        } catch (e) {
          // 监听错误
          let err = e.message.substr(0, e.message.indexOf("("));
          this.$alert(err, "ABI错误提示:", {
            confirmButtonText: "确定",
          });
        }
      } else {
        this.$message.warning("请上传合约ABI和填写合约方法!");
      }
    },
    // 获取交易内容
    async content() {
      if (this.form.account1 && this.form.account2) {
        this.loading = true;
        this.dialogVisible1 = true;
        this.disabled = true;
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
            to: this.form.account2,
            value: ethers.utils.parseEther(this.form.money.toString()),
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
        this.$message.warning("请填写账户地址和合约地址!");
      }
    },
    // 交易确定
    onDefine() {
      this.raw = "";
      // 构建交易对象
      const transaction = {
        nonce: this.form.nonces, //账号的前一个交易计数
        chainId: this.form.chainIds, //网络
        from: this.form.account1, //发起账户
        to: this.form.account2, //目标账户
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
#Code {
  .Code_box {
    margin: 0 0 0 1rem;
    p {
      display: flex;
      margin: 1rem 0;
      line-height: 3rem;
      span {
        width: 10rem;
        margin-right: 2rem;
      }
      .json_box {
        p {
          line-height: 1rem;
        }
      }
      .el-input {
        width: 30rem;
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