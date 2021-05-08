// pages/personal/orderCount/orderCount.js
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
    count:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      count: options.count,
      isLoading: false,

      total: 0,
      pageNo: 1,
      pageSize: 10,
      hasMore: true,
      loading: false,
      orderGoodsList: []
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
    this.getOrderGoods();
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
    this.getOrderGoods();
  },

  getOrderGoods: function () {
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
    api.get("shopInfo/order_goods", {
      offset: offset,
      limit: pageSize
    }, {
        onNext: (res) => {
          let orderGoodsList = that.data.orderGoodsList;
          if (pageNo == 1) {
            orderGoodsList = [];
          }
          res.rows.forEach(item => {
            item.createTime = util.formatTime(new Date(item.createTime));
            orderGoodsList.push(item);
          });

          let hasMore = false;
          if (orderGoodsList.length < res.count) {
            hasMore = true;
          }
          that.setData({
            total: res.count,
            orderGoodsList: orderGoodsList,
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
  }
})