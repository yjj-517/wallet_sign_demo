import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    redirect: '/index/Home'
  },
  {
    path: "/index",
    name: "index",
    component: () => import("../views/Index.vue"),
    //嵌套二级路由
    children: [
      {
        path: "/index/Home",
        name: "/index/Home",
        component: () => import("../views/modules/Home.vue")
      },
      {
        path: "/index/Transfers",
        name: "/index/Transfers",
        component: () => import("../views/modules/Transfers.vue")
      },
      {
        path: "/index/Contract",
        name: "/index/Contract",
        component: () => import("../views/modules/Contract.vue")
      },
      {
        path: "/index/Token",
        name: "/index/Token",
        component: () => import("../views/modules/Token.vue")
      },
      {
        path: "/index/Broadcast",
        name: "/index/Broadcast",
        component: () => import("../views/modules/Broadcast.vue")
      },
      {
        path: "/index/Code",
        name: "/index/Code",
        component: () => import("../views/modules/Code.vue")
      },
      {
        path: "/index/Query",
        name: "/index/Query",
        component: () => import("../views/modules/Query.vue")
      },
      {
        path: "/index/Sign",
        name: "/index/Sign",
        component: () => import("../views/modules/Sign.vue")
      },
    ],
  },
];

const router = new VueRouter({
  routes,
});

export default router;