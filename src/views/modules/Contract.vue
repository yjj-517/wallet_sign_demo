 <template>
  <div id="Contract">
    <!-- 转账 -->
    <div class="Contract_box">
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
        <span>部署合约账号:</span>
        <el-input
          v-model="form.account1"
          placeholder="请输入账号"
          clearable
        ></el-input>
      </p>
      <p>
        <span>合约Bytecode:</span>
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
            <p>{ "bytecode" : "0x" }</p>
          </div>
        </el-button>
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
      <!-- <div class="postage_box">
        <span>转入账号:</span><span>{{ this.form.account2 }}</span>
      </div> -->
      <!-- <div class="postage_box">
        <span>转账金额:</span><span>{{ this.form.money }} </span>
      </div> -->
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
    <!-- 生成json文件 -->
    <el-dialog
      title="交易对象json文件生成"
      :visible.sync="dialogVisible2"
      width="500px"
      class="json_box"
    >
      <div>
        <p>创建交易成功,请下载文件:</p>
        <el-button type="primary" @click="download">下载文件</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import ethernet from "@/assets/js/ethernet.json"; //获取网络json文件
import { ethers } from "ethers"; //ethers.js
export default {
  name: "Contract",
  // 模板引入
  components: {},
  // 数据
  data() {
    return {
      dialogVisible1: false, //弹框
      dialogVisible2: false, //弹框
      loading: false, //加载
      ethernets: [], //以太网
      ethernetsNum: "", //选择网络index值
      form: {
        account1: "", //转账账号
        // account2: "", //转入账号
        balance: 0, //账户余额
        gasPrice: 0, //gasPrice,gwei
        gasLimit: 0, //gasLimit
        chainIds: 0, //chainID
        nonces: 0, //账号nonce
        // money: "0", //转账金额
        data: "", //部署的智能合约字节码。
      },
      transactionData: "", //交易对象
      disabled: true, //确认按钮
    };
  },
  // 方法
  methods: {
    //上传文件
    changesData(e) {
      this.form.data = "";
      const fileList = e.target.files[0];
      let reader = new FileReader();
      if (fileList.type == "application/json") {
        // 判断文件格式
        reader.readAsText(fileList);
        reader.onload = (e) => {
          // 获取bytecode
          const { bytecode } = JSON.parse(e.target.result);
          if (bytecode) {
            this.form.data = bytecode;
          } else {
            this.$message.error("文件上传错误!!!");
          }
        };
      } else {
        this.$message.warning("请上传JSON格式文件!");
      }
    },
    // 创建交易
    async found() {
      if (this.form.account1 && this.form.data) {
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
            data: this.form.data,
          });
          this.form.gasLimit = gasl.toString();
          this.loading = false;
          this.disabled = false;
        } catch (e) {
          // 监听错误
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
    //确认构建交易对象
    async onDefine() {
      this.transactionData = "";
      const transaction = {
        nonce: this.form.nonces, //账号的前一个交易计数
        chainId: this.form.chainIds, //网络
        from: this.form.account1, //发起账户
        // to: this.form.account2, //目标账户
        gasLimit: this.form.gasLimit * 1, // 交易能消耗Gas的上限
        gasPrice: this.form.gasPrice * Math.pow(10, 9), //Gas价格
        // value: ethers.utils.parseEther(this.money),//要发送的以太币金额
        // value: this.form.money, //转账金额,这边不做处理,由app做处理
        data: this.form.data, //要部署的智能合约字节码bycode。
      };
      // 将交易对象生成json格式
      this.transactionData = JSON.stringify(transaction);
      if (this.transactionData) {
        this.dialogVisible1 = false;
        this.dialogVisible2 = true;
      } else {
        this.$message.error("生成JSON文件失败!");
      }
    },
    // 下载生成的json文件
    download() {
      // 获取当前时间戳
      var time = new Date();
      let timeSty =
        time.getFullYear() +
        "-" +
        (time.getMonth() + 1) +
        "-" +
        time.getDate() +
        "-" +
        time.getHours() +
        "-" +
        time.getMinutes() +
        "-" +
        time.getSeconds();
      let uri =
        "data:text/csv;charset=utf-8,\ufeff" +
        encodeURIComponent(this.transactionData);
      //通过创建a标签实现
      let link = document.createElement("a");
      link.href = uri;
      //对下载的文件命名
      link.download = timeSty + "transaction.json";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
#Contract {
  .Contract_box {
    margin: 0 0 0 1rem;
    p {
      display: flex;
      margin: 1rem 0;
      line-height: 3rem;
      span {
        width: 10rem;
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
  .json_box {
    div {
      text-align: center;
      p {
        font-weight: bold;
        font-size: 1.5rem;
        color: #1a73e8;
      }
      .el-button {
        margin: 2rem 0 0;
      }
    }
  }
}
</style> 