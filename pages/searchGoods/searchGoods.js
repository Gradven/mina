// pages/searchGoods/searchGoods.js
const app = getApp()
const api = require("../../utils/net.js")
const { $Toast } = require('../../dist/base/index')
const session = require("../../utils/session.js")
const util = require("../../utils/util.js")
const wxUtils = require("../../utils/wxUtils.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {

    isLoading: false,
    empty:false,

    total: 0,
    pageNo: 1,
    pageSize: 10,
    hasMore: true,
    loading: false,

    keywords: '',

    goodsInfoAll: [],

    userInfo: {},

    // 技术服务费相关
    showModel: false,
    modelBtnList: [
      {
        name: '先看看货'
      },
      {
        name: '立即缴纳',
        color: '#19be6b'
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    session.check((msg) => {
      if (msg) {
        $Toast({ content: msg, type: 'error' })
        return
      }
      this.setData({
        shopInfo: app.globalData.shopInfo,
        userInfo: app.globalData.userInfo
      })

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
    if (this.data.keywords) {
      this.getGoodsInfoAll(this.data.keywords)
    }
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
    this.getGoodsInfoAll();
  },
  /**
   * 开始搜索
   */
  onConfirm: function (e) {
    let keywords = e.detail.value
    this.setData({
      isLoading:true,
      keywords: keywords
    });
    this.getGoodsInfoAll(keywords)
  },
  inputSearch: function (e) {
    if (!e.detail.value) {
      this.setData({
        empty: false,
        total: 0,
        goodsInfoAll: [],
        hasMore: true
      })
    }
  },
  onSearchClear: function () {
    this.setData({
      empty: false,
      total: 0,
      goodsInfoAll: [],
      hasMore: true
    })
  },
  /**
   * 获取商品列表
   */
  getGoodsInfoAll: function (keywords) {
    if (keywords || (keywords == '')) {
      this.setData({
        pageNo: 1,
        hasMore: true
      })
    }
    if (!this.data.hasMore) {
      return;
    }
    let that = this;
    let pageNo = this.data.pageNo;
    let pageSize = this.data.pageSize;
    let offset = pageSize * (pageNo - 1);
    api.get("goodsInfo/all",
      {
        name: keywords,
        offset: offset,
        limit: pageSize
      }, {
        onNext: (res) => {
          let goodsInfoAll = res.rows;
          if (pageNo !== 1) {
            goodsInfoAll = that.data.goodsInfoAll.concat(goodsInfoAll);
          }
          let hasMore = false;
          if (goodsInfoAll.length < res.count) {
            hasMore = true;
          }
          that.setData({
            isLoading: false,
            empty:res.count == 0,
            total: res.count,
            goodsInfoAll: goodsInfoAll,
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
  /**
   * 技术服务费弹出框
   */
  handleModelClick: function (event) {
    let that = this;
    const index = event.detail.index;

    if (index === 0) {
      console.log('取消');
    } else if (index === 1) {
      api.post("orderShopService",
        {
          shopId: this.data.userInfo.shopId
        }, {
          onNext: (res) => {
            wx.requestPayment({
              'timeStamp': res.timeStamp,
              'nonceStr': res.nonceStr,
              'package': res.package,
              'signType': res.signType,
              'paySign': res.paySign,
              'success': function (res) {
                that.getShopInfoById(app.globalData.userInfo.shopId);
                app.globalData.userInfo.shopRightFlagFlag = 1;
                app.globalData.userInfo.isMember = true
                wx.showToast({
                  title: '支付成功',
                  icon: 'success',
                  duration: 2000
                })
              },
              'fail': function (res) {
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
    }

    this.setData({
      showModel: false
    });
  },
  setGoods: function (id) {
    let that = this;
    let goodsInfoAll = [];
    that.data.goodsInfoAll.forEach((item, index) => {
      if (item.id == id) {
        item.agentFlag = -1;
      }
      goodsInfoAll.push(item);
    });
    that.setData({
      goodsInfoAll: goodsInfoAll
    })

  },
  tapitem: function (event) {
    if (event.detail.type == 'toGoodsDetailPage') {
      let goodsId = event.detail.id;
      if (goodsId) {
        util.toPage("../goodsDetail/goodsDetail", { "shopId": this.data.shopId, "goodsId": goodsId })
      }
    } else if (event.detail.type == 'reOnSelf') {
      let detail = event.detail;
      this.reOnSelf(detail);
    } else if (event.detail.type == 'onSelf') {
      let detail = event.detail;
      this.onSelf(detail);
    } else if (event.detail.type == 'unSelf') {
      let detail = event.detail;
      this.unSelf(detail);
    }
  },
  /**
   * 再次代理
   */
  reOnSelf: function (detail) {
    if (this.data.shopInfo.payFeeFlag == 1) {
      let id = detail.id;
      let recommend = detail.recommend;
      if (id) {
        util.toPage('../goodsSlogan/slogan', {
          goodsId: id,
          recommend: recommend || '',
          httpType: 'put'
        })
      }
    } else {
      this.setData({
        showModel: true
      });
    }
  },
  /**
   * 代理
   */
  onSelf: function (detail) {
    if (this.data.shopInfo.payFeeFlag == 1) {
      let id = detail.id;
      let recommend = detail.recommend;
      if (id) {
        util.toPage('../goodsSlogan/slogan', {
          goodsId: id,
          recommend: recommend || '',
          httpType: 'post'
        })
      }
    } else {
      this.setData({
        showModel: true
      });
    }
  },
  /**
   * 取消
   */
  unSelf: function (detail) {
    if (this.data.shopInfo.payFeeFlag == 1) {
      let id = detail.id;
      let that = this;
      api.put("shopGoods",
        {
          goodsId: id,
          status: -1
        }, {
          onNext: (res) => {
            that.setGoods(id);
            wx.showToast({
              title: '取消代理成功',
              icon: 'success',
              duration: 2000
            })
            that.refreshShopTab()
          },
          onError: (msg, code) => {
            wx.showToast({
              title: msg,
              icon: 'none',
              duration: 2000
            })
          }
        });
    } else {
      this.setData({
        showModel: true
      });
    }
  },
  refreshShopTab: function () {
    getApp().globalData.refreshShopPage = true
  },
  /**
   * 进入店铺详情
   */
  toGoodsDetailPage: function (e) {
    let goodsId = e.currentTarget.dataset.id
    if (goodsId) {
      util.toPage("../goodsDetail/goodsDetail", { "shopId": this.data.shopId, "goodsId": goodsId })
    }
  },
})