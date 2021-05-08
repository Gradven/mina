// pages/personal/afterSale/afterSale.js
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

    goodsList:[]
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
    this.getGoodsList();
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

  getGoodsList:function(){
    let that = this;
    let pageNo = this.data.pageNo;
    let pageSize = this.data.pageSize;
    let offset = pageSize * (pageNo - 1);
    api.get("supplierService",
      {
        offset: offset,
        limit: pageSize
      }, {
        onNext: (res) => {
          let goodsList = res.rows;

          if (goodsList) {
            goodsList.forEach(order => {
              order.orderGoods.goodsSpecificationNameValue = order.orderGoods.goodsSpecificationNameValue.split(";").join(" | ")
            })
          }

          if (pageNo !== 1) {
            goodsList = that.data.goodsList.concat(goodsList);
          }
          let hasMore = false;
          if (goodsList.length < res.count) {
            hasMore = true;
          }
          that.setData({
            isLoading: false,
            total: res.count,
            goodsList: goodsList,
            hasMore: hasMore
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

  serviceDetail: function (e) {
    let that = this;
    let id = e.currentTarget.dataset.id;
    if (id) {
      util.toPage("../../salesReturn/detail/salesReturnDetail", { "id": id })
    }
  },
})