<template>
  <div id="Qrcode">
    <!-- 二维码生成器 -->
    <div class="qr_box">
      <vue-qr
        :text="raw"
        :margin="0"
        colorDark="#409EFF"
        colorLight="#fff"
        :logoScale="0.3"
        :size="300"
        :callback="callBack"
      ></vue-qr>
    </div>
    <!-- 下载按钮 -->
    <el-button type="primary">
      <a
        :href="href"
        target="_blank"
        download="TransactionQRCode"
        rel="noopener noreferrer"
      >
        下载二维码</a
      ></el-button
    >
  </div>
</template>

<script>
import vueQr from "vue-qr"; //二维码生成器
export default {
  name: "Qrcode",
  // 模板引入
  components: {
    vueQr,
  },
  props: {
    raw: {
      type: null,
    },
  },
  // 数据
  data() {
    return {
      href: "", //下载二维码
    };
  },
  // 方法
  methods: {
    // 生成二维码
    callBack(base64, pid) {
      // 生成的二维码 Data URI 可以在回调中取得,第一个参数为二维码 data URL, 第二个参数为 props 传过来的 qid(因为二维码生成是异步的,所以加个 id 用于排序)
      this.href = base64;
      // console.log(base64, pid);
    },
  },
  // 创建后
  created() {},
  // 挂载后
  mounted() {},
  // 更新后
  updated() {},
  // 销毁
  beforeDestroy() {},
};
</script>

<style lang="less" scoped>
#Qrcode {
  display: flex;
  flex-direction: column;
  .qr_box {
    margin: 2rem auto;
    border: 2px solid #909399;
    padding: 0.5rem;
  }
  .el-button {
    margin: 0 auto;
    width: 10rem;
    a {
      color: #fff;
    }
  }
}
</style>
