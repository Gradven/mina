// pages/salesReturn/salesReturn.js
const app = getApp()
const api = require("../../utils/net.js")
const util = require("../../utils/util.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderGoodsInfo: null,
    supplierInfo: null,
    reasons: ["发错货", "尺码偏大", "尺码偏小", "七天无理由", "商品大小不合适", "不喜欢", "其它"],
    reasonIndex: 0,
    reason: "发错货",
    remark: '',
    isLoading: false,
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
      if (toast.callBack) toast.callBack()
    }, 2000)
  },
  showLoading: function(show) {
    this.setData({
      isLoading: show
    })
  },
  bindReasonChange: function(e) {
    let index = e.detail.value
    this.setData({
      reason: this.data.reasons[index],
      reasonIndex: index
    })

  },

  save: function(e) {
    let remark = e.detail.value.remark

    if (util.isEmptyStr(remark)) {
      this.showXToast({
        title: '请填写备注',
        icon: 'warning'
      })
      return
    }

    let _reasonIndex = this.data.reasonIndex
    let reasonType = _reasonIndex == this.data.reasons.length - 1 ? 99 : _reasonIndex + 1
    this.showLoading(true)
    api.post("supplierService", {
      orderGoodsId: this.data.orderGoodsId,
      reason: remark,
      reasonType: reasonType,
      serviceAddress: this.data.supplierInfo.serviceAddress,
      supplierId: this.data.orderGoodsInfo.supplierId,
      shopId: this.data.orderGoodsInfo.shopId
    }, {
      onNext: res => this.showXToast({
        title: "退货申请提交成功",
        icon: 'yes',
        callBack: () => {
          // util.toPage('./detail/salesReturnDetail',{id:1})
          wx.navigateBack({})
        }
      }),
      onCompleted: () => this.showLoading(false)
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */

  loadOrderGoodsInfo: function() {
    this.showLoading(true)
    api.get(`orderGoods/${this.data.orderGoodsId}`, {}, {
      onNext: res => {
        res.specsSimple = res.goodsSpecificationNameValue.split(";").join(" | ")
        this.setData({
          orderGoodsInfo: res
        })
        this.loadSupplierInfo()
      },
      onError: (msg, code) => this.showLoading(false)
    })
  },


  loadSupplierInfo: function() {
    let supplierId = this.data.orderGoodsInfo.supplierId
    api.get(`supplierInfo/${supplierId}`, {}, {
      onNext: res => this.setData({
        supplierInfo: res
      }),
      onCompleted: () => this.showLoading(false)
    })
  },

  onLoad: function(options) {
    util.decodeQueryParams(options)
    if (options.id) {
      this.setData({
        orderGoodsId: options.id
      })
      this.loadOrderGoodsInfo()
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