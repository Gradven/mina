// pages/shareNewShopBack/shareNewShopBack.js
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
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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
    session.check((msg) => {
      if (msg) {
        $Toast({ content: msg, type: 'error' })
        return
      }
      if (app.globalData.userInfo.shopId) {
        app.globalData.shopId = app.globalData.userInfo.shopId;
        wx.switchTab({
          url: '../shop/shop'
        })
      }

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
   * 打开注册店铺页面
   */
  toNewShop: function () {
    wx.navigateTo({
      url: '../newShop/newShop'
    })
  }
})