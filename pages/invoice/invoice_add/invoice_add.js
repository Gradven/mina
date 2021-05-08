// pages/address_add/address_add.js
const wxUtil = require("../../../utils/wxUtils.js")
const util = require("../../../utils/util.js")
const api = require("../../../utils/net.js")
const app = getApp()
let lastSaveTime = 0
Page({

  /**
   * 页面的初始数据
   */
  data: {
    invoiceId: null,
    invoiceTypes: ["普通发票", "专用发票"],
    invoiceTypesIndex: 0,
    invoiceType: "普通发票",
    titleTypes: ["个人", "企业"],
    titleTypesIndex: 0,
    titleType: "个人",
    address: "",
    mobileNumber: "",
    bankName: "",
    bankNo: "",
    taxNo: "",
    telephone: "",
    title: "",
    invoiceDetailAni: {},
    showMore:false,
    saveBtnAni: {},
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
    }, 1200)
  },
  showLoading: function(show) {
    this.setData({
      isLoading: show
    })
  },
  save: function(e) {
    if (Date.now() - lastSaveTime < 1000) {
      return
    }
    lastSaveTime = Date.now()

    let invoiceType = parseInt(this.data.invoiceTypesIndex) + 1
    let titleType = parseInt(this.data.titleTypesIndex) + 1

    let info = e.detail.value
    let title = info.title
    let taxNo = info.taxNo
    let bankName = info.bankName
    let bankNo = info.bankNo
    let address = info.address
    let telephone = info.telephone


    if (util.isEmptyStr(title)) {
      this.showXToast({
        title: "发票抬头不能为空",
        icon: 'no'
      })
      return
    }

    if (invoiceType == 2) { //专用发票，所有的信息都要填
      let msg = null
      if (util.isEmptyStr(taxNo)) {
        msg = "税号不能为空"
      } else if (util.isEmptyStr(bankName)) {
        msg = "开户银行不能为空"
      } else if (util.isEmptyStr(bankNo)) {
        msg = "银行帐号不能为空"
      } else if (util.isEmptyStr(address)) {
        msg = "企业地址不能为空"
      } else if (util.isEmptyStr(telephone)) {
        msg = "企业电话不能为空"
      }

      if (msg) {
        this.showXToast({
          title: msg,
          icon: 'no'
        })
        return
      }
    }

    this.showLoading(true)
    let params = {
      titleType: titleType,
      type: invoiceType,
      address: address,
      bankName: bankName,
      bankNo: bankNo,
      taxNo: taxNo,
      telephone: telephone,
      title: title,
    }
    let callBack = {
      onNext: res => {
        this.showXToast({
          title: `抬头${!!this.data.invoiceId ?'修改':'保存'}成功`,
          icon: 'yes'
        })
        setTimeout(() => wx.navigateBack(), 1200)
      },
      onCompleted: () => this.showLoading(false)
    }

    if (this.data.invoiceId) {
      params.id = parseInt(this.data.invoiceId) 
      api.put('invoiceInfo', params, callBack)
    } else {
      params.defaultFlag = 1,
      api.post('invoiceInfo', params, callBack)
    }



  },
  onInvoiceTypeChange: function(e) {
    let index = e.detail.value
    this.setData({
      invoiceType: this.data.invoiceTypes[index],
      invoiceTypesIndex: index
    })
  },

  onTitleTypeChange: function(e) {
    let index = e.detail.value
    let currentIndex = this.data.titleTypesIndex
    if (index != currentIndex) {
      this.makeInvoiceDetailAni(index == 1)

      if(index == 0){ //选择的是个人
        this.onInvoiceTypeChange({detail:{value:0}})
      } 
    }
    this.setData({
      titleType: this.data.titleTypes[index],
      titleTypesIndex: index
    })

  },

  onInputMobile: function(e) {
    // console.log(JSON.stringify(e))
    // this.validateTelephone(e.detail.value)
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    util.decodeQueryParams(options)

    if (options.mode) {
      wx.setNavigationBarTitle({
        title: '抬头修改'
      })

      let invoiceTypesIndex = parseInt(options.type) - 1
      let titleTypesIndex = parseInt(options.titleType) - 1
      this.setData({
        invoiceTypesIndex: invoiceTypesIndex,
        invoiceType: this.data.invoiceTypes[invoiceTypesIndex],
        titleTypesIndex: titleTypesIndex,
        titleType: this.data.titleTypes[titleTypesIndex],
        invoiceId: options.id,
        address: options.address || '',
        bankName: options.bankName || '',
        bankNo: options.bankNo || '',
        taxNo: options.taxNo || '',
        telephone: options.telephone || '',
        title: options.title,
      })
      if (titleTypesIndex == 1) {
        setTimeout(() => this.makeInvoiceDetailAni(true),500)
      }
    }


  },

  makeInvoiceDetailAni: function(enter = true) {
    
    setTimeout(()=>{
      this.setData({
        showMore: enter,
        invoiceDetailAni:{}
      })
    },enter?0:600)

    setTimeout(() => {
      var animation = wx.createAnimation({
        duration: 500,
        timingFunction: 'ease',
        transformOrigin: "50% 50%",
        delay:50
      })
      let translateX = util.rpx2px(enter ? -750 : 750)
      animation.translateX(translateX).step()
      this.setData({ invoiceDetailAni: animation.export() })
    }, enter?200:0)
    
   


    let btnAni = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease',
      transformOrigin: "50% 50%",
      delay: enter ? 0 : 200,
    })

    let translateY = util.rpx2px(enter ? 350 : 0)
    btnAni.translateY(translateY).step()
    this.setData({
      saveBtnAni: btnAni.export()
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