<template>
  <el-container>
    <!-- 左侧 -->
    <el-aside width="220px">
      <h1>NFT管理系统</h1>
      <!--     :default-active="$route.path"         -->
      <el-menu
        @select="selectMenu"
        :default-active="activePath"
        background-color="#001529"
        text-color="#FFFFFF"
        active-text-color="#1890FF"
        unique-opened
        router
      >
        <div v-for="obj in treelist" :key="obj.index">
          <!-- 可展开的菜单 -->
          <el-submenu v-if="obj.children" :index="obj.index">
            <template slot="title">
              <i :class="obj.i"></i>
              <span>{{ obj.text }}</span>
            </template>

            <!-- 展开的菜单：应该循环当前数据的obj.children数组 -->
            <el-menu-item
              v-for="child in obj.children"
              :key="child.index"
              :index="child.index"
              >{{ child.text }}</el-menu-item
            >
          </el-submenu>
          <!-- 无法展开直接点击的菜单儿子 -->
          <el-menu-item v-else :index="obj.index">
            <i :class="obj.i"></i>
            <span slot="title">{{ obj.text }}</span>
          </el-menu-item>
        </div>
      </el-menu>
    </el-aside>

    <!-- 右侧 -->
    <el-container>
      <!-- 右-头 -->
      <el-header>
        <!-- <h1>Welcome To NFT</h1> -->
        <!-- 面包屑 -->
        <div class="bread">
          <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item class="bread_01" :to="{ path: '/' }"
              >首页</el-breadcrumb-item
            >
            <el-breadcrumb-item
              class="bread_01"
              v-for="item in breadList"
              :key="item"
              >{{ item }}</el-breadcrumb-item
            >
          </el-breadcrumb>
        </div>
      </el-header>
      <!-- 右-身 -->
      <el-main>
        <el-card>
          <router-view></router-view>
        </el-card>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      breadList: [], // 面包屑数组
      activePath: "", // 当前激活哈希
      treelist: [
        { index: "/index/Home", i: "el-icon-star-off", text: "Home" },
        {
          index: "/index/Transfers",
          i: "el-icon-suitcase",
          text: "转账页面",
          bread: ["转账页面"],
        },
        {
          index: "/index/Contract",
          i: "el-icon-magic-stick",
          text: "部署合约",
          bread: ["部署合约"],
        },
        {
          index: "/index/Token",
          i: "el-icon-coin",
          text: "代币转账",
          bread: ["代币转账"],
        },
        {
          index: "/index/Code",
          i: "el-icon-s-claim",
          text: "调用合约方法",
          bread: ["调用合约方法"],
        },
        {
          index: "/index/Broadcast",
          i: "el-icon-edit",
          text: "广播交易",
          bread: ["广播交易"],
        },
        {
          index: "/index/Query",
          i: "el-icon-s-finance",
          text: "MetaMask",
          bread: ["MetaMask"],
        },
        {
          index: "/index/Sign",
          i: "el-icon-document",
          text: "签署交易",
          bread: ["签署交易"],
        },
      ],
    };
  },
  methods: {
    // 选中菜单
    selectMenu(index) {
      let bread = [];
      for (let obj of this.treelist) {
        // 判断是否有children,有则循环儿子
        if (obj.children) {
          for (let child of obj.children) {
            if (child.index == index) {
              bread = child.bread;
            }
          }
        } else {
          // 没有儿子，直接判断索引
          if (obj.index == index) {
            bread = obj.bread;
          }
        }
      }
      this.breadList = bread;
    },
  },
  mounted() {
    this.activePath = this.$route.path;
    this.selectMenu(this.activePath); // 找到当前选项卡的面包屑数组
  },
};
</script>

<style lang="less" scoped>
.el-menu {
  border: 0;
}
.el-container {
  width: 100%;
  height: 100%;
  .el-aside {
    background-color: #002140;
    h1 {
      line-height: 4.3rem;
      color: #fff;
      text-align: center;
    }
  }
  .el-header {
    background-color: #001529;
    h1 {
      line-height: 4.3rem;
      color: #fff;
      text-align: center;
    }
    .bread {
      margin: 1.5rem 0 0;
    }
    .bread_01 /deep/ .el-breadcrumb__inner {
      color: #fff;
      &:hover {
        color: #1890ff;
      }
    }
  }
}
</style>
