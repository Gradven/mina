// pages/shop/shop.js
const app = getApp()
const api = require("../../../utils/net.js")
const { $Toast } = require('../../../dist/base/index')
const session = require("../../../utils/session.js")
const util = require("../../../utils/util.js")
Page({
  /**
   * 页面的初始数据  
   */
  data: {

    activeIndex: -1,
    lastShopList: [],
    marginLeft: 0,
    scrollLeft: 0,
    screenWidth: 0,
    screenHeight: 0,

    isLoading: true,

    total: 0,
    pageNo: 1,
    pageSize: 10,
    hasMore: true,
    loading: false,

    keywords: '',
    shopInfoList: [],

  },
  hideLoading: function () {
    if (this.data.isLoading)
      this.setData({ isLoading: false })
  },
  showLoading: function () {
    if (!this.data.isLoading)
      this.setData({ isLoading: true })
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
    session.check((msg) => {
      if (msg) {
        $Toast({ content: msg, type: 'error' })
        return
      }
      if (app.globalData.userInfo.shopId) {
        wx.setTabBarItem({
          index: 1,
          text: '选货中心'
        })
      }
      this.getLastShopList();

    })

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },
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
        that.hideLoading()
      }
    })
  },
  chooseCatalog: function (e) {
    this.setData({
      activeIndex: e.currentTarget.dataset.index,
      swiperCurrent: 0
    })
    this.calcScrollLeft();
    this.scrollEndEvent(e.currentTarget.dataset.index)
  },
  scrollEndEvent: function (index) {

  },
  // 横滑同步距离计算
  calcScrollLeft: function () {
    if (this.data.activeIndex < 2) {
      this.setData({ scrollLeft: 0 });
    } else {
      var screenwidth = this.data.screenWidth;
      var currentLeft = (this.data.activeIndex - 2) * screenwidth / 5
      this.setData({
        scrollLeft: currentLeft
      });
    }
  },
  intoShop: function (e) {
    app.globalData.shopId = e.currentTarget.dataset.id;
    wx.switchTab({
      url: '../../shop/shop'
    })
  }
})