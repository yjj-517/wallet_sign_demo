 <template>
  <div id="Broadcast" v-loading="loading">
    <!-- 网络选择 -->
    <div class="Broadcast_box">
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
        <span>广播交易码:</span>
        <span>
          <el-input
            style="width: 600px"
            type="textarea"
            :rows="4"
            placeholder="请输入上链signedTransactionHash"
            v-model="signedTransaction"
          >
          </el-input>
        </span>
      </p>
      <p>
        <span>将已经签名的二维码图片或者json文件上传:</span
        ><el-button type="primary">
          <input
            class="Upload_box_input"
            ref="file"
            type="file"
            name="file"
            @change.stop="changesData"
          />
          <div class="json_box">
            <p>(仅支持json和二维码图片格式上传)</p>
            <p>{ "signedTransaction" : "0x" }</p>
          </div>
        </el-button>
      </p>
      <el-divider></el-divider>
    </div>
    <!-- 上传文件显示 -->
    <div class="release">
      <div class="imgs">
        <el-image v-if="imgurl" :src="imgurl" lazy></el-image>
        <el-input
          v-if="result"
          type="textarea"
          v-model="result"
          :autosize="{ minRows: 2, maxRows: 13 }"
          style="margin: 0 24px 0; width: 600px"
        ></el-input>
      </div>
    </div>
    <!-- 广播按钮 -->
    <div class="release_but" v-if="signedTransaction">
      <el-button type="primary" @click="onRelease">发布广播</el-button>
    </div>
    <!-- 广播消息  -->
    <el-dialog :visible.sync="dialogVisible" width="800px">
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
        <div v-if="contractAddress">
          <p>合约Address:</p>
          <p>{{ contractAddress }}</p>
        </div>
      </div>
      <div class="hash_but">
        <el-button
          type="primary"
          @click="dialogVisible = false"
          :disabled="disabled"
          >关闭</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script>
import ethernet from "@/assets/js/ethernet.json"; //获取网络json文件
import { ethers } from "ethers"; //ethers.js
import QrCodes from "qrcode-decoder"; //二维码解析
export default {
  name: "Broadcast",
  // 模板引入
  components: {},
  // 数据
  data() {
    return {
      loading: false, //
      ethernets: [], //以太网
      ethernetsNum: "", //选择网络index值
      imgurl: "", //二维码图片
      result: "", //二维码/文件解析
      signedTransaction: "", //交易上链hash
      dialogVisible: false, //广播弹窗
      active: 1, //步骤条
      transactionHash: "", // 交易hash
      contractAddress: "", // 合约hash
      disabled: true, //关闭按钮
      icons: "el-icon-loading", //交易完成icon图
    };
  },
  // 方法
  methods: {
    // 获取图片
    changesData(e) {
      // 清空参数
      this.result = "";
      this.imgurl = "";
      this.signedTransaction = "";
      // 获取文件/图片
      const fileList = e.target.files[0];
      let fileType = fileList.type.substring(0, fileList.type.indexOf("/"));
      let reader = new FileReader();
      // 判断文件类型解析
      if (fileType == "application") {
        reader.readAsText(fileList);
        reader.onload = (e) => {
          this.result = e.target.result;
          this.signedTransaction = JSON.parse(this.result).signedTransaction;
        };
      } else if (fileType == "image") {
        // 二维码解析
        reader.readAsDataURL(fileList);
        reader.onload = (e) => {
          this.imgurl = e.target.result;
          const qr = new QrCodes();
          qr.decodeFromImage(this.imgurl)
            .then((res) => {
              if (res == false) {
                this.$message.error("二维码识别失败!");
              } else {
                this.result = res.data;
                this.signedTransaction = JSON.parse(
                  this.result
                ).signedTransaction;
              }
            })
            .catch((e) => {
              this.$message.error("二维码识别成功,但是参数错误!");
            });
        };
      } else {
        this.$message.warning("请选择正确的文件!");
      }
    },
    // 发布广播
    onRelease() {
      this.$confirm("是否要进行交易上链?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          this.loading = true;
          this.disabled = true;
          this.dialogVisible = false;
          this.active = 1;
          this.icons = "el-icon-loading";
          this.transactionHash = "";
          this.contractAddress = "";
          // 获取交易数据
          if (this.signedTransaction) {
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
              // 交易上链
              let res = await provider.sendTransaction(this.signedTransaction);
              this.dialogVisible = true;
              this.transactionHash = res.hash;
              // 交易返回
              let data = await res.wait();
              this.contractAddress = data.contractAddress;
              this.active = 2;
              this.icons = "el-icon-circle-check";
              this.disabled = false;
              this.loading = false;
            } catch (e) {
              this.disabled = true;
              this.dialogVisible = false;
              this.loading = false;
              this.active = 1;
              this.icons = "el-icon-loading";
              this.transactionHash = "";
              this.contractAddress = "";
              let err = e.message.substr(0, e.message.indexOf("("));
              this.$confirm(err, "错误提示", {
                type: "error",
              });
            }
          } else {
            this.$message.error("请上传正确的二维码或者文件!");
          }
        })
        .catch(() => {
          this.$message.info("已取消!");
        });
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
#Broadcast {
  .Broadcast_box {
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
  .release {
    display: flex;
    flex-direction: column;
    .imgs {
      display: flex;
      .el-image {
        margin: 0 2rem;
        border: 2px solid #409eff;
        box-shadow: 5px 5px 20px 0px #409eff;
        border-radius: 2rem;
        width: 300px;
      }
    }
  }
  .release_but {
    margin: 2rem 0 0 5rem;
  }
  .el-dialog {
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