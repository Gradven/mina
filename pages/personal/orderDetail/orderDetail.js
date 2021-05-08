// pages/personal/orderDetail/orderDetail.js
const app = getApp()
const api = require("../../../utils/net.js")
const util = require("../../../utils/util.js")
const wxUtils = require("../../../utils/wxUtils.js")
const {
  $Toast
} = require('../../../dist/base/index')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    sn:'',
    orderInfo: {},

    isLoading: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    this.setData({ sn: options.sn })
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
    this.getOrderInfoBySn();
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
   * 根据订单sn查询订单
   */
  getOrderInfoBySn:function(){
    let that = this;
    api.get("orderInfo/"+this.data.sn,
      {}, {
        onNext: (res) => {
          res.createTime = util.formatTime(new Date(res.createTime));
          that.getOrderGoodsByOrderSn(res.sn);
          this.setData({
            orderInfo:res
          })
          that.countDown();
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
   * 根据订单号查询订单商品
   */
  getOrderGoodsByOrderSn:function(sn){
    let that = this;
    api.get("orderGoods/orderSn/" + sn,
      {}, {
        onNext: (res) => {
          this.setData({
            isLoading: false,
            orderGoods: res.rows
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
   * 倒计时
   */
  countDown: function () {
    if (this._timmer) clearTimeout(this._timmer);
    this._timmer = setTimeout(function () {
      that.countDown();
    }, 1000);
    let that = this;
    let orderInfo = this.data.orderInfo;
    orderInfo.expiredSecond = orderInfo.expiredSecond - 1;
    orderInfo.expiredTime = util.getTime(orderInfo.expiredSecond);
    this.setData({
      orderInfo: orderInfo
    });
  },
  applyService:function(e){
    let that = this;
    let id = e.currentTarget.dataset.id;
    if (id) {
      util.toPage("../../salesReturn/salesReturn", { "id": id })
    }
  },
  serviceDetail:function(e){
    let that = this;
    let id = e.currentTarget.dataset.id;
    if (id) {
      util.toPage("../../salesReturn/detail/salesReturnDetail", { "id": id })
    }
  },
  showLogistics: function (e) {
    let that = this;
    let id = e.currentTarget.dataset.id;
    if (id) {
      util.toPage("../logistics/logistics", { "id": id })
    }
  },
  /**
   * 支付
   */
  toPay:function(){
    let that = this;
    api.post('orderInfo/retry?sn=' + this.data.sn, {}, {
      onNext: (res) => {
        if (res) {
          wxUtils.goodsPay(res, (msg) => {
            this.showXToast({
              title: msg ? msg : "支付成功",
              icon: msg ? 'no' : 'yes'
            })
            that.getOrderInfoBySn();
          })
        }
      },
      onError: (msg, code) => {
        if ("600" == code) {
          wx.showModal({
            title: '提醒',
            content: msg,
            showCancel: false,
            confirmText: "知道了",
            confirmColor: "#fe5a5d"
          })
        } else if ('602' != code) {
          this.showXToast({
            title: msg,
            icon: 'no'
          })
        }
      }
    })
  },
  showXToast: function (toast) {
    toast.show = true
    this.setData({
      xToast: toast
    })
    let that = this
    setTimeout(() => {
      that.setData({
        ['xToast.show']: false
      })
    }, 2000)
  },
})