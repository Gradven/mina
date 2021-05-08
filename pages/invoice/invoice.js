const wxUtil = require("../../utils/wxUtils.js")
const api = require("../../utils/net.js")
const utils = require("../../utils/util")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    mode: "",
    hasInvoice: false,
    invoiceList: null,
    invoiceType:null,
    showChecked: true,
    checkedId: null,
    showDelIcon: false,
    choosingInvoiceFromWx: false,
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
      if (toast.callBack) toast.callBack()
    }, 2000)
  },
  showLoading: function(show) {
    this.setData({
      isLoading: show
    })
  },
  preventPop: function(e) {

  },
  onSelectedResult: function(invoice) {
    let pages = getCurrentPages();
    let targetPage = pages[pages.length - 2];
    targetPage.setData({
      invoiceInfo: invoice
    })
    wx.navigateBack()
  },
  onInvoiceSelect: function(e) {
    if (this.data.mode != "select") return
    let index = e.currentTarget.dataset.index
    let invoice = this.data.invoiceList[index]
    if (this.data.supportTypes.some(it => it == invoice.type)) {
      this.onSelectedResult(invoice)
    } else {
      this.showXToast({ title: '该商品不支持开具体此类型的发票', icon: 'no' })
    }
  },
  handleItemCheckedChange: function(e) {
    let index = e.currentTarget.dataset.index
    let invoiceId = this.data.invoiceList[index].id
    this.setData({
      checkedId: invoiceId
    })
    if ("select" == this.data.mode) {
      let invoice = this.data.invoiceList[index]
      if (this.data.supportTypes.some(it => it == invoice.type)){
        this.onSelectedResult(invoice)
      }else{
        this.showXToast({ title: '该商品不支持开具体此类型的发票', icon: 'no' })
      }
    } else {
      this.setInvoiceDefault(this.data.invoiceList[index])
    }
  },
  setInvoiceDefault: function(invoice) {
    invoice.defaultFlag = 1
    this.showLoading(true)
    api.put('invoiceInfo', invoice, {
      onNext: res => {
        this.showXToast({
          title: "已将该抬头设为默认",
          icon: 'yes'
        })
        this.loadUserInvoice()
      },
      onCompleted: () => this.showLoading(false)
    })
  },
  editInvoice: function(e) {
    let params = this.data.invoiceList[e.target.dataset.invoice_index]
    params.mode = "edit"
    utils.toPage('./invoice_add/invoice_add', params)
  },
  addNewInvoice: function() {
    wx.navigateTo({
      url: './invoice_add/invoice_add',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    utils.decodeQueryParams(options)
    if ("select" == options.mode) { //选择地址的模式
      console.log(`invoice types ${JSON.stringify(options.invoiceType)}`)
      this.setData({
        mode: "select",
        showChecked: true,
        supportTypes: options.invoiceType ? options.invoiceType.split(','):null,
        checkedId: options.checkedId || null
      })
    }
  },

  loadUserInvoice: function() {
    this.showLoading(true)
    api.get("invoiceInfo", {
      limit: 100,
      offset: 0
    }, {
      onNext: res => {
        if (res.rows) {
          let invoiceType = new Map([
            [1, '普通发票'],
            [2, '专用发票']
          ])
          res.rows.forEach(it => {
            it.invoiceType = invoiceType.get(it.type) || invoiceType.get(1)
          })
          if (this.data.mode != "select") { //如果不是选择模式
            res.rows.filter(it => it.defaultFlag == 1).map(it => it.checked = true)
          } else {
            if (this.data.checkedId){
              res.rows.filter(it => it.id == this.data.checkedId).map(it => it.checked = true)
            }
            if (this.data.supportTypes){ //有传入支持的类型
              res.rows.forEach(it =>{
                it.disable = !this.data.supportTypes.some(support => support == it.type)
              })
            }
          }
        }
        this.setData({
          invoiceList: res.rows,
          hasInvoice: res.rows.length > 0,
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
      title: '删除抬头',
      content: '确定删除该抬头吗？',
      confirmColor: '#fe5a5d',
      success: res => {
        if (res.confirm) {
          let invoiceId = e.target.dataset.invoice_id
          that.delInvoice(invoiceId)
        } else if (res.cancel) {

        }
      }
    })
  },

  delInvoice: function(InvoiceId) {
    this.showLoading(true)
    api.delete(`invoiceInfo/${parseInt(InvoiceId)}`, null, {
      onNext: res => {
        this.showXToast({
          title: "抬头删除成功",
          icon: 'yes',
          callBack: () => this.loadUserInvoice()
        }, )

      },
      onCompleted: () => {
        this.showLoading(false)
      }
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
    this.loadUserInvoice()
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