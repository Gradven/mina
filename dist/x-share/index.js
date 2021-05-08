'use strict';
const wxUtils = require("../../utils/wxUtils.js")

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Component({
  behaviors: [],
  properties: {
    show: {
      type: Boolean,
      value: false,
      observer: 'onShowChanged'
    },
    shareData: {
      type: [Object, Array],
      value: {},
      observer: 'onShareDataChanged'
    },

  },
  data: {
    ctx: null,
    isTabPage: false,
    profit: null,
    isLoading: false,
    xToast: {
      show: false
    },
    showTimeLine: false,
    timeLineData: {},
    sharePicPath: null,
    shareType: null,
  },
  attached: function onAttached() {
    let pages = getCurrentPages()
    let page = pages[pages.length - 1]
    let route = page.__route__

    let _isTabPage = ['pages/shop/shop', 'pages/market/market', 'pages/cart/cart', 'pages/personal/personal'].some(it => it == route)
    this.setData({
      page: route,
      isTabPage: _isTabPage
    })
    this.showSharePopup(true)
  },
  methods: {
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
    showLoading: function(show) {
      this.setData({
        isLoading: show
      })
    },
    preventPopup: function preventPopup(e) {

    },
    handleShareCloseEvent: function(e) {
      let which = e.currentTarget.dataset.which
      if ('main' == which) {
        this.showSharePopup(false)
      } else if ('timeLine' == which) {
        this.showTimeLinePopup(false)
        this.showTabBar(true)
      }
      this.closePopup('main' == which)
    },
    closePopup: function(delay = true) {
      setTimeout(() => {
        this.triggerEvent('onCloseSharePopup');
      }, delay ? 400 : 0)
    },
    showTabBar: function(show = true) {
      if (!this.data.isTabPage) return

      if (show) {
        wx.showTabBar({
          animation: true
        })
      } else {
        wx.hideTabBar({
          animation: true
        })
      }
    },
    onShowChanged: function(newValue, oldValue) {

    },
    showTimeLinePopup: function(show = true) {
      this.setData({
        showTimeLine: show
      })
    },
    showSharePopup: function(show = true, autoShowTabBar = true) {
      let popupComponent = this.selectComponent('.popup_share')
      if (show) {
        if (this.data.isTabPage) {
          this.showTabBar(false)
        }
        setTimeout(() => {
          popupComponent && popupComponent.show()
        }, this.data.isTabPage ? 400 : 0)
      } else {
        popupComponent && popupComponent.hide()
        if (this.data.isTabPage && autoShowTabBar) {
          setTimeout(() => {
            this.showTabBar(true)
          }, 400)
        }
      }
    },
    onShareDataChanged: function(newValue, oldValue) {
      if (newValue) {
        let _goodsInfo = newValue
        let profit = ''
        let shareType = 'shop'
        if (_goodsInfo instanceof Array) {

        } else if (_goodsInfo instanceof Object) { //当分享的产品的时候，自动显示利润
          if (getApp().globalData.userInfo.isMember) {
            profit = _goodsInfo.profit
          }

          shareType = 'goodsDetail'
        }
        this.setData({
          profit: profit,
          shareType: shareType
        })
      }
    },
    onShareToFriendClicked: function() {
      this.showSharePopup(false)
      this.closePopup()
    },
    shareToTimeLine: function() {
      let app = getApp()
      let _shop = app.globalData.shopInfo
      this.showSharePopup(false, !_shop)
      if (!_shop) {
        this.showXToast({
          title: "店铺信息为空，请刷新后重试",
          icon: 'no'
        })
        this.closePopup()
        return
      }

      setTimeout(() => {

        if (this.data.shareData) {
          this.showLoading(true)
          let _goods = this.data.shareData
          let _page = 'pages/shop/shop'
          let _shareType = this.data.shareType
          if ('goodsDetail' == _shareType) {
            _goods = [this.data.shareData]
            _page = 'pages/goodsDetail/goodsDetail'
          }
          _goods.forEach(it => {           
            if ('goodsDetail' == _shareType) {
              let picUrls = it.picUrls instanceof Array ? it.picUrls : JSON.parse(it.picUrls)
              if (picUrls.length > 2) {
                picUrls.splice(2)
              }
              it.img = picUrls
            } else {
              it.img = it.cover
            }
            it.name = it.name
            it.price = it.retailPrice
          })
          let _shareImgs = null

          let _shareData = {
            shareType: _shareType,
            shareImgs: _shareImgs,
            imageHeight: app.globalData.windowHeight * 0.657,
            code: {
              page: _page,
              shopId: _shop.id,
              goodsId: _goods[0].id
            },
            shop: {
              name: _shop.name,
              img: _shop.logo,
              des: _shop.description || "不想多说什么"
            },
            goods: _goods
          }
          wxUtils.prepareShareData(_shareData, (msg, dataParsed) => {
            this.showLoading(false)

            if (msg) {

              this.showXToast({
                title: msg,
                icon: 'no',
                callBack: () => {
                  this.closePopup()
                  this.showTabBar(true)
                }
              })

            } else {
              this.setData({
                timeLineData: dataParsed
              })
              this.showTimeLinePopup(true)
            }
          })

        } else {
          this.closePopup()
          this.showXToast({
            title: "还未代理商品,请代理后重新分享",
            icon: 'no'
          })
        }
      }, 400)
    },
    onShareImgSave: function(e) { //draw方法执行完成之后，会自动保留成临时文件

      this.setData({
        sharePicPath: e.detail.imgPath
      })

    },
    saveShareImg: function() {

      let path = this.data.sharePicPath
      if (path) {
        let that = this
        wx.saveImageToPhotosAlbum({
          filePath: path,
          success: res => {
            this.showTimeLinePopup(false)
            that.showXToast({
              title: "成功保存至相册，快去分享吧",
              icon: 'yes',
              callBack: () => {
                that.closePopup()
                that.showTabBar(true)
              }
            })
          },
          fail: error => {
            let msg = "图片保存失败"
            if ("saveImageToPhotosAlbum:fail cancel" == error.errMsg) {
              msg = "图片保存被取消"
            }
            that.showXToast({
              title: msg,
              icon: 'no',
              callBack: () => {
                that.closePopup()
                that.showTabBar(true)
              }
            })
          },
        })
      }
    },

  }
});