// pages/orderConfirm/orderConfirm.js
const util = require("../../utils/util.js")
const api = require("../../utils/net.js")
const wxUtils = require("../../utils/wxUtils.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goods: null,
    addressInfo: null,
    amountTotal: 0,
    invoiceInfo:null,
    invoiceIndex:null,
    isLoading: false,
    xToast: {
      show: false
    }
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
      if(toast.callBack) toast.callBack()
    }, 2000)
  },
  showLoading: function(show) {
    this.setData({
      isLoading: show
    })
  },
  chooseAddress: function() {
    let params = {
      mode: "select"
    }
    if (this.data.addressInfo) {
      params.checkedId = this.data.addressInfo.id
    }
    util.toPage('../address/address', params)
  },

  chooseInvoice:function(e){
    let index = e.currentTarget.dataset.index
    this.setData({ invoiceIndex:index})
    let item = this.data.goods[index]
    let params = {
      mode: "select",
      invoiceType:item.invoiceType
    }
    if (item.invoiceInfo) {
      params.checkedId = item.invoiceInfo.id
    }
    util.toPage('../invoice/invoice', params)
  },

  loadUserAddress: function () {
    this.showLoading(true)
    api.get("addressInfo", {
      limit: 100,
      offset: 0
    }, {
        onNext: res => {
         let _addressInfo =  res.rows.find(it => it.defaultFlag == 1)
         if(_addressInfo){
           _addressInfo.addressSummary = `${_addressInfo.province}${_addressInfo.city}${_addressInfo.district}${_addressInfo.address}`
           let mobile = _addressInfo.mobile
           if (mobile && mobile.length >= 11) {
             let middle = mobile.substr(3, 6)
             _addressInfo.phoneHidden = mobile.replace(middle, "******")
           }
           this.setData({
             addressInfo: _addressInfo,
           })
           getApp().globalData.addressInfo = _addressInfo
         }
         
        },
        onCompleted: () => {
          this.showLoading(false)
        }
      })
  },

  createOrder: function () {
    let addressInfo = this.data.addressInfo
    if (addressInfo) {

      let params = {
        address: addressInfo.address,
        city: addressInfo.city,
        consignee: addressInfo.consignee,
        country: "中国",
        district: addressInfo.district,
        province: addressInfo.province,
        payType: 1,
        remark: "",
        mobile: addressInfo.mobile,
        orderGoodsAddRequestEntityList: [],
        cartIds: []
      }

      this.data.goods.forEach(it => {
        if(it.cartId){
          params.cartIds.push(it.cartId)
        }
        
        params.orderGoodsAddRequestEntityList.push({
          goodsNumber: it.goodsNumber,
          productId: it.productId,
          shopId: it.shopId||getApp().globalData.userInfo.shopId,
          goodsSpecificationNameValue: it.specsAry.join(';'),
          invoiceInfoAddRequestEntity:it.invoiceInfo||null
        })
      })


      this.showLoading(true)

      api.post('orderInfo', params, {
        onNext: (res) => {
          if (res) {
            wxUtils.goodsPay(res, (msg) => {
              this.showXToast({ title: msg ? msg : "支付成功", icon: msg ? 'no' : 'yes', callBack: () => {if (!msg) this.toToBeReceivedPage()} }, )
              
            })
          }
        },
        onError: (msg, code) => {
          if ("600" == code) {
            wx.showModal({
              title: '提醒',
              content: msg,
              showCancel: false,
              confirmText: "知道了",
              confirmColor: "#fe5a5d"
            })
          } else if ('602' != code) {
            this.showXToast({
              title: msg,
              icon: 'no'
            })
          }
        },
        onCompleted:()=> this.showLoading(false)
      })

    } else {
      this.showXToast({ title: '请添加收货地址', icon: 'location' })
    }

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    let extras = JSON.parse(options.extras)
    if (extras) {
      util.decodeQueryParams(extras)
      let amountTotal = 0
      extras.forEach(it => {
        amountTotal += it.goodsNumber * parseFloat(it.price)
        it.specsAry = it.specsAry.split(",")
        it.specs = it.specsAry.join(" | ")
      })
      this.setData({
        goods: extras,
        amountTotal: amountTotal.toFixed(2)
      })
    }

    let _addressInfo = getApp().globalData.addressInfo
    if (_addressInfo){
      this.setData({ addressInfo: _addressInfo})
    }else{
      this.loadUserAddress()
    }
  },

  toToBeReceivedPage:function(){
    
    // util.toPage('../personal/toBeReceived/toBeReceived',{})
    wx.redirectTo({
      url:'../personal/toBeReceived/toBeReceived'
    })
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
    if (this.data.invoiceInfo){
      this.data.goods[this.data.invoiceIndex].invoiceInfo = this.data.invoiceInfo
      this.setData({ goods: this.data.goods, invoiceIndex: null, invoiceInfo:null})
    }
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

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})