// pages/personal/cash/cash.js
const app = getApp()
const api = require("../../../utils/net.js")
const { $Toast } = require('../../../dist/base/index')
const session = require("../../../utils/session.js")
const util = require("../../../utils/util.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoading: true,
    shopWallet:{},

    amount:''
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
    this.getShopWallet();
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

  getShopWallet: function () {
    let that = this;
    api.get("shopWallet/", {}, {
      onNext: (res) => {
        that.setData({
          amount: '',
          shopWallet: res || {}
        });
      },
      onError: (msg, code) => {
        wx.showToast({
          title: msg,
          icon: 'none',
          duration: 2000
        })
      },
      onCompleted: () => {
        that.setData({
          isLoading: false
        });
      }
    })
  },
  getAll:function(){
    if (this.data.shopWallet.balance) {
      this.setData({
        amount: this.data.shopWallet.balance
      })
    }else{
      this.setData({
        amount: '0.00'
      })
    }
  },
  bindAmountInput:function(e){
    this.setData({
      amount: e.detail.value
    })
  },
  withdrawInfo:function(){
    let that = this;
    that.setData({
      isLoading: true
    });
    api.post("withdrawInfo", {
      amount: this.data.amount
    }, {
        onNext: (res) => {
          wx.showToast({
            title: '提现成功',
            icon: 'success',
            duration: 2000
          })
          that.getShopWallet();
      },
      onError: (msg, code) => {
        wx.showToast({
          title: msg,
          icon: 'none',
          duration: 2000
        })
      },
      onCompleted: () => {
        that.setData({
          isLoading: false
        });
      }
    })
  }
})