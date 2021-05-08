// pages/goodsSlogan/slogan.js
const api = require("../../utils/net.js")
const util = require("../../utils/util.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodsId: null,
    goodsInfo: null,
    slogan: null,
    textCount: 0,
    isLoading: false,
    editMode: false,
    xToast: {
      show: false
    }
  },
  showXToast: function(toast) {
    toast.show = true
    this.setData({
      xToast: toast
    })
    let that = this
    setTimeout(() => {
      that.setData({
        ['xToast.show']: false
      })
      if (toast.onDismiss) {
        toast.onDismiss()
      }
    }, 1200)
  },
  showLoading: function(show) {
    this.setData({
      isLoading: show
    })
  },
  onSloganInput: function(e) {
    let slogan = e.detail.value
    this.setData({
      textCount: slogan.length
    })
  },
  save: function(e) {
    let info = e.detail.value
    let slogan = info.slogan
    this.updateGoodsSlogan(slogan)
  },
  loadGoodsInfo: function() {
    this.showLoading(true)
    api.get(`goodsInfo/${this.data.goodsId}`, {
      self: true
    }, {
      onNext: res => {
        res.picUrl = JSON.parse(res.picUrls)[0]
        this.setData({
          goodsInfo: res
        })
      },
      onCompleted: () => this.showLoading(false)
    })
  },
  updateGoodsSlogan: function(slogan) {
    this.showLoading(true)
    if (this.data.httpType == 'post') {
      api.post('shopGoods', {
        goodsId: this.data.goodsId,
        recommend: slogan,
        status: 1
      }, {
        onNext: res => {
          this.showXToast({
            title: "代理成功",
            icon: "yes",
            onDismiss: () => this.setResult()
          })
        },
        onError: (msg, code) => {
          this.showXToast({
            title: msg,
            icon: "no"
          })
        },
        onCompleted: () => this.showLoading(false)
      })
    } else {
      api.put('shopGoods', {
        goodsId: this.data.goodsId,
        recommend: slogan,
        status: 1
      }, {
        onNext: res => {
          this.showXToast({
            title: this.data.editMode ? "推荐语修改成功" : "代理成功",
            icon: "yes",
            onDismiss: () => this.setResult()
          })
        },
        onError: (msg, code) => {
          this.showXToast({
            title: msg,
            icon: "no"
          })
        },
        onCompleted: () => this.showLoading(false)
      })
    }
  },
  setResult: function() {
    let pages = getCurrentPages()
    let targetPage = pages[pages.length - 2]
    targetPage.setData({
      goodsDataChanged: true
    })
    getApp().globalData.refreshShopPage = true
    wx.navigateBack()
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    util.decodeQueryParams(options)
    let goodsId = options.goodsId
    let slogan = options.recommend || ''
    let httpType = options.httpType || ''
    let _editMode = !!options.editMode
    if (!_editMode) {
      wx.setNavigationBarTitle({
        title: '代理商品',
      })
    }

    this.setData({
      goodsId: goodsId,
      slogan: slogan,
      textCount: slogan.length,
      httpType: httpType,
      editMode: _editMode
    })
    if (goodsId) {
      this.loadGoodsInfo()
    }
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})