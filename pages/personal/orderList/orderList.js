// pages/personal/orderList/orderList.js
const app = getApp()
const api = require("../../../utils/net.js")
const util = require("../../../utils/util.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    total: 0,
    pageNo: 1,
    pageSize: 10,
    hasMore: true,

    isLoading: true,

    orderList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getOrderInfoList();
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
    this.setData({
      pageNo: this.data.pageNo + 1
    });
    this.getOrderInfoList();
  },

  /**
   * 所有订单列表
   */
  getOrderInfoList: function () {
    let that = this;
    let pageNo = this.data.pageNo;
    let pageSize = this.data.pageSize;
    let offset = pageSize * (pageNo - 1);
    api.get("orderInfo",
      {
        offset: offset,
        limit: pageSize
      }, {
        onNext: (res) => {
          let orderList = [];

          res.rows.forEach((item,index) => {
            if (item.status == 0) {
              item.statusName = "待支付";
            } else if (item.status == 1) {
              item.statusName = "已支付";
            } else if (item.status == 2) {
              item.statusName = "已完成";
            } else if (item.status == 99) {
              item.statusName = "已取消";
              item.className = "gray";
            } else {
              item.statusName = "";
            }
            item.orderGoodsList.forEach(it => it.goodsSpecificationNameValue = it.goodsSpecificationNameValue.split(";").join(" | "))
            orderList.push(item);
          });

          if (pageNo !== 1) {
            orderList = that.data.orderList.concat(orderList);
          }
          let hasMore = false;
          if (orderList.length < res.count) {
            hasMore = true;
          }
          that.setData({
            isLoading:false,
            total: res.count,
            orderList: orderList,
            hasMore: hasMore
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
   * 倒计时
   */
  countDown: function () {
    if (this._timmer) clearTimeout(this._timmer);
    this._timmer = setTimeout(function () {
      that.countDown();
    }, 1000);
    let that = this;
    let orderList = [];
    this.data.orderList.forEach((item, index) => {
      item.expiredSecond = item.expiredSecond - 1;
      item.expiredTime = util.getTime(item.expiredSecond);
      orderList.push(item);
    });
    this.setData({
      orderList: orderList
    });
  },
  /**
   * 去支付
   */
  toPay: function (e) {
    let sn = e.currentTarget.dataset.sn
    if (sn) {
      util.toPage("../orderDetail/orderDetail", { "sn": sn })
    }
  }
})