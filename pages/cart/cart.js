// pages/cart/cart.js
const app = getApp()
const api = require("../../utils/net.js")
const util = require("../../utils/util.js")
const wxUtils = require("../../utils/wxUtils.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoading: true,
    shopInfo: null,
    location: null,
    addressInfo: null,
    choosingAddress: false,
    cartInfo: null,
    allSelected: true,
    amountTotal: 0.00,
    editMode: false,
    selectedCount: 0,
    cartEmptyTop: .1,
    xToast: { show: false }
  },
  showXToast: function (toast) {
    toast.show = true
    this.setData({ xToast: toast })
    let that = this
    setTimeout(() => {
      that.setData({ ['xToast.show']: false })
    }, 2000)
  },
  showLoading: function (show) {
    this.setData({ isLoading: show })
  },
  handleEditModeChanged: function () {
    let _editMode = !this.data.editMode
    this.setData({ editMode: _editMode })
    this.handleAllSelectedCheckedChange({ detail: { current: !_editMode } })
  },
  handleSettleClicked: function () {
    if (this.data.selectedCount > 0) {
      if (this.data.editMode) { //删除操作  
        this.showDelConfirmDialog()
      } else {
        this.showSettleDialog(true)
      }
    }
  },
  showDelConfirmDialog: function () {
    let that = this
    wx.showModal({
      title: '删除确认',
      content: '确定删除所选商品？',
      confirmColor: "#fe5a5d",
      success: res => {
        if (res.confirm) {
          that.sendCartDel()
        } else if (res.cancel) {

        }
      }
    })
  },
  sendCartDel: function () {
    let ids = []
    this.data.cartInfo.filter(it => it.checked).forEach(it => { ids.push(`ids=${it.id}`) })
    api.delete(`cartInfo/batch?${ids.join('&')}`, null, {
      onNext: res => {
        this.loadCartInfo(true)
        this.showXToast({ title: "所选商品成功移出", icon: 'yes' })
      }
    })
  },
  handleItemCheckedChange: function (e) {
    let checked = e.detail.current;
    let index = e.currentTarget.dataset.index
    this.data.cartInfo[index].checked = checked
    this.setData({ cartInfo: this.data.cartInfo })
    this.updateTotalAmount()
  },
  handleAllSelectedCheckedChange: function ({ detail = {} }) {
    let checked = detail.current;
    this.setData({ allSelected: checked })
    let _cartInfo = this.data.cartInfo
    _cartInfo.forEach(it => it.checked = checked)
    this.setData({ cartInfo: _cartInfo })
    this.updateTotalAmount()
  },
  updateTotalAmount: function () {
    let sum = 0
    let selectedCount = 0
    this.data.cartInfo.filter(it => it.checked).forEach(it => {
      sum += it.goodsNumber * parseFloat(it.productInfo.retailPrice)
      selectedCount++
    })
    this.setData({ amountTotal: sum.toFixed(2), selectedCount: selectedCount })

    if (selectedCount == 0 && this.data.allSelected) {
      this.setData({ allSelected: false })
    }
  },
  handleItemQuantityChange: function (e) {
    let index = e.target.dataset.index
    let _cartInfo = this.data.cartInfo;
    let goodsNumber = e.detail.value || 1
    _cartInfo[index].goodsNumber = goodsNumber
    this.setData({ cartInfo: _cartInfo })
    this.updateCartGoodsNumber(_cartInfo[index])
    this.updateTotalAmount()
  },
  updateCartGoodsNumber:function(cartInfo){
    api.put('cartInfo', { id: cartInfo.id, goodsNumber: cartInfo.goodsNumber},{
      onNext:res=>{
      },
      onError:(msg,code)=>{
      }
    })
  },
  loadCartInfo: function (refresh) {
    this.showLoading(true)
    let offset = refresh ? 0 : this.data.cartInfo ? this.data.cartInfo.length : 0
    let that = this
    api.get('cartInfo', { offset: offset, limit: 100 }, {
      onNext: (res) => {
        res.rows.forEach(it => {
          it.checked = true
          it.specs = it.productInfo.goodsSpecificationNames.join(" | ")
          it.img = it.goodsInfo.cover
          // it.img = JSON.parse(it.goodsInfo.picUrls)[0]
        })
        that.setData({ cartInfo: res.rows, allSelected: true, editMode: false, amountTotal: 0.00, selectedCount: 0 })
        that.updateTotalAmount()
        let cartNum = res.rows.length
        app.globalData.cartNum = cartNum
        if (cartNum > 0) {
          wx.setTabBarBadge({ index: 2, text: `${cartNum}` })
        } else {
          wx.removeTabBarBadge({ index: 2 })
        }
      }, onCompleted: () => {
        that.showLoading(false)
      }
    })
  },
  showSettleDialog: function (show) {
    // let popupComponent = this.selectComponent('.popup_settle')
    // if (show) {
    //   this.setData({ orderAmount: this.data.amountTotal })
    //   popupComponent && popupComponent.show()
    // } else {
    //   popupComponent && popupComponent.hide()
    // }

    this.toOrderConfirmPage()
  },

  toOrderConfirmPage:function(){
    let goodsAry = []
    this.data.cartInfo.filter(it=>it.checked).map(it=>{
        goodsAry.push({ 
          cartId:it.id,
          shopId:it.shopId,
          goodsId:it.goodsId,
          productId: it.productInfo.id,
          name:it.goodsInfo.name,
          service: it.goodsInfo.service, //七天退换 1是支持 其它不支持
          img: it.productInfo.picUrl || it.img,
          invoiceType: it.goodsInfo.invoiceType || '',
          specsAry: it.productInfo.goodsSpecificationNames,
          price: it.productInfo.retailPrice,
          goodsNumber:it.goodsNumber,
          shopName:it.shopInfo.name,
          shopLogo:it.shopInfo.logo
          })
    })

    util.toPage('../orderConfirm/orderConfirm',goodsAry)

  },
  onPopCloseClicked: function (e) {
    this.showSettleDialog(false)
  },
  selectFromAddressPage: function () {
    let that = this
    this.setData({ choosingAddress: true })
    let params = { mode: "select" }
    if (this.data.addressInfo) {
      params.checkedId = this.data.addressInfo.id
    }
    util.toPage('../address/address', params)
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
        cartIds:[]
      }



      this.data.cartInfo.filter(it => it.checked).map(it => {
        params.cartIds.push(it.id)
        params.orderGoodsAddRequestEntityList.push({
          goodsNumber: it.goodsNumber,
          productId: it.productId,
          shopId: it.shopInfo.id,
          goodsSpecificationNameValue: it.productInfo.goodsSpecificationNames.join(';')
        })
      })


      api.post('orderInfo', params, {
        onNext: (res) => {
          if (res) {
            this.showSettleDialog(false)
            this.showLoading(true)
            wxUtils.goodsPay(res, (msg) => {
              this.showXToast({ title: msg ? msg : "支付成功", icon: msg ? 'no' : 'yes' })
              if(msg){
                this.showLoading(false)
              }else{
                this.loadCartInfo(true)
              }
            })
          }
        },
        onError:(msg,code)=>{
          if ("600" == code) {
            wx.showModal({
              title: '提醒',
              content: msg,
              showCancel: false,
              confirmText: "知道了",
              confirmColor: "#fe5a5d"
            })
          } else if ('602' != code){
            this.showXToast({
              title: msg,
              icon: 'no'
            })
          }
        }
      })

    } else {
      this.showXToast({ title: '请添加收货地址', icon: 'location' })
    }

  },

  toGoodsDetailPage: function (e) {
    console.log(JSON.stringify(e))
    let shopId = e.currentTarget.dataset.shop_id
    let goodsId = e.currentTarget.dataset.goods_id
    let productId = e.currentTarget.dataset.product_id
    let goodsNumber = e.currentTarget.dataset.goods_number
    util.toPage("../goodsDetail/goodsDetail", { "shopId": shopId, "goodsId": goodsId, "productId": productId, "goodsNumber": goodsNumber})
  },
  preventPop: function (e) {
    console.log("~~~preventPop~~")
  },
  toShop: function () {
    wx.switchTab({ url: '../shop/shop' })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let emptyTop = util.verticalDistance([100], 500)
    this.setData({ cartEmptyTop: emptyTop })

    if (app.globalData.userInfo.shopId) {
      wx.setTabBarItem({
        index: 1,
        text: '选货市场'
      })
    }
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  updateAddressInfo:function(){
    console.log(`updateAddressInfo ${JSON.stringify(this.data.addressInfo)}`)
    let addressInfo = this.data.addressInfo
    if (addressInfo) {
      let simpleAddress = [addressInfo.province, addressInfo.city, addressInfo.district, addressInfo.address].filter(it => it != null && it != "").join(" ")
      addressInfo.simple = simpleAddress
      let middle = addressInfo.mobile.substr(3, 6)
      addressInfo.phoneHidden = addressInfo.mobile.replace(middle, "******")
      this.setData({ addressInfo: addressInfo })
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {


    

    if (app.globalData.shopInfo) {
      this.setData({ shopInfo: app.globalData.shopInfo })
    }
    if(this.data.addressInfo){
      this.updateAddressInfo()
    }
    if (this.data.choosingAddress) {
      this.setData({ choosingAddress: false })
    } else {
      this.loadCartInfo(true)
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

  },

})