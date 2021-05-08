// pages/address/address.js
const wxUtil = require("../../utils/wxUtils.js")
const api = require("../../utils/net.js")
const utils = require("../../utils/util")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    mode: "",
    hasAddress: false,
    addressList: null,
    showChecked: true,
    checkedId: null,
    showDelIcon: false,
    isLoading: false,
    choosingAddressFromWx: false,
    accepts: ["收货时间不限", "周六日/节假日收货", "周一至周五收货"],
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
    }, 2000)
  },
  showLoading: function(show) {
    this.setData({
      isLoading: show
    })
  },
  preventPop: function(e) {

  },
  onSelectedResult: function(address) {
    let pages = getCurrentPages();
    let targetPage = pages[pages.length - 2];
    targetPage.setData({
      addressInfo: address
    })
    wx.navigateBack()
  },
  onAddressSelect: function(e) {
    if (this.data.mode != "select") return
    let index = e.currentTarget.dataset.index
    let address = this.data.addressList[index]
    if (address) {
      this.onSelectedResult(address)
    }
  },
  handleItemCheckedChange: function(e) {
    let index = e.currentTarget.dataset.index
    let addressId = this.data.addressList[index].id
    this.setData({
      checkedId: addressId
    })
    if ("select" == this.data.mode) {
      this.onSelectedResult(this.data.addressList[index])
    } else {
      this.setAddressDefault(this.data.addressList[index])
    }
  },
  setAddressDefault: function(address) {
    address.defaultFlag = 1
    this.data.addressList.filter(it => it.id != address.id).map(it => it.defaultFlag = 0)
    this.showLoading(true)
    api.put('addressInfo', address, {
      onNext: res => {
        this.showXToast({
          title: "已将该地址设为默认",
          icon: 'yes'
        })
        getApp().globalData.addressInfo = address
      },
      onCompleted: () => this.showLoading(false)
    })
  },
  editAddress: function(e) {
    let params = this.data.addressList[e.target.dataset.address_index]
    params.mode = "edit"
    utils.toPage('../address_add/address_add', params)
  },
  toAddAddress: function() {
    wx.navigateTo({
      url: '../address_add/address_add',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    if ("select" == options.mode) { //选择地址的模式
      this.setData({
        mode: "select",
        showChecked: true,
        checkedId: options.checkedId
      })
    }
  },

  loadUserAddress: function() {
    this.showLoading(true)
    api.get("addressInfo", {
      limit: 100,
      offset: 0
    }, {
      onNext: res => {
        res.rows.forEach(it => {
          it.accept = this.data.accepts[it.timeType] || this.data.accepts[0]
          it.addressSummary = `${it.province}${it.city}${it.district}${it.address}`
          it.phoneHidden = it.mobile
          if (it.mobile && it.mobile.length >= 11) {
            let middle = it.mobile.substr(3, 6)
            it.phoneHidden = it.mobile.replace(middle, "******")
          }
        })
        let checkedId = this.data.checkedId
        if (this.data.mode != "select" && res.rows && res.rows.length > 0) {
          let defaultAddress = res.rows.find(it => it.defaultFlag == 1)
          if (defaultAddress) {
            checkedId = defaultAddress.id
            getApp().globalData.addressInfo = defaultAddress
          }
        }
        this.setData({
          checkedId: checkedId,
          addressList: res.rows,
          hasAddress: res.rows.length > 0,
          showDelIcon: res.rows.length > 1
        })
      },
      onCompleted: () => {
        this.showLoading(false)
      }
    })
  },

  showDelConfirmDialog: function(e) {
    let that = this
    wx.showModal({
      title: '删除地址',
      content: '确定删除该地址吗？',
      confirmColor: "#fe5a5d",
      success: res => {
        if (res.confirm) {
          let addressId = e.target.dataset.address_id
          that.delAddress(addressId)
        } else if (res.cancel) {

        }
      }
    })
  },

  delAddress: function(addressId) {
    this.showLoading(true)
    api.delete(`addressInfo/${parseInt(addressId)}`, null, {
      onNext: res => {
        this.showXToast({
          title: "地址删除成功",
          icon: 'yes'
        })
        this.loadUserAddress()
      },
      onCompleted: () => {
        this.showLoading(false)
      }
    })
  },

  useWxAddress: function() {
    let that = this
    wx.chooseAddress({
      success: function(res) {
        if (res.errMsg == "chooseAddress:ok") {

          that.addAddress({
            country: "中国",
            province: res.provinceName,
            city: res.cityName,
            district: res.countyName || "",
            address: res.detailInfo,
            timeType: 0,
            defaultFlag: 1,
            mobile: res.telNumber,
            consignee: res.userName
          })
        }
      },
      fail: function(res) {},
      complete: function(res) {},
    })
  },

  addAddress: function(params) {

    if (this.data.addressList) {
      let exsit = this.data.addressList.some(it => it.country == params.country &&
        it.province == params.province &&
        it.city == params.city &&
        it.district == params.district &&
        it.address == params.address &&
        it.timeType == params.timeType &&
        it.mobile == params.mobile &&
        it.consignee == params.consignee)

      if (exsit) {
        this.showXToast({
          title: "已经存在相同的地址信息",
          icon: 'warning'
        })
        return
      }
    }
    this.showLoading(true)
    api.post('addressInfo', params, {
      onNext: res => {
        this.showXToast({
          title: "地址导入成功",
          icon: 'yes'
        })
        this.loadUserAddress()
      },
      onCompleted: () => this.showLoading(false)
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
    this.loadUserAddress()
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