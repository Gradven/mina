// pages/newShop/newShop.js
const app = getApp()
const api = require("../../utils/net.js")
const util = require("../../utils/util.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    mobile:'',
    code : '',
    isChecked:true,

    count:60,
    loading:false,
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
   * 设置手机号码
   */
  setMobile: function (event){
    this.setData({
      mobile : event.detail.value
    })
  },
  /**
   * 设置邀请码
   */
  setInvitationCode: function (event) {
    this.setData({
      invitationCode: event.detail.value
    })
  },
  /**
   * 设置验证码
   */
  setCode: function (event) {
    this.setData({
      code: event.detail.value
    })
  },
  /**
   * 获取验证码
   */
  getCode: function(){
    let that = this;
    if (!this.data.mobile){
      wx.showToast({
        title: "请输入手机号",
        icon: 'none',
        duration: 2000
      })
      return;
    }
    if (!this.data.invitationCode) {
      wx.showToast({
        title: "请输入邀请码",
        icon: 'none',
        duration: 2000
      })
      return;
    }
    api.get("user/bindMobile/sendCode/",
      {
        mobile: this.data.mobile,
        invitationCode: this.data.invitationCode
      }, {
        onNext: (res) => {
          wx.showToast({
            title: "验证短信已发送",
            icon: 'none',
            duration: 2000
          })
          let count = that.data.count;
          if (count != 60) {
            return;
          }
          that.countDown(count);
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
  agreement: function () {
    wx.navigateTo({
      url: '../agreement/agreement'
    })
  },
  /**
   * 提交申请
   */
  autoAddShop: function () {
    let that = this;
    if (!this.data.mobile || !this.data.code) {
      return;
    }
    if (!this.data.isChecked) {
      wx.showToast({
        title: "请先同意用户协议",
        icon: 'none',
        duration: 2000
      })
      return;
    }
    api.get("user/bindMobile/verifyCode/autoAddShop",
      {
        mobile: this.data.mobile,
        code: this.data.code
      }, {
        onNext: (res) => {
          app.globalData.shopId = res;
          app.globalData.userInfo.shopId = res;
          wx.showToast({
            title: "申请成功",
            icon: 'none',
            duration: 2000
          })
          setTimeout(function () {
            wx.navigateTo({
              url: '../newShopSuccess/newShopSuccess'
            })
          }, 1500);
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
  countDown: function (count){
    let that = this;
    count = count -1;
    if (count == 0) {
      this.setData({
        count: 60
      });
    } else {
      this.setData({
        count: count
      });
      setTimeout(function () {
        that.countDown(count);
      }, 1000);
    }
  },
  checkboxChange:function(e){
    this.setData({
      isChecked: e.detail.value.length>0
    })
  }
})