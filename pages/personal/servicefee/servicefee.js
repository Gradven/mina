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
    shopInfo:{},
    expireTime:'',
    isLoading: true,
    noDate:false,

    total: 0,
    pageNo: 1,
    pageSize: 10,
    hasMore: true,
    loading: false,
    orderShopServiceList: [],
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
    this.setData({
      pageNo: 1
    });
    this.getShopInfo();
    this.getOrderShopService();
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
    this.getOrderShopService();
  },
  /**
     * 获取店铺信息
     */
  getShopInfo: function () {
    let that = this;
    let shopId = app.globalData.userInfo.shopId;
    if (!shopId) {
      return;
    }
    api.get("shopInfo/" + shopId, "", {
      onNext: (res) => {
        let expireTime = '';
        if (res.expireTime){
          expireTime = util.formatTime(new Date(res.expireTime))
        }
        that.setData({
          shopInfo: res,
          expireTime: expireTime
        })
      },
      onError: (msg, code) => {
        // $Toast({ content: msg, type: 'error' }); 
        wx.showToast({
          title: msg ? msg : `服务器异常，错误代码${code}`,
        })
      },
      onCompleted: () => {
        // that.setData({
        //   isLoading:false
        // })
      }
    })
  },
  getOrderShopService:function(){
    let that = this;
    if ((!this.data.hasMore && this.data.pageNo != 1) || this.data.loading) {
      return;
    }
    this.setData({
      loading: true,
      isLoading:true
    })
    let pageNo = this.data.pageNo;
    let pageSize = this.data.pageSize;
    let offset = pageSize * (pageNo - 1);
    api.get("orderShopService", {
      offset: offset,
      limit: pageSize
    }, {
        onNext: (res) => {
          let orderShopServiceList = that.data.orderShopServiceList;
          if (pageNo == 1) {
            orderShopServiceList = [];
          }
          res.rows.forEach(item => {
            item.createTime = util.formatTime(new Date(item.createTime));
            orderShopServiceList.push(item);
          });

          let hasMore = false;
          if (orderShopServiceList.length < res.count) {
            hasMore = true;
          }
          that.setData({
            noDate: res.count==0,
            total: res.count,
            orderShopServiceList: orderShopServiceList,
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
            loading: false,
            isLoading: false
          })
        }
      })
  },
  pay:function(){
    let that = this;
    api.post("orderShopService",
      {
        shopId: this.data.shopInfo.id
      }, {
        onNext: (res) => {
          wx.requestPayment({
            'timeStamp': res.timeStamp,
            'nonceStr': res.nonceStr,
            'package': res.package,
            'signType': res.signType,
            'paySign': res.paySign,
            'success': function (res) {
              that.setData({
                pageNo: 1
              });
              that.getShopInfo();
              that.getOrderShopService();
              app.globalData.userInfo.shopRightFlagFlag = 1;
              app.globalData.userInfo.isMember = true
              wx.showToast({
                title: '支付成功',
                icon: 'success',
                duration: 2000
              })
            },
            'fail': function (res) {
              that.setData({
                pageNo: 1
              });
              that.getShopInfo();
              that.getOrderShopService();
            }
          })
        },
        onError: (msg, code) => {
          wx.showToast({
            title: msg,
            icon: 'none',
            duration: 2000
          })
        }
      });
  },
})