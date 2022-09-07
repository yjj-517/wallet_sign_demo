 <template>
  <div id="Sign">
    <!-- 交易签署 -->
    <div class="Sign_box">
      <p>
        <span>签署账号私钥:</span>
        <el-input
          v-model="privateKey"
          placeholder="请输入私钥"
          clearable
        ></el-input>
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
            <p>{ "nonce" : 1, "chainId" : 1, ... }</p>
          </div>
        </el-button>
      </p>
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
    <el-divider></el-divider>
    <!-- 广播按钮 -->
    <div class="release_but" v-if="result">
      <el-button type="primary" @click="onSign">签署交易</el-button>
    </div>
    <!-- 生成二维码 -->
    <el-dialog
      title="签署交易二维码生成"
      :visible.sync="dialogVisible1"
      width="500px"
    >
      <span>签署交易成功,请下载二维码:</span>
      <Qrcode :raw="raw"></Qrcode>
    </el-dialog>
    <!-- 生成json文件 -->
    <el-dialog
      title="签署交易json文件生成"
      :visible.sync="dialogVisible2"
      width="500px"
      class="json_box"
    >
      <div>
        <p>签署交易成功,请下载文件:</p>
        <el-button type="primary" @click="download">下载文件</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ethers } from "ethers"; //ethers.js
import QrCodes from "qrcode-decoder"; //二维码解析
import Qrcode from "@/components/Qrcode.vue"; //二维码生成
export default {
  name: "Sign",
  // 模板引入
  components: {
    Qrcode,
  },
  // 数据
  data() {
    return {
      privateKey: "", //私钥
      dialogVisible1: false,
      dialogVisible2: false,
      imgurl: "", //图片
      result: "", //二维码/文件解析
      transaction: {}, //获取的交易内容
      ident: 0, //区分文件1/二维码2
      raw: "", //生成的上链信息
    };
  },
  // 方法
  methods: {
    // 获取图片
    changesData(e) {
      this.imgurl = ""; //图片
      this.result = ""; //二维码/文件解析
      this.ident = 0; //区分二维码/文件
      // 获取文件/图片
      const fileList = e.target.files[0];
      let fileType = fileList.type.substring(0, fileList.type.indexOf("/"));
      let reader = new FileReader();
      // 判断文件类型解析
      if (fileType == "application") {
        reader.readAsText(fileList);
        reader.onload = (e) => {
          this.result = e.target.result;
          this.ident = 1;
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
                this.ident = 2;
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
    // 签署交易
    async onSign() {
      this.raw = "";
      this.transaction = {};
      if (this.privateKey && this.result) {
        this.transaction = JSON.parse(this.result);
        if (Object.keys(this.transaction).length > 4) {
          if (this.transaction.value) {
            // 将价格进行单位转换
            this.transaction.value = ethers.utils.parseEther(
              this.transaction.value.toString()
            );
          }
          // 构建钱包签署交易
          const wallet = new ethers.Wallet(this.privateKey);
          const signPromise = wallet.signTransaction(this.transaction);
          signPromise
            .then((res) => {
              const signs = { signedTransaction: res };
              this.raw = JSON.stringify(signs);
              if (this.raw && this.ident == 2) {
                // 生成二维码
                this.dialogVisible1 = true;
              } else if (this.raw && this.ident == 1) {
                // 生成文件
                this.dialogVisible2 = true;
              } else {
                this.$message.error("生成文件/二维码失败!");
              }
            })
            .catch((e) => {
              let err = e.message.substr(0, e.message.indexOf("("));
              this.$alert(err, "错误提示:", {
                confirmButtonText: "确定",
              });
            });
        } else {
          this.$message.error("上传数据解析错误!");
        }
      } else {
        this.$message.warning("请填写私钥或者上传文件!!!");
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
        "data:text/csv;charset=utf-8,\ufeff" + encodeURIComponent(this.raw);
      //通过创建a标签实现
      let link = document.createElement("a");
      link.href = uri;
      //对下载的文件命名
      link.download = timeSty + "signData.json";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
#Sign {
  .Sign_box {
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
        width: 40rem;
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