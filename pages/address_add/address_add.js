// pages/address_add/address_add.js
const wxUtil = require("../../utils/wxUtils.js")
const util = require("../../utils/util.js")
const api = require("../../utils/net.js")
let lastSaveTime = 0
Page({

  /**
   * 页面的初始数据
   */
  data: {
    addressId: null,
    defaultFlag: null,
    accepts: ["收货时间不限", "周六日/节假日收货", "周一至周五收货"],
    acceptIndex: 0,
    accept: "收货时间不限",
    mobileNumber: "",
    name: "",
    detail: "",
    mobileTip: false,
    region: ['', '', ''],
    regionStr: "请选择",
    isLoading: false,
    xToast: { show: false }
  },
  showXToast: function (toast) {
    toast.show = true
    this.setData({ xToast: toast })
    let that = this
    setTimeout(() => {
      that.setData({ ['xToast.show']: false })
    }, 1200)
  },
  showLoading: function (show) {
    this.setData({ isLoading: show })
  },
  save: function (e) {
    if (Date.now() - lastSaveTime < 1000) {
      return
    }
    lastSaveTime = Date.now()
    let info = e.detail.value
    let name = info.name
    let mobile = info.mobile
    let detail = info.detail

    if (util.isEmptyStr(name)) {
      this.showXToast({ title: "收货人姓名不能为空", icon: 'no' })
      return
    }
    if (this.data.mobileTip || mobile.length != 11) {
      this.showXToast({ title: "请检查收货人手机号", icon: 'no' })
      return
    }
    if (util.isEmptyStr(detail)) {
      this.showXToast({ title: "详细地址不能为空", icon: 'no' })
      return
    }

    if (!this.data.region[0]) {
      this.showXToast({ title: "请选择所在地区", icon: 'no' })
      return
    }

    this.showLoading(true)
    let params = {
      country: "中国",
      province: this.data.region[0],
      city: this.data.region[1],
      district: this.data.region[2] || "",
      address: detail,
      timeType: this.data.acceptIndex,
      mobile: mobile,
      consignee: name
    }
    let callBack = {
      onNext: res => {
        this.showXToast({ title: `地址${this.data.addressId ?'修改':'保存'}成功`, icon: 'yes' })
        setTimeout(() => wx.navigateBack(), 1200)
      },
      onCompleted: () => this.showLoading(false)
    }
    if (this.data.addressId) { //修改
      params.id = this.data.addressId
      params.defaultFlag = this.data.defaultFlag
      api.put('addressInfo', params, callBack)
    } else {
      params.defaultFlag = 1
      api.post('addressInfo', params, callBack)
    }



  },
  bindAcceptChange: function (e) {
    let index = e.detail.value
    this.setData({ accept: this.data.accepts[index], acceptIndex: index })
  },
  bindRegionChange: function (e) {
    let _region = e.detail.value
    this.setData({
      regionStr: _region.join(" "),
      region: _region
    })
  },
  onInputMobile: function (e) {
    console.log(JSON.stringify(e))
    this.validateTelephone(e.detail.value)
  },
  validateTelephone(number) {
    let regPhone = /^1(3|4|5|7|8)\d{9}$/;
    let tip = false;
    if (!regPhone.test(number) && number.length > 7) {
      // 输入7位以上开始校验手机号码
      tip = true;
    }
    this.setData({ mobileTip: tip });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    util.decodeQueryParams(options)

    if (options.mode) {
      wx.setNavigationBarTitle({ title: '地址修改' })
      let region = [options.province, options.city, options.district]
      let _accept = this.data.accepts[options.timeType]
      this.setData({
        addressId: options.id,
        defaultFlag:options.defaultFlag,
        region: region,
        regionStr: region.join(" "),
        acceptIndex: options.timeType,
        accept: _accept,
        mobileNumber: options.mobile,
        name: options.consignee,
        detail: options.address
      })

    } else {
      wxUtil.getLocationInfo(it => {
        if (it.region) {
          this.setData({ region: it.region, regionStr: it.region.join(" ") })
        }
      })
    }


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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})