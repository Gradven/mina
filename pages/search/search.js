// pages/search/search.js
const util = require("../../utils/util.js")
const api = require("../../utils/net.js")
const {
  $Toast
} = require('../../dist/base/index')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    shopId: 1,
    isHideLoadMore: true,
    keywords: '',
    goods: null,
    loaded: false,
    isLoading: false,
    searchEmptyTop: .3,
  },

  showLoading: function(show) {
    this.setData({
      isLoading: show
    })
  },

  submitForm: function(e) {

  },
  onConfirm: function(e) {
    let keywords = e.detail.value
    if (util.isEmptyStr(keywords)) {
      $Toast({
        content: "关键字不能为空",
        type: 'warning'
      })
    } else {
      this.setData({
        keywords: keywords
      })
      this.showLoading(true)
      this.loadGoodsInShop(keywords, false)
    }

  },
  loadGoodsInShop: function(name, loadMore) {
    if(!name){ return }
    let offset = 0
    if (loadMore) {
      let len = this.data.goods.length
      offset = len ? len : 0
    }
    let that = this
    api.get("goodsInfo/shop", {
      'shopId': this.data.shopId,
      'name': name,
      'offset': offset,
      'limit': 10
    }, {
      onNext: (res) => that.showGoods(res.rows, loadMore),
      onError: (msg, code) => $Toast({
        content: msg,
        type: 'error'
      }),
      onCompleted: () => this.showLoading(false)
    })
  },
  showGoods: function(data, loadMore) {

    let _data = this.data.goods
    _data = loadMore ? _data.concat(data) : data
    let loaded = data.length == 0 || data.length % 10 != 0 //为空，或者不满一页 
    let isHideLoadMore = _data.length == 0
    _data.forEach((item) => {
      item.picUrl = JSON.parse(item.picUrls)[0]
    })
    
    this.setData({
      goods: _data,
      isHideLoadMore: isHideLoadMore,
      loaded: loaded
    })
  },
  onSearchClear: function(e) {
    this.setData({
      goods: null,
      isHideLoadMore:true,
    })
  },
  toGoodsDetailPage: function(e) {
    let goodsId = e.currentTarget.dataset.goods_id
    if (goodsId) {
      util.toPage("../goodsDetail/goodsDetail", {
        "shopId": this.data.shopId,
        "goodsId": goodsId
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    util.decodeQueryParams(options)
    wx.setNavigationBarTitle({
      title: options.shopName
    })
    let emptyTop = util.verticalDistance([106], 500)
    this.setData({
      searchEmptyTop: emptyTop,
      shopId: options.shopId
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
    this.loadGoodsInShop(this.data.keywrods, true)
  },

})