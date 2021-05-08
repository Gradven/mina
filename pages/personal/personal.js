// pages/personal/personal.js
const app = getApp()
const api = require("../../utils/net.js")
const util = require("../../utils/util.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    shopInfo:{},
    left:0,

    current: 'tab2',
    userInfo: {},
    shopWallet: {},
  
    funList:[
      {
        id:1,
        name:"待付款"
      },
      {
        id: 2,
        name: "待收货"
      },
      {
        id: 3,
        name: "售后"
      },
      {
        id: 4,
        name: "全部订单"
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    wx.getSystemInfo({
      success: (data) => {
        this.setData({
          screenWidth: data.screenWidth,
          screenHeight: data.screenHeight
        })
      }
    })
    let current = 'tab2';
    if (app.globalData.userInfo.shopId){
      current = 'tab1';
    }
    this.setData({
      current: current,
      userInfo: app.globalData.userInfo
    })
  
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    if (!app.globalData.userInfo.shopId) {
      var query = wx.createSelectorQuery();
      //选择id
      var that = this;
      query.select('.nickname').boundingClientRect(function (rect) {
        that.setData({
          left: (that.data.screenWidth - rect.width) / 2
        });
      }).exec();
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getShopInfo();
    this.getShopWallet();
    this.getCountStatus();
    this.getLastShopList();
    wx.setNavigationBarTitle({
      title: ''
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },
  /**
   * tab切换
   */
  handleTabChange: function ({ detail }){
    var query = wx.createSelectorQuery();
    //选择id
    var that = this;
    this.setData({
      current: detail.key
    },function(){
      query.select('.nickname').boundingClientRect(function (rect) {
        that.setData({
          left: (that.data.screenWidth - rect.width) / 2
        });
      }).exec();
    });
  },
  /**
   * 获取店铺信息
   */
  getShopInfo: function () {
    let that = this;
    let shopId = app.globalData.userInfo.shopId;
    if (!shopId){
      return;
    }
    api.get("shopInfo/" + shopId, "", {
      onNext: (res) => {
        that.setData({
          shopInfo: res
        })
      },
      onError: (msg, code) => {
        // $Toast({ content: msg, type: 'error' }); 
        wx.showToast({
          title: msg ? msg : `服务器异常，错误代码${code}`,
        })
      }
    })
  },
  /**
   * 获取小店销售情况
   */
  getShopWallet: function () {
    let that = this;
    api.get("shopWallet/", {}, {
      onNext: (res) => {
        
        that.setData({
          shopWallet: res || {}
        });
      },
      onError: (msg, code) => {
        wx.showToast({
          title: msg,
          icon: 'none',
          duration: 2000
        })
      },
      onCompleted: () => {
      }
    })
  },
  /**
   * 根据状态获取订单数量
   */
  getCountStatus: function () {
    let that = this;
    api.get("orderInfo/countStatus",
      {}, {
        onNext: (res) => {
          that.setData({
            unPay: res.unPay,
            unReceive: res.waiting
          })
        },
        onError: (msg, code) => {
          wx.showToast({
            title: msg,
            icon: 'none',
            duration: 2000
          })
        }
      })
  },
  /**
   * 点击功能区域
   */
  setActiveFunId:function(event){
    let id = event.currentTarget.dataset.id;
    if(id == 1){
      wx.navigateTo({
        url: './pendingPayment/pendingPayment'
      })
    } else if (id == 2) {
      wx.navigateTo({
        url: './toBeReceived/toBeReceived'
      })
    } else if (id == 3) {
      wx.navigateTo({
        url: './afterSale/afterSale'
      })
    } else if (id == 4) {
      wx.navigateTo({
        url: './orderList/orderList'
      })
    }
    console.log("setActiveFunId=" + event.currentTarget.dataset.id);
  },
  /**
   * 打开页面
   */
  openPage: function (event) {
    let page = event.currentTarget.dataset.page;
    if (page == 'guide') {
      wx.navigateTo({
        url: '../guide/guide'
      })
    }else if (page == 'sale') {
      wx.navigateTo({
        url: './saleManage/saleManage'
      })
    } else if (page == 'address') {
      wx.navigateTo({
        url: '../address/address'
      })
    } else if (page == 'shops') {
      // wx.navigateTo({
      //   url: './shopList/shopList'
      // })
      util.toPage("../shopVisitHistory/shopVisitHistory", {
        mode: "myVisit"
      })
    } else if (page == 'shareNewShop') {
      wx.navigateTo({
        url: '../shareNewShop/shareNewShop'
      })
    } else if (page == 'salesAmount') {
      let count = event.currentTarget.dataset.count;
      wx.navigateTo({
        url: './salesAmount/salesAmount?count=' + count
      })
    } else if (page == 'profitAmount') {
      let count = event.currentTarget.dataset.count;
      wx.navigateTo({
        url: './profitAmount/profitAmount?count=' + count
      })
    } else if (page == 'orderCount') {
      let count = event.currentTarget.dataset.count;
      wx.navigateTo({
        url: './orderCount/orderCount?count=' + count
      })
    } else if (page == 'asset') {
      wx.navigateTo({
        url: './asset/asset'
      })
    } else if (page == 'servicefee') {
      wx.navigateTo({
        url: './servicefee/servicefee'
      })
    } else if (page == 'phone') {
      wx.makePhoneCall({
        phoneNumber: '0731-85577208'
      })
    } else if (page == 'invoice'){
      wx.navigateTo({
        url: '../invoice/invoice'
      })
    }
    
  
    console.log("page=" + event.currentTarget.dataset.page);
  },
  /**
   * 最近进入的店铺
   */
  getLastShopList: function () {
    let that = this;
    api.get("shopVisit", {}, {
      onNext: (res) => {
        that.setData({
          lastShopList: res
        });
      },
      onError: (msg, code) => {
        $Toast({
          content: msg,
          type: 'error'
        });
      },
      onCompleted: () => {
      }
    })
  },
})