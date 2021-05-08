const session = require("../../utils/session.js")

//获取应用实例
const app = getApp()

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
    app.globalData.authorizing = false
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
  onGotUserInfo: function (res) {
    if (res.detail.errMsg == 'getUserInfo:fail auth deny'){
      wx.navigateBack()
      return
    }

    app.globalData.userInfo = null;

    wx.showLoading({
      title: '登录中',
    })

    app.globalData.checkSelf = false
    session.check(()=>{
      wx.hideLoading()
      if (app.globalData.authorizing){
        wx.navigateBack({
          delta: 1
        })
      }
    },false)
   
  }
})