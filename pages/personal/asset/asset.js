// pages/personal/asset/asset.js
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
    day:10,

    userCertificateInfo:{},
    shopWallet:{},
    isLoading:false,

    total: 0,
    pageNo: 1,
    pageSize: 10,
    hasMore: true,
    loading: false,
    shopProfitList: [],
    
    feedbackFlag: false
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
    this.getUserCertificate();
    this.getShopWallet();
    this.getShopProfit();
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
    this.setData({
      pageNo: this.data.pageNo + 1
    });
    this.getShopProfit();
  },

  /**
   * 提现
   */
  cash:function(){
    if (this.data.userCertificateInfo.approveStatus != 1) {
      wx.navigateTo({
        url: '../certification/certification'
      })
    }else{
      wx.navigateTo({
        url: '../cash/cash'
      })
    }
  },
  getShopWallet:function(){
    let that = this;
    api.get("shopWallet/", {}, {
      onNext: (res) => {
        that.setData({
          shopWallet:res || {}
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
      }
    })
  },
  getUserCertificate: function () {
    let that = this;
    this.setData({
      isLoading:true
    });
    api.get("userCertificate", {}, {
      onNext: (res) => {
        that.setData({
          isLoading: false,
          userCertificateInfo: res || {}
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
      }
    })
  },
  getShopProfit:function(){
    let that = this;
    if (!this.data.hasMore || this.data.loading) {
      return;
    }
    this.setData({
      loading: true
    })
    let pageNo = this.data.pageNo;
    let pageSize = this.data.pageSize;
    let offset = pageSize * (pageNo - 1);
    api.get("shopProfit", {
      offset: offset,
      limit: pageSize
    }, {
      onNext: (res) => {
        let shopProfitList = that.data.shopProfitList;
        if (pageNo == 1) {
          shopProfitList = [];
        }
        res.rows.forEach(item => {
          item.createTime = util.formatTime(new Date(item.createTime));
          shopProfitList.push(item);
        });
      
        let hasMore = false;
        if (shopProfitList.length < res.count) {
          hasMore = true;
        }
        that.setData({
          total: res.count,
          shopProfitList: shopProfitList,
          hasMore: hasMore
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
        that.setData({
          loading: false
        })
      }
    })
  },
  getConfigParam:function(){
    let that = this;
    this.setData({
      loading: true
    })
    api.get("configParam/key", {
      key: 'portal.order.profit.confirm.days'
    }, {
        onNext: (res) => {
          that.setData({
            day: res
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
          that.setData({
            feedbackFlag: true,
            loading: false
          })
        }
      })
  },
  showFeedback:function(e){
    this.getConfigParam();
  },
  hideFeedback: function (e) {
    this.setData({
      feedbackFlag: false
    })
  },
})