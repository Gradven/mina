// pages/shopVisitHistory/shopVisitHistory.js
const api = require("../../utils/net.js")
const util = require("../../utils/util.js")
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */

  data: {
    mode: null,
    isLoading: false,
    visitors: null,
    shops: null,
    showEmpty:false,
    dataLoaded: false,
    isHideLoadMore: true,
    shopId: null,
  },
  showLoading: function(show) {
    this.setData({
      isLoading: show
    })
  },
  loadVisitors: function(loadMore = false) {

    if (this.data.dataLoaded) return
    let offset = 0

    if (loadMore) {
      offset = this.data.visitors ? this.data.visitors.length : 0
    } else {
      this.showLoading(true)
      offset = 0
    }

    api.get(`shopInfo/${this.data.shopId}/visitors`, {
      limit: 10,
      offset: offset
    }, {
      onNext: res => {
        if (res.rows) res.rows.forEach(it => it.friendlyTime = util.friendlyTime(it.visitTime))
        let _visitors = loadMore ? this.data.visitors.concat(res.rows) : res.rows
        let count = res.count
        let loaded = _visitors.length == count
        this.setData({
          visitors: _visitors,
          dataLoaded: loaded,
          showEmpty: _visitors.length == 0
        })
      },
      onCompleted: () => this.showLoading(false)
    })
  },

  loadMyVisitedShops: function(loadMore = false) {

    if (this.data.dataLoaded) return
    let offset = 0

    if (loadMore) {
      offset = this.data.shops ? this.data.shops.length : 0
    } else {
      this.showLoading(true)
      offset = 0
    }

    api.get('shopVisit', { limit: 10,offset: offset}, {
      onNext: res => {
        // let userShopId = app.globalData.userInfo.shopId
        // if(userShopId && res){
        //   res.splice(res.findIndex(it => it.id == userShopId))
        // }
        
        let _shops = loadMore ? this.data.shops.concat(res) : res
        let loaded = res.length < 10 
        this.setData({
          shops: _shops,
          dataLoaded: loaded,
          showEmpty: _shops.length == 0
        })
      },
      onCompleted: () => this.showLoading(false)
    })
  },
  toShop:function(e){
    let shopId = e.currentTarget.dataset.shop_id
    if(shopId){
      app.globalData.shopId = shopId
      wx.switchTab({
        url: '../shop/shop',
      })
      // wx.navigateBack()
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    if ("myVisit" == options.mode) {
      wx.setNavigationBarTitle({
        title: '访问过的店铺',
      })
    }
    this.setData({
      mode: options.mode,
      shopId: options.shopId||""
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    if ("myVisit" == this.data.mode) {
      this.loadMyVisitedShops()
    } else {
      this.loadVisitors()
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if ("myVisit" == this.data.mode) {
      this.loadMyVisitedShops(true)
    } else {
      this.loadVisitors(true)
    }

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})