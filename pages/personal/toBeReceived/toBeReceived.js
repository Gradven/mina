// pages/personal/toBeReceived/toBeReceived.js
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

    goodsList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getOrderGoodsList();
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
    this.getOrderGoodsList();
  },

  /**
   * 待收货列表
   */
  getOrderGoodsList:function(){
    let that = this;
    let pageNo = this.data.pageNo;
    let pageSize = this.data.pageSize;
    let offset = pageSize * (pageNo - 1);
    api.get("orderGoods?shippingStatusArray=0&shippingStatusArray=1",
      {
        payStatus: 1,
        offset: offset,
        limit: pageSize
      }, {
        onNext: (res) => {
          
          let goodsList = res.rows;

          if (goodsList) {
            goodsList.forEach(it => it.goodsSpecificationNameValue = it.goodsSpecificationNameValue.split(";").join(" | "))
          }
          if (pageNo !== 1) {
            goodsList = that.data.goodsList.concat(goodsList);
          }
          let hasMore = false;
          if (goodsList.length < res.count) {
            hasMore = true;
          }
          that.setData({
            isLoading:false,
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
  received: function (e) {
    let that = this;
    let id = e.currentTarget.dataset.id
    api.put("orderGoods/"+id,
      {}, {
        onNext: (res) => {
          wx.showToast({
            title: '操作成功',
            icon: 'success',
            duration: 2000
          })
          let goodsList = [];
          that.data.goodsList.forEach(item => {
            if (item.id != id) {
              goodsList.push(item);
            }
          })
          that.setData({
            goodsList: goodsList
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
  showLogistics:function(e){
    let that = this;
    let id = e.currentTarget.dataset.id;
    if (id) {
      util.toPage("../logistics/logistics", { "id": id })
    }
  },
  orderDetail: function (e) {
    let sn = e.currentTarget.dataset.sn
    if (sn) {
      util.toPage("../orderDetail/orderDetail", { "sn": sn })
    }
  }
})