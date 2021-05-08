// pages/shop/shop.js
const app = getApp()
const api = require("../../utils/net.js")
const util = require("../../utils/util.js")
const wxUtils = require("../../utils/wxUtils.js")
const {
  $Toast
} = require('../../dist/base/index')
const session = require("../../utils/session.js")
Page({
  /**
   * 页面的初始数据  
   */
  data: {
    shopInfoNameCount:0,
    shopInfoDescCount:0,

    showShare: false,
    shareData: null,
    goodsDataChanged: false,
    searchBarHeight: 100,
    imgUrl: '',
    tabIndicatorAnimation: {},
    tabIndicatorOffset: [0, 0, 0],
    rightFloatAni: {},
    rightActionShow: false,
    isReturnTopAniShowing: false,
    hasShop: false,
    isInMyShop: false,
    shopNameInput: '',
    shopDescInput: '',
    shopId: -1,
    currentTab: 'new',
    current_tab_scroll: 'new',
    topActionPosition: 'fixed',
    topActionShow: false,
    topActionAni: {},
    isHideLoadMore: true,
    isLoading: true,
    limited: 10,
    ascDesc: 1,
    shopInfo: null,
    visitors: null,
    visitorsCount: 0,
    categoryInfo: null,
    categoryIndex: -1,
    goods: {
      empty: false,
      emptyTop: 0,
      current: [],
      newArrival: null,
      sort: null,
      price: null,
      currentLoaded: false,
      newArrivalLoaded: false,
      sortLoaded: false,
      priceLoaded: false,
    },
    xToast: {
      show: false
    },
  },
  showXToast: function(toast) {
    toast.show = true
    this.setData({
      xToast: toast
    })
    let that = this
    setTimeout(() => {
      that.setData({
        ['xToast.show']: false
      })
      if (toast.callBack) {
        toast.callBack()
      }
    }, 2000)
  },
  editShopInfo: function(e) {
    let name = this.data.shopNameInput;
    let description = this.data.shopDescInput;
    this.setData({
      isEditShopInfo: true,
      imgUrl: this.data.shopInfo.logo,
      shopNameInput: this.data.shopInfo.name,
      shopDescInput: this.data.shopInfo.description,
      shopInfoNameCount: this.data.shopInfo.name.length,
      shopInfoDescCount: this.data.shopInfo.description.length
    })
  },
  closeEditShopInfo: function(e) {
    this.setData({
      isEditShopInfo: false
    })
  },
  bindShopNameInput: function(e) {
    this.setData({
      shopNameInput: e.detail.value,
      shopInfoNameCount: e.detail.value.length
    })
  },
  bindShopDescInput: function(e) {
    this.setData({
      shopDescInput: e.detail.value,
      shopInfoDescCount: e.detail.value.length
    })
  },
  saveShopInfo: function(e) {
    let that = this;
    let postData = {
      id: that.data.shopInfo.id
    }
    let name = this.data.shopNameInput;
    let description = this.data.shopDescInput;
    let logo = this.data.imgUrl;
    if (name) {
      postData.name = name;
    }
    if (description) {
      postData.description = description;
    }
    if (logo) {
      postData.logo = logo;
    }
    api.put("shopInfo",
      postData, {
        onNext: (res) => {
          wx.setNavigationBarTitle({
            title: res.name || ''
          })
          app.globalData.shopInfo = res
          that.setData({
            isEditShopInfo: false,
            shopInfo: res
          })
          wx.showToast({
            title: "保存成功",
            icon: 'success',
            duration: 2000
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
  handleTabChange: function(e) {
    let lastTab = this.data.currentTab
    let targetTab = e.currentTarget.dataset.current
    this.setData({
      currentTab: targetTab
    });


    var animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease',
      transformOrigin: "50% 50%",
      delay: 0,
    })
    let count = 0;
    if (targetTab == "sort") {
      count = 1
    } else if (targetTab == "price") {
      count = 2
    }

    animation.translateX(this.data.tabIndicatorOffset[count]).step()
    this.setData({
      tabIndicatorAnimation: animation.export()
    })

    var targetData = null
    var dataLoaded = false

    if (targetTab == "new") {
      targetData = this.data.goods.newArrival
      dataLoaded = this.data.goods.newArrivalLoaded
    } else if (targetTab == "price") {
      if (lastTab == targetTab) {
        let orderBy = this.data.ascDesc == 1 ? 2 : 1
        this.setData({
          ascDesc: orderBy
        })
      } else {
        targetData = this.data.goods.price
        dataLoaded = this.data.goods.priceLoaded
      }
    } else if (targetTab == "sort") {
      targetData = this.data.goods.sort
      dataLoaded = this.data.goods.sortLoaded
    }
    if (targetData != null) {
      this.setData({
        ['goods.current']: targetData,
        ['goods.currentLoaded']: dataLoaded,
        isHideLoadMore: targetData.length == 0
      })
    } else {
      this.showLoading()
      this.loadGoods(true)
    }

  },
  hideLoading: function() {
    if (this.data.isLoading)
      this.setData({
        isLoading: false
      })
  },
  showLoading: function() {
    if (!this.data.isLoading)
      this.setData({
        isLoading: true
      })
  },
  loadGoods: function(refresh) {

    var that = this;
    let currentTab = this.data.currentTab

    var goodsOrderType = 1
    let loaded = this.data.goods.newArrivalLoaded
    if ("price" == currentTab) {
      goodsOrderType = 2;
      loaded = this.data.goods.priceLoaded
    } else if ("sort" == currentTab) {
      goodsOrderType = 3
      loaded = this.data.goods.sortLoaded
    }

    if (!refresh && loaded) return

    let offset = refresh ? 0 : this.data.goods.current.length

    if ("sort" == currentTab) {
      if (refresh) {
        this.setData({
          categoryInfo: null,
          categoryIndex: -1
        })
      }
      this.loadGoodsByCategory(refresh)
    } else {

      api.get("shopGoods", {
        "shopId": this.data.shopId,
        "goodsOrderType": goodsOrderType,
        "ascDesc": this.data.ascDesc,
        "limit": this.data.limited,
        "offset": offset
      }, {
        onNext: (res) => {
          var resultData = res.rows
          that.updateGoodsData(currentTab, resultData, refresh)
          if (refresh) {
            that.floatTopAction()
            wx.stopPullDownRefresh()
          }
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
    }
  },
  updateGoodsData: function(currentTab, resultData, refresh = false) {

    var dataLoaded = resultData.length == 0 || resultData.length % this.data.limited != 0 //是否加载完

    if (currentTab == "new") {
      if (this.data.goods.newArrival != null && !refresh) {
        resultData = this.data.goods.newArrival.concat(resultData)
      }
      this.setData({
        ['goods.newArrival']: resultData,
        ['goods.newArrivalLoaded']: dataLoaded
      })
    } else if (currentTab == "sort") {
      if (this.data.goods.sort != null && !refresh) {
        resultData = this.data.goods.sort.concat(resultData)
      }
      dataLoaded = this.data.categoryInfo.every(it => it.loaded)
      this.setData({
        ['goods.sort']: resultData,
        ['goods.sortLoaded']: dataLoaded
      })
    } else {
      if (this.data.goods.price != null && !refresh) {
        resultData = this.data.goods.price.concat(resultData)
      }
      this.setData({
        ['goods.price']: resultData,
        ['goods.priceLoaded']: dataLoaded
      })
    }

    resultData.forEach((item) => {
      if (item.goodsInfo) {
        item.goodsInfo.picUrl = JSON.parse(item.goodsInfo.picUrls)[0]
        item.goodsInfo.likeFlag = item.goodsInfo.likeFlag ? item.goodsInfo.likeFlag : 0
        let saleStatusTitle = item.goodsInfo.onSaleFlag == 0 ? '已下架' : item.goodsInfo.storeNumber == 0 ? '已售完' : null
        item.saleStatusTitle = saleStatusTitle

      }

    })

    this.setData({
      ['goods.current']: resultData,
      ['goods.currentLoaded']: dataLoaded,
      ['goods.empty']: resultData != null && resultData.length == 0
    })

    // if (resultData != null && resultData.length != 0) {
    //   this.setData({ isHideLoadMore: false })
    // }
    this.setData({
      isHideLoadMore: resultData == null || resultData.length == 0,
      goodsDataChanged: false
    })
    app.globalData.refreshShopPage = false
  },
  clearShopData: function() {
    this.setData({
      visitors: null,
      isInMyShop: false,
      topActionShow: false,
      rightActionShow: false,
      shopId: -1,
      currentTab: 'new',
      current_tab_scroll: 'new',
      topActionPosition: 'fixed',
      isHideLoadMore: true,
      isLoading: true,
      shopInfo: null,
      categoryInfo: null,
      categoryIndex: -1,
      ['goods.newArrival']: null,
      ['goods.sort']: null,
      ['goods.price']: null,
      ['goods.current']: [],
      ['goods.currentLoaded']: false,
      ['goods.newArrivalLoaded']: false,
      ['goods.sortLoaded']: false,
      ['goods.priceLoaded']: false,
      ['goods.empty']: false,
      xToast: {
        show: false
      }
    })
  },
  floatTopAction: function() {
    if (this.data.topActionPosition == "unset") {
      this.setData({
        topActionPosition: "fixed"
      })
    }
  },
  updateFloatingAction: function(e) {
    let distance = e.scrollTop
    let show = distance > this.data.searchBarHeight

    if (this.data.topActionShow != show) {
      this.setData({
        topActionShow: show
      })
      this.makeTopFloatingAni(show)
    }
    let _rightShow = distance > this.data.searchBarHeight * 10
    if (this.data.rightActionShow != _rightShow && !this.data.isReturnTopAniShowing) {
      this.setData({
        rightActionShow: _rightShow
      })
      this.makeRightFloatingAni(_rightShow)
    }

    // this.floatTopAction()
  },

  loadShopInfo: function(refresh) {
    let that = this
    api.get("shopInfo/" + this.data.shopId, "", {
      onNext: (res) => {
        wx.setNavigationBarTitle({
          title: res.name || ''
        })
        app.globalData.shopInfo = res
        app.globalData.shopId = res.id
        let _isInMyShop = !!app.globalData.shopId && app.globalData.userInfo.shopId == app.globalData.shopId
        that.setData({
          shopInfo: res,
          isInMyShop: _isInMyShop
        })
        if (refresh) that.stopRefresh()
      },
      onError: (msg, code) => {
        // $Toast({ content: msg, type: 'error' }); 
        wx.showToast({
          title: msg ? msg : `服务器异常，错误代码${code}`,
        })
      }
    })
  },
  loadCategoryInfo: function() {
    if (this.data.categoryInfo == null) {
      api.get('shopGoodsCategory', {
        shopId: this.data.shopId
      }, {
        onNext: res => {
          if (res == null || res.length == 0) {
            this.hideLoading()
          } else {
            this.setData({
              categoryInfo: res
            })
            this.loadGoodsByCategory(true)
          }
        },
        onError: (msg, code) => {
          this.hideLoading()
        }
      })
    }
  },
  loadGoodsByCategory: function(refresh) {


    if (this.data.categoryInfo == null) {
      this.loadCategoryInfo()
    } else {
      let currentIndex = this.data.categoryInfo.findIndex(it => !it.loaded)
      if (currentIndex == -1) {
        return
      }
      let currentCategory = this.data.categoryInfo[currentIndex]
      let categoryId = currentCategory.categoryId
      let offset = currentCategory.offset || 0


      api.get(`shopGoods/${categoryId}`, {
        limit: 10,
        offset: offset,
        shopId: this.data.shopId
      }, {
        onNext: res => {
          let count = res.count
          let len = res.rows.length
          let loaded = len < 10
          currentCategory.count = count
          currentCategory.offset = offset += len
          currentCategory.loaded = loaded
          let _categoryInfo = this.data.categoryInfo
          _categoryInfo[currentIndex] = currentCategory
          this.setData({
            categoryInfo: _categoryInfo
          })
          let data = res.rows
          if (this.data.categoryIndex != currentIndex && data != null && data.length > 0) {
            let header = currentCategory.goodsCategory
            header.viewType = "header"
            data.unshift(header)
          } else {
            this.setData({
              categoryIndex: currentIndex
            })
          }
          this.updateGoodsData("sort", data, refresh)
          if (refresh) {
            this.floatTopAction()
            wx.stopPullDownRefresh()
          }
        },
        onCompleted: () => this.hideLoading()
      })
    }

  },
  asyncCartInfo: function() {

    api.get('cartInfo', {
      offset: 0,
      limit: 100
    }, {
      onNext: (res) => {
        let cartNum = res.rows.length
        app.globalData.cartNum = cartNum
        if (cartNum > 0) {
          wx.setTabBarBadge({
            index: 2,
            text: `${cartNum}`
          })
        } else {
          wx.removeTabBarBadge({
            index: 2
          })
        }
      }
    })
  },
  loadVisitors: function() {
    api.get(`shopInfo/${this.data.shopId}/visitors`, {
      limit: 8,
      offset: 0
    }, {
      onNext: res => this.setData({
        visitors: res.rows,
        visitorsCount: res.count
      })
    })
  },
  toGoodsDetailPage: function(e) {
    let goodsId = e.currentTarget.dataset.goods_id
    if (goodsId) {
      util.toPage("../goodsDetail/goodsDetail", {
        "shopId": this.data.shopId,
        "goodsId": goodsId
      })
    }
  },
  toSearchPage: function() {
    util.toPage("../search/search", {
      "shopId": this.data.shopId,
      "shopName": this.data.shopInfo.name
    })
  },
  toVisitHistoryPage: function() {
    util.toPage("../shopVisitHistory/shopVisitHistory", {
      mode: "shopVisit",
      "shopId": this.data.shopId,
    })
  },

  toMyVisitPage: function() {
    util.toPage("../shopVisitHistory/shopVisitHistory", {
      mode: "myVisit"
    })
  },
  onGoToMarketTap: function() {
    wx.switchTab({
      url: '../market/market',
    })
  },

  stopRefresh: function() {
    this.floatTopAction()
    wx.stopPullDownRefresh()
  },
  onCloseSharePopup: function(e) { //引入分享组件的Page,一定要实现这个方法，否则popup只能显示一次
    this.setData({
      showShare: false
    })
  },
  handleShareEvent: function(e) {
    let shareType = e.currentTarget.dataset.share_type
    let _shareData = null
    if ('shop' == shareType) {
      _shareData = []
      let goods = this.data.goods.newArrival
      if (goods.length > 0) {
        _shareData.push(goods[0].goodsInfo)
      }
      if (goods.length > 1) {
        _shareData.push(goods[1].goodsInfo)
      }
      if (_shareData.length == 0) {
        this.showXToast({
          title: '店铺还未代理任何产品',
          icon: 'no'
        })
        return
      }
    } else {
      _shareData = e.currentTarget.dataset.goods_info.goodsInfo || null
    }

    this.setData({
      showShare: true,
      shareData: _shareData
    })
  },

  preventPopup: function(e) {
    console.log(`preventPopup ${JSON.stringify(e)}`)
  },
  showPraiseAni: function(e) {

    let index = e.currentTarget.dataset.index
    let goods = this.data.goods.current[index]
    let likeFlag = goods.goodsInfo.likeFlag
    if (!goods.showPraiseAni && (likeFlag == 0 || !likeFlag)) {
      goods.showPraiseAni = true
      let praiseCount = goods.goodsInfo.likeCount || 0
      goods.goodsInfo.likeCount = praiseCount + 1
      this.setData({
        ['goods.current']: this.data.goods.current
      })
      this.sendPraise(goods.goodsInfo.id)
    }
  },
  sendPraise: function(id) {
    api.post('goodsLike', {
      goodsId: id
    }, {
      onNext: () => {

      }
    })
  },
  makeRightFloatingAni: function(enter = true) {
    var animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease',
      transformOrigin: "50% 50%",
      delay: 0,
    })
    let translateX = util.rpx2px(enter ? -140 : 140)
    animation.translateX(translateX).step()
    this.setData({
      rightFloatAni: animation.export()
    })
  },
  makeTopFloatingAni: function(enter = true) {
    var animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease',
      transformOrigin: "50% 50%",
      delay: 0,
    })
    let translateX = util.rpx2px(enter ? 110 : -110)
    animation.translateY(translateX).step()
    this.setData({
      topActionAni: animation.export()
    })
  },
  quickReturnTop: function() {
    this.setData({
      isReturnTopAniShowing: true
    })
    this.makeRightFloatingAni(false)
    this.makeTopFloatingAni(false)
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    })
    setTimeout(() => {
      this.setData({
        isReturnTopAniShowing: false
      })
    }, 400)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    let shopId = options.shopId
    if (!shopId && options.scene) {
      let scene = decodeURIComponent(options.scene).split("_")
      shopId = scene[0]
    }

    if (shopId) {
      app.globalData.shopId = shopId
    }

    let that = this
    wx.getSystemInfo({
      success: (data) => {
        this.setData({
          screenWidth: data.screenWidth,
          screenHeight: data.screenHeight
        })
      }
    })

    let tabWidth = app.globalData.windowWidth / 3
    let offsetToPrice = tabWidth * 2 - (20 * app.globalData.windowWidth / 750)
    let emptyTop = util.verticalDistance([106, 260, 120, 84, 100], 300)
    let searchBarHeight = util.rpx2px(110)
    this.setData({
      searchBarHeight: searchBarHeight,
      ["goods.emptyTop"]: emptyTop,
      tabIndicatorOffset: [0, tabWidth, offsetToPrice]
    })
    this.asyncCartInfo()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

    session.check((msg) => {
      if (msg) {
        this.showXToast({
          title: msg,
          icon: 'no'
        })
        return
      }

      if (app.globalData.userInfo.shopId) {
        wx.setTabBarItem({
          index: 1,
          text: '选货市场'
        })
      }

      let shopId = app.globalData.shopId ? app.globalData.shopId : app.globalData.userInfo.shopId //说明需要跳转

      if (!shopId) { //没有自己的店铺
        this.hideLoading()
        this.showXToast({
          title: '没找到对应店铺ID',
          icon: 'no'
        })
        return
      }


      if (this.data.shopInfo != null && this.data.shopInfo.id != shopId) { //店铺信息为空，或者需要跳转到其它的店铺
        this.clearShopData()
        this.makeRightFloatingAni(false)
        this.makeTopFloatingAni(false)
      }

      this.setData({
        hasShop: !!app.globalData.userInfo.shopId,
        isInMyShop: !!app.globalData.userInfo.shopId && app.globalData.userInfo.shopId == app.globalData.shopId,
        shopId: shopId
      })
      if (this.data.shopInfo == null) this.loadShopInfo()

      if (this.data.goods.newArrival == null || this.data.goodsDataChanged || getApp().globalData.refreshShopPage) {
        this.showLoading(true)
        this.loadGoods(true)
      }

      if (this.data.visitors == null) this.loadVisitors()

      wxUtils.updateCartTabBarBadge()
    })
  },

  backToMyShop: function() {
    let _shopId = app.globalData.userInfo.shopId
    if (_shopId) {
      app.globalData.shopId = _shopId
      this.showLoading()
      this.onShow()
    }
  },

  onItemActionClick: function(e) {
    let datas = e.currentTarget.dataset
    let actionName = datas.name
    if ('edit' == actionName) {
      let _goodsInfo = this.data.goods.newArrival[datas.goods_index]
      util.toPage('../goodsSlogan/slogan', {
        goodsId: _goodsInfo.goodsId,
        recommend: _goodsInfo.recommend,
        editMode: true
      })
    } else if ("del" == actionName) {
      let that = this
      wx.showModal({
        title: '取消代理',
        content: '确定取消该商品的代理？',
        confirmColor: "#fe5a5d",
        success: res => {
          if (res.confirm) {
            that.cancelGoodsAgency(datas.goods_id)
          }
        }
      })
    } else if ("share" == actionName) {

    }

  },

  cancelGoodsAgency: function(goodsId) {
    this.showLoading(true)
    api.put('shopGoods', {
      goodsId: goodsId,
      status: -1
    }, {
      onNext: res => {
        this.showXToast({
          title: "已取消该商品的代理",
          icon: 'yes',
          callBack: () => {
            this.showLoading(true)
            this.loadGoods(true)
          }
        })
      },
      onCompleted: () => {
        this.showLoading(false)
      }

    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  onPageScroll: function(e) {
    this.updateFloatingAction(e)
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.setData({
      topActionPosition: 'unset'
    })
    this.loadShopInfo(true)
    this.loadGoods(true)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    this.loadGoods(false)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(e) {

    if (e && e.target) {
      let shareData = e.target.dataset.share
      let shareType = e.target.dataset.share_type
      if (shareType == 'goodsDetail') {
        return {
          title: shareData.name,
          path: `pages/goodsDetail/goodsDetail?shopId=${this.data.shopId}&goodsId=${shareData.id}&userId=${app.globalData.userInfo.id}`,
          imageUrl: shareData.picUrl
        }
      }
    }

    return {
      title: "快来我的店看看吧",
      path: "pages/shop/shop?shopId=" + this.data.shopId,
      imageUrl: this.data.shopInfo.logo
    }
  },
  scrollToTop: function(e) {

  },
  scrollToBootom: function(e) {

  },
  onTouchStart: function(e) {
    var touchPoint = e.touches[0];
    startY = touchPoint.clientY
    console.log("~~~~onTouchStart~~" + startY)
  },
  onTouchEnd: function(e) {
    var upPoint = e.changedTouches[0];
    var endY = upPoint.clientY
    let deltaY = endY - startY
    if (deltaY > 0) {
      console.log("~~~~下拉~~" + endY)
      // wx.startPullDownRefresh()
    } else if (deltaY > 0) {
      console.log("~~~~上拉~~" + endY)
    }

  },
  uploadBg: function() {
    let that = this;
    this.uploadIcon(function(imgUrl) {
      api.put('shopInfo', {
        id: that.data.shopInfo.id,
        backgroundUrl: imgUrl
      }, {
        onNext: (res) => {
          wx.setNavigationBarTitle({
            title: res.name || ''
          })
          app.globalData.shopInfo = res
          that.setData({
            shopInfo: res
          })
        }
      })
    });
  },
  uploadLogo: function() {
    let that = this;
    this.uploadIcon(function(imgUrl) {
      that.setData({
        imgUrl: imgUrl
      });
    });
  },
  uploadIcon: function(callback) {
    let that = this;
    wx.chooseImage({
      count: 1,
      success: function(res) {
        wx.showLoading({
          title: '正在上传',
        })
        var tempFilePaths = res.tempFilePaths
        let filename = tempFilePaths[0];
        api.get("aliyun/oss/policies", "", {
          onNext: (res) => {
            var accessid = res.accessid;
            var policy = res.policy;
            var signature = res.signature;
            var dirname = res.dir;
            var host = res.host;

            var suffix = '';
            var filePath = '';

            function random_string(len) {
              len = len || 32;
              var chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz0123456789';
              var maxPos = chars.length;
              var pwd = '';
              for (var i = 0; i < len; i++) {
                pwd += chars.charAt(Math.floor(Math.random() * maxPos));
              }
              return pwd;
            }

            function get_suffix(filename) {
              var pos = filename.lastIndexOf('.');
              var suffix = '';
              if (pos != -1) {
                suffix = filename.substring(pos);
              }
              return suffix;
            }

            if (filename != '') {
              suffix = get_suffix(filename);
              filePath = dirname + random_string(32) + suffix;
            }
            // let host = 'https://xiaomaimai-test.oss-cn-hangzhou.aliyuncs.com';
            wx.uploadFile({
              url: host, //仅为示例，非真实的接口地址
              filePath: tempFilePaths[0],
              name: 'file',
              formData: {
                'key': filePath,
                'policy': policy,
                'OSSAccessKeyId': accessid,
                'success_action_status': '200', //让服务端返回200,不然，默认会返回204
                'signature': signature,
              },
              success: function(res) {
                callback(host + "/" + filePath);
                wx.hideToast();
                wx.showToast({
                  title: '上传成功',
                  icon: 'success',
                  duration: 2000
                })
              },
              fail: function(res) {
                wx.showToast({
                  title: JSON.stringify(res),
                  icon: 'none',
                  duration: 2000
                })
              }
            })
          },
          onError: (msg, code) => {
            wx.hideToast()
            wx.showToast({
              title: msg ? msg : `服务器异常，错误代码${code}`,
            })
          }
        })
      }
    })
  },
})