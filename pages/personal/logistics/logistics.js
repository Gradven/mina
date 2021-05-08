// pages/personal/logistics/logistics.js
const app = getApp()
const api = require("../../../utils/net.js")
const util = require("../../../utils/util.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: '',

    isLoading: true,
    couriersInfo:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    this.setData({ id: options.id }, function () {
      that.getCouriers();
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
   * 根据订单商品id查询物流
   */
  getCouriers: function () {
    let that = this;
    api.get("orderGoods/" + this.data.id +"/couriers",
      {}, {
        onNext: (res) => {
          this.setData({
            couriersInfo: res
          })
        },
        onError: (msg, code) => {
          wx.showToast({
            title: msg,
            icon: 'none',
            duration: 2000
          })
        },
        onCompleted: () => {
          this.setData({
            isLoading: false
          })
        }
      })
  },
})