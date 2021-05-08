// pages/shop/shop.js
const app = getApp()
const api = require("../../utils/net.js")
const { $Toast } = require('../../dist/base/index')
const session = require("../../utils/session.js")
const util = require("../../utils/util.js")
Page({
  /**
   * 页面的初始数据  
   */
  data: {

    activeIndex: -1,
    marginLeft: 0,
    scrollLeft: 0,
    screenWidth: 0,
    screenHeight: 0,

    isLoading: false,
    empty: false,

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
  submitForm: function (e) {
    let that = this;
    let keywords = e.detail.value;
    this.setData({
      pageNo: 1,
      keywords: keywords,
      hasMore: true
    }, function () {
      that.getShopInfoList();
    })
  },
  inputSearch: function (e) {
    this.setData({
      empty: false,
      total: 0,
      shopInfoList: [],
      hasMore: true
    })
  },
  onSearchClear:function(){
    this.setData({
      empty: false,
      total: 0,
      shopInfoList: [],
      hasMore: true
    })
  },
  getShopInfoList: function () {
    var that = this;
    if (!this.data.hasMore || this.data.loading) {
      return;
    }
    this.setData({
      isLoading: true,
      loading: true
    })
    let keywords = this.data.keywords;
    let pageNo = this.data.pageNo;
    let pageSize = this.data.pageSize;
    let offset = pageSize * (pageNo - 1);

    api.get("shopInfo", {
      "name": keywords,
      offset: offset,
      limit: pageSize
    }, {
        onNext: (res) => {
          let shopInfoList = that.data.shopInfoList;
          if (pageNo == 1) {
            shopInfoList = [];
          }
          shopInfoList = shopInfoList.concat(res.rows);
          let hasMore = false;
          if (shopInfoList.length < res.count) {
            hasMore = true;
          }
          that.setData({
            isLoading: false,
            empty: res.count == 0,
            total: res.count,
            shopInfoList: shopInfoList,
            hasMore: hasMore
          })
        },
        onError: (msg, code) => {
          $Toast({
            content: msg,
            type: 'error'
          });
        },
        onCompleted: () => {
          that.setData({
            loading: false
          })
        }
      })

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
      this.setData({
        hasShop: !!app.globalData.userInfo.shopId
      })
      // this.getShopInfoList();

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
    this.setData({
      pageNo: this.data.pageNo + 1
    });
    this.getShopInfoList();
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
      url: '../shop/shop'
    })
  },
})