// pages/salesReturn/salesReturn.js
const app = getApp()
const api = require("../../../utils/net.js")
const util = require("../../../utils/util.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    serviceId: null,
    orderGoodsInfo: null,
    supplierInfo: null,
    isLoading: false,
    supplierServiceInfo: null,
    serviceStatus:"",
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
  /**
   * 生命周期函数--监听页面加载
   */

  loadOrderGoodsInfo: function() {
    this.showLoading(true)
    api.get(`orderGoods/${this.data.supplierServiceInfo.orderGoodsId}`, {}, {
      onNext: res => {
        res.specsSimple = res.goodsSpecificationNameValue.split(";").join(" | ")
        this.setData({
          orderGoodsInfo: res
        })
        this.onDataReady()
      },
      onError: (msg, code) => {
        this.showLoading(false)
        this.showXToast({
          title: msg,
          icon: 'no'
        })
      },      
    })
  },


  loadSupplierService: function() {
    this.showLoading(true)
    let serviceId = this.data.serviceId
    api.get(`supplierService/${serviceId}`, {}, {
      onNext: res => {
        let status = res.status
        let statusMap = new Map([[1, "提交申请"], [2, "审核通过"], [3, "审核不通过"], [99, "您已取消退货"]])
        res.serviceStatus = statusMap.get(status) || '无状态'
        this.setData({
          supplierServiceInfo: res
        })
        this.loadOrderGoodsInfo()
        this.loadSupplierInfo()
      },
      onError: (msg, code) => {
        this.showLoading(false)
        this.showXToast({
          title: msg,
          icon: 'no'
        })
      }
    })
  },


  loadSupplierInfo: function() {
    let supplierId = this.data.supplierServiceInfo.supplierId
    api.get(`supplierInfo/${supplierId}`, {}, {
      onNext: res => {
        this.setData({
          supplierInfo: res
        })
        this.onDataReady()
      },
      onError: (msg, code) => {
        this.showLoading(false)
        this.showXToast({
          title: msg,
          icon: 'no'
        })
      }
    })
  },

  onDataReady:function(){
    if (this.data.orderGoodsInfo && this.data.supplierInfo){
      this.showLoading(false)
    }
  },
  onLoad: function(options) {
    util.decodeQueryParams(options)
    if (options.id) {
      this.setData({
        serviceId: options.id
      })
      this.loadSupplierService()
    }
  },

  cancelSalesReturn: function() {
    this.showLoading(true)
    api.put('supplierService', {
      orderGoodsId: this.data.orderGoodsInfo.id,
      id:this.data.serviceId
    }, {
      onNext: res => {
        this.showXToast({
          title: '已成功取消退货申请',
          icon: 'yes',
          callBack: () => {
            wx.navigateBack()
          }
        })
      },
      onCompleted: () => this.showLoading(false)
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})