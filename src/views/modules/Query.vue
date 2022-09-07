 <template>
  <div id="Query">
    <div class="Query_box">
      <p>
        <span>合约地址:</span>
        <el-input
          v-model="nftaddress"
          clearable
          placeholder="请输入合约地址"
        ></el-input>
      </p>
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
            <p>(仅支持json格式上传:)</p>
            <p>{ "abi" : [ ] }</p>
          </div>
        </el-button>
      </p>
      <el-divider></el-divider>
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
      <el-divider></el-divider>
      <p>
        <el-button type="primary" @click="onQuery">查询合约</el-button>
        <el-button type="primary" @click="onCall">调用合约</el-button>
      </p>
    </div>
    <!-- 遮罩层 -->
    <el-dialog
      class="dialog_box1"
      title="二维码生成"
      :visible.sync="dialogVisible1"
      width="700px"
    >
      <p>
        <span>查询到的参数:</span>
        <span>{{ queryStr }}</span>
      </p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible1 = false">取 消</el-button>
        <el-button type="primary" @click="dialogVisible1 = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>
    <!--  -->
    <el-dialog class="dialog_box2" :visible.sync="dialogVisible2" width="800px">
      <!-- 步骤条 -->
      <el-steps :active="active" align-center>
        <el-step title="交易已上链" icon="el-icon-circle-check"></el-step>
        <el-step title="交易已完成" :icon="icons"></el-step>
      </el-steps>
      <p class="hash_p" v-if="active == 1">交易等待中</p>
      <p class="hash_p" v-if="active == 2">交易已完成</p>
      <div class="hash_box">
        <div v-if="transactionHash">
          <p>交易hash:</p>
          <p>{{ transactionHash }}</p>
        </div>
      </div>
      <div class="hash_but">
        <el-button
          type="primary"
          @click="dialogVisible2 = false"
          :disabled="disabled"
          >关闭</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script>
import abiContract from "@/assets/js/abi.js";
export default {
  name: "Query",
  // 模板引入
  components: {},
  // 数据
  data() {
    return {
      nftaddress: "", //合约地址
      abiData: {}, //合约abi
      // 传入的方法和参数
      meansform: {
        means: "", //方法
        parameter1: "", //参数
        parameter2: "", //参数
        parameter3: "", //参数
      },
      dialogVisible1: false, //遮罩层
      dialogVisible2: false, //遮罩层
      active: 1, //进度条
      icons: "el-icon-loading", //交易完成icon图
      disabled: true, //关闭按钮
      queryStr: "", //查询到的参数
      transactionHash: "", //交易Hash
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
          let data = JSON.parse(e.target.result);
          const { abi } = data;
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
    // 查询合约
    async onQuery() {
      if (
        this.nftaddress &&
        this.meansform.means &&
        Object.keys(this.abiData).length > 0
      ) {
        this.queryStr = "";
        try {
          //重新构建abiContract引进函数
          const contract = await new abiContract(this.nftaddress, this.abiData);
          // 参数判断
          if (!this.meansform.parameter1) {
            var res = await contract.tokenContract[this.meansform.means]();
          } else if (!this.meansform.parameter2) {
            var res = await contract.tokenContract[this.meansform.means](
              this.meansform.parameter1
            );
          } else if (!this.meansform.parameter3) {
            var res = await contract.tokenContract[this.meansform.means](
              this.meansform.parameter1,
              this.meansform.parameter2
            );
          } else if (
            this.meansform.parameter1 &&
            this.meansform.parameter2 &&
            this.meansform.parameter3
          ) {
            var res = await contract.tokenContract[this.meansform.means](
              this.meansform.parameter1,
              this.meansform.parameter2,
              this.meansform.parameter3
            );
          } else {
            this.$message.warning("请传入正确的参数");
            return;
          }
          // 获取值判断
          if (res) {
            this.queryStr = res.toString();
            this.dialogVisible1 = true;
          } else {
            this.$message.error("查询错误!!!");
          }
        } catch (e) {
          console.log(e);
          let err = e.message.substr(0, e.message.indexOf("("));
          this.$confirm(err, "错误提示", {
            type: "error",
          });
        }
      } else {
        this.$message.warning("请填写合约地址/合约方和上传合约ABI!");
      }
    },
    // 调用合约
    async onCall() {
      if (
        this.nftaddress &&
        this.meansform.means &&
        Object.keys(this.abiData).length > 0
      ) {
        this.dialogVisible2 = false;
        this.transactionHash = "";
        this.active = 1;
        this.icons = "el-icon-loading";
        this.disabled = true;
        try {
          //重新构建abiContract引进函数
          const contract = await new abiContract(this.nftaddress, this.abiData);
          // 参数判断
          if (!this.meansform.parameter1) {
            var res = await contract.nftContract[this.meansform.means]();
          } else if (!this.meansform.parameter2) {
            var res = await contract.nftContract[this.meansform.means](
              this.meansform.parameter1
            );
          } else if (!this.meansform.parameter3) {
            var res = await contract.nftContract[this.meansform.means](
              this.meansform.parameter1,
              this.meansform.parameter2
            );
          } else if (
            this.meansform.parameter1 &&
            this.meansform.parameter2 &&
            this.meansform.parameter3
          ) {
            var res = await contract.nftContract[this.meansform.means](
              this.meansform.parameter1,
              this.meansform.parameter2,
              this.meansform.parameter3
            );
          } else {
            this.$message.warning("请传入正确的参数");
            return;
          }
          if (res.hash) {
            this.dialogVisible2 = true;
            this.transactionHash = res.hash;
            await res.wait();
            this.active = 2;
            this.icons = "el-icon-circle-check";
            this.disabled = false;
          } else {
            this.$message.warning("请检查调用合约方法是否正确!");
          }
        } catch (e) {
          let err = e.message.substr(0, e.message.indexOf("("));
          this.$confirm(err, "错误提示", {
            type: "error",
          });
        }
      } else {
        this.$message.warning("请填写合约地址/合约方和上传合约ABI!");
      }
    },
  },
  // 创建后
  created() {},
  // 挂载后
  mounted() {},
  // 更新后
  updated() {},
};
</script>

<style lang="less" scoped>
#Query {
  .Query_box {
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
  .dialog_box1 {
    p {
      display: flex;
      span:nth-child(1) {
        width: 20%;
      }
      span:nth-child(2) {
        width: 80%;
      }
    }
  }
  .dialog_box2 {
    .hash_p {
      line-height: 6rem;
      text-align: center;
      font-weight: bold;
      font-size: 1.5rem;
      color: #1a73e8;
    }
    .hash_box {
      margin: 0 3rem;
      border: 2px solid #1a73e8;
      border-radius: 10px;
      div {
        margin: 2rem;
        p {
          margin-top: 1.5rem;
          text-align: center;
          color: #409eff;
          &:nth-of-type(odd) {
            color: #1a73e8;
            font-weight: bold;
          }
        }
      }
    }
    .hash_but {
      margin: 2rem 0 0;
      text-align: center;
    }
  }
}
</style> 