// pages/market/market.js
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
    goodsDataChanged:false,

    tabs:[
      {
        name:'每日心选',
        keyword:'page_select_goods_1'
      },
      {
        name: '高佣精选',
        keyword: 'page_select_goods_2'
      },
      {
        name: '红橱严选',
        keyword: 'page_select_goods_3'
      }
    ],

    activeIndex: 0,
    lastShopList: [],
    marginLeft: 0,
    scrollLeft: 0,
    screenWidth: 0,
    screenHeight: 0,

    isLoading: false,

    total: 0,
    pageNo: 1,
    pageSize: 10,
    hasMore: true,
    loading: false,

    keywords: '',
    recommendList: [],

    goodsCategory:{},
    pageSelectGoods_1: [],
    pageSelectGoods_2: [],
    pageSelectGoods_3: [],

    userInfo:{},

    // 技术服务费相关
    showModel:false,
    modelBtnList:[
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
    wx.getSystemInfo({
      success: (data) => {
        this.setData({
          scrollLeft : 110 / 750 * data.screenWidth,
          screenWidth: data.screenWidth,
          screenHeight: data.screenHeight
        })
      }
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
    wxUtils.updateCartTabBarBadge();
    this.setData({
      userInfo: app.globalData.userInfo
    })
    session.check((msg) => {
      if (msg) {
        $Toast({ content: msg, type: 'error' })
        return
      }
      if (app.globalData.userInfo.shopId) {
        this.getShopInfoById(app.globalData.userInfo.shopId);
        this.getGoodsCategory();
        this.getSelectGoods_1();
        this.getSelectGoods_2();
        this.getSelectGoods_3();
        this.setData({
          goodsDataChanged: false
        })
      } else {
        this.getLastShopList();
        this.getShopInfoList();
      }
    })
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
    if (app.globalData.userInfo.shopId) {
      
    }else{
      this.getShopInfoList();
    }
  },
  setIndex:function(e){
    let index = e.currentTarget.dataset.index || 0;
    let screenWidth = this.data.screenWidth;
    let scrollLeft = screenWidth / 3 * index + 110 / 750 * screenWidth;
    this.setData({
      scrollLeft: scrollLeft,
      activeIndex: index
    });
  },
  /**
   * 进入分类详情
   */
  toGoodsCategoryPage:function (e) {
    let id = e.currentTarget.dataset.id || 0;
    let name = e.currentTarget.dataset.name || '';
    let pIds = e.currentTarget.dataset.pids || 0;
    if (pIds.length > 7) {
      util.toPage("../categorySearch/categorySearch", { "id": id, "name": name });
    }else{
      util.toPage("../category/category", { "id": id });
    }
  },
  tapitem: function (event){
    if (event.detail.type == 'toGoodsDetailPage'){
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
   * 进入店铺详情
   */
  toGoodsDetailPage: function (e) {
    let goodsId = e.currentTarget.dataset.id
    if (goodsId) {
      util.toPage("../goodsDetail/goodsDetail", { "shopId": this.data.shopId, "goodsId": goodsId })
    }
  },
  /**
   * 获取商品分类列表
   */
  getGoodsCategory:function(){
    let that = this;
    let roleType = 1;
    if (app.globalData.userInfo.shopId) {
      roleType = 2;
    }
    api.get("pageFragment/page_select_category",{
        "roleType": roleType
      }, {
        onNext: (res) => {
          that.setData({
            goodsCategory: res
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
  setGoods:function(id){
    let that = this;
    let pageSelectGoods_1 = [];
    that.data.pageSelectGoods_1.forEach((item, index) => {
      if (item.id == id) {
        item.agentFlag = -1;
      }
      pageSelectGoods_1.push(item);
    });
    that.setData({
      pageSelectGoods_1: pageSelectGoods_1
    })
    let pageSelectGoods_2 = [];
    that.data.pageSelectGoods_2.forEach((item, index) => {
      if (item.id == id) {
        item.agentFlag = -1;
      }
      pageSelectGoods_2.push(item);
    });
    that.setData({
      pageSelectGoods_2: pageSelectGoods_2
    })
    let pageSelectGoods_3 = [];
    that.data.pageSelectGoods_3.forEach((item, index) => {
      if (item.id == id) {
        item.agentFlag = -1;
      }
      pageSelectGoods_3.push(item);
    });
    that.setData({
      pageSelectGoods_3: pageSelectGoods_3
    })
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
    if (this.data.shopInfo.payFeeFlag == 1){
      let id = detail.id;
      let recommend = detail.recommend;
      if (id) {
        util.toPage('../goodsSlogan/slogan', {
          goodsId: id,
          recommend: recommend || '',
          httpType:'post'
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
  /**
   * 根据id获取店铺信息
   */
  getShopInfoById: function (shopId){
    let that = this;
    api.get("shopInfo/" + shopId, "", {
      onNext: (res) => {
        // app.globalData.shopInfo = res;
        that.setData({
          shopInfo: res
        });
      },
      onError: (msg, code) => {
        // $Toast({ content: msg, type: 'error' }); 
        wx.showToast({
          title: msg ? msg : `服务器异常，错误代码${code}`,
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
  hideLoading: function () {
    if (this.data.isLoading)
      this.setData({ isLoading: false })
  },
  showLoading: function () {
    if (!this.data.isLoading)
      this.setData({ isLoading: true })
  },
  submitForm: function (e) {
    let that = this;
    let keywords = e.detail.value;
    this.setData({
      pageNo: 1,
      keywords: keywords,
      hasMore: true
    }, function () {
      that.getShopInfoList();
    })
  },
  searchShop: function () {
    wx.navigateTo({
      url: '../searchShop/searchShop'
    })
  },
  searchGoods: function () {
    wx.navigateTo({
      url: '../searchGoods/searchGoods'
    })
  },
  getShopInfoList: function () {
    var that = this;
    if (!this.data.hasMore || this.data.loading) {
      return;
    }
    this.setData({
      loading: true
    })
    let keywords = this.data.keywords;
    let pageNo = this.data.pageNo;
    let pageSize = this.data.pageSize;
    let offset = pageSize * (pageNo - 1);
    let roleType = 1;
    if (app.globalData.userInfo.shopId) {
      roleType = 2;
    }

    api.get("pageFragment/mina_home_recommend_shop", {
      "roleType": roleType
    }, {
        onNext: (res) => {
          that.setData({
            recommendList: res.objectList
          })
        },
        onError: (msg, code) => {
          $Toast({
            content: msg,
            type: 'error'
          });
        },
        onCompleted: () => {
          that.setData({
            loading: false
          })
        }
      })

  },
  getSelectGoods_1: function () {
    var that = this;
    let roleType = 1;
    if (app.globalData.userInfo.shopId) {
      roleType = 2;
    }

    api.get("pageFragment/page_select_goods_1", {
      "roleType": roleType
    }, {
        onNext: (res) => {
          let list = [];
          that.setData({
            pageSelectGoods_1: res.objectList
          })
        },
        onError: (msg, code) => {
          $Toast({
            content: msg,
            type: 'error'
          });
        },
        onCompleted: () => {
          that.setData({
            loading: false
          })
        }
      })

  },
  getSelectGoods_2: function () {
    var that = this;
    let roleType = 1;
    if (app.globalData.userInfo.shopId) {
      roleType = 2;
    }

    api.get("pageFragment/page_select_goods_2", {
      "roleType": roleType
    }, {
        onNext: (res) => {
          that.setData({
            pageSelectGoods_2: res.objectList
          })
        },
        onError: (msg, code) => {
          $Toast({
            content: msg,
            type: 'error'
          });
        },
        onCompleted: () => {
          that.setData({
            loading: false
          })
        }
      })

  },
  getSelectGoods_3: function () {
    var that = this;
    let roleType = 1;
    if (app.globalData.userInfo.shopId) {
      roleType = 2;
    }

    api.get("pageFragment/page_select_goods_3", {
      "roleType": roleType
    }, {
        onNext: (res) => {
          that.setData({
            pageSelectGoods_3: res.objectList
          })
        },
        onError: (msg, code) => {
          $Toast({
            content: msg,
            type: 'error'
          });
        },
        onCompleted: () => {
          that.setData({
            loading: false
          })
        }
      })

  },
  getLastShopList: function () {
    let that = this;
    api.get("shopVisit", {}, {
      onNext: (res) => {
        that.setData({
          lastShopList: res
        });
      },
      onError: (msg, code) => {
        $Toast({
          content: msg,
          type: 'error'
        });
      },
      onCompleted: () => {
        that.hideLoading()
      }
    })
  },
  chooseCatalog: function (e) {
    this.setData({
      activeIndex: e.currentTarget.dataset.index,
      swiperCurrent: 0
    })
    this.calcScrollLeft();
    this.scrollEndEvent(e.currentTarget.dataset.index)
  },
  scrollEndEvent: function (index) {

  },
  // 横滑同步距离计算
  calcScrollLeft: function () {
    if (this.data.activeIndex < 2) {
      this.setData({ scrollLeft: 0 });
    } else {
      var screenwidth = this.data.screenWidth;
      var currentLeft = (this.data.activeIndex - 2) * screenwidth / 5
      this.setData({
        scrollLeft: currentLeft
      });
    }
  },
  intoShop: function (e) {
    app.globalData.shopId = e.currentTarget.dataset.id;
    wx.switchTab({
      url: '../shop/shop'
    })
  },
  backToMyShop: function () {
    let _shopId = app.globalData.userInfo.shopId
    if (_shopId) {
      app.globalData.shopId = _shopId
      wx.switchTab({
        url: '../shop/shop'
      })
    }
  },
  refreshShopTab:function(){
    getApp().globalData.refreshShopPage = true
  },

})