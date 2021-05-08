// pages/goodsDetail/goodsDetail.js
const util = require("../../utils/util.js")
const api = require("../../utils/net.js")
const wxUtils = require("../../utils/wxUtils.js")
const session = require("../../utils/session.js")
const {
  $Toast
} = require('../../dist/base/index')
const WxParse = require('../../wxParse/wxParse.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodsDataChanged: false,
    showShare: false,
    sharedParams: null,
    moreUnfolded: false,
    goodsParams: null,
    inMyShop: true,
    hasShop: false,
    agency: "",
    isLoading: true,
    autoplay: false,
    specsShow: false,
    settleShow: false,
    chooseSpec: true,
    orderAmount: 0,
    specsSummary: "",
    descriptions: null,
    shopInfo: null,
    addressList: null,
    addressInfo: null,
    address: "",
    goodsId: 1,
    quantity: 1,
    goods: null,
    specs: null,
    products: null,
    currentProduct: null,
    defaultProduct: null,
    defaultProductId: null,
    productIdsAry: [],
    productInCart: false,
    isMember: false,
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
    }, 1500)
  },
  hideLoading: function() {
    if (this.data.goods && this.data.products && this.data.specs)
      this.setData({
        isLoading: false
      })
  },
  showLoading: function() {
    this.setData({
      isLoading: true
    })
  },
  loadGoods: function() {
    let that = this
    api.get(`goodsInfo/${this.data.goodsId}`, {
      self: !!app.globalData.userInfo.shopId
    }, {
      onNext: (res) => {
        res.picUrls = JSON.parse(res.picUrls)
        res.saleStatusTitle = res.onSaleFlag == 0 ? '已下架' : res.storeNumber == 0 ? '已售完' : null //转换成商品的状态
        that.setData({
          goods: res
        })
        this.updateGoodsParams()
        this.updateDescription()
        this.updateNavTitle()
        this.updateAgency()
        this.updateAddressInfo(res.addressInfo)
      },
      onError: (msg, code) => $Toast({
        content: msg,
        type: 'error'
      }),
      onCompleted: () => {
        that.hideLoading()
      }
    })
  },
  updateNavTitle: function() {
    wx.setNavigationBarTitle({
      title: this.data.goods.name || '红橱'
    })
  },
  updateAgency: function() {

    let map = new Map([
      [-1, '再次代理'],
      [0, '代理'],
      [1, '取消代理']
    ])
    let agentFlag = this.data.goods.agentFlag
    let shopOwner = !!app.globalData.userInfo.shopId
    let _agency = map.get(agentFlag ? agentFlag : shopOwner ? 0 : -99) || ''
    if (this.data.goods.saleStatusTitle && agentFlag != 1) { //如果处于已售完或者已下架状态，并且不是要做 取消代理的情况
      _agency = ''
    }
    this.setData({
      agency: _agency,
      goodsDataChanged: false,
    })

  },
  refreshShopPage: function() {
    if (!!app.globalData.userInfo.shopId) { //如果在自己的店铺里
      app.globalData.refreshShopPage = true
    }
  },
  handleOnAgencyClicked: function() {

    let status = this.data.goods.agentFlag
    if (status == 1) { //取消代理
      this.showCancelAgentConfirmDialog()
    } else {
      this.toSloganPage(status)
    }
    // } else if (status == 0) { //代理 
    //   this.sendUpdateAgentStatus(1)
    // } else if (status == -1) { //再次代理
    //   this.sendUpdateAgentStatus(1)
    // }
  },
  toSloganPage: function(status) {
    if (this.data.isMember) {
      util.toPage('../goodsSlogan/slogan', {
        httpType: status ? 'put' : 'post',
        goodsId: this.data.goodsId
      })
    } else {
      this.showServiceFeeDialog()
    }
  },

  showServiceFeeDialog: function() {
    let that = this
    wx.showModal({
      title: '温馨提示',
      content: '请先缴纳技术服务年费',
      confirmText: '立即缴纳',
      confirmColor: "#fe5a5d",
      success: res => {
        if (res.confirm) {
          that.payServiceFee()
        } else if (res.cancel) {

        }
      }
    })
  },
  payServiceFee: function() {
    this.showLoading()
    let that = this
    api.post("orderShopService", { shopId: app.globalData.userInfo.shopId}, {
      onNext: (res) => {
        // res.feeType = "service" //无须轮循
        wxUtils.goodsPay(res,(msg)=>{
          if (!msg) { //成功支付服务费
            this.setData({isMember:true})
            app.globalData.userInfo.shopRightFlagFlag = 1;
            app.globalData.userInfo.isMember = true
          }
          this.showXToast({ title: msg ? msg : "支付成功", icon: msg ? 'no' : 'yes', callBack: () => { if (!msg) this.handleOnAgencyClicked() } })
        })
      },
      onError: (msg, code) => {
        this.showXToast({
          title: msg,
          icon: 'no',
        })
      },
      onCompleted: () => that.hideLoading()
    });
  },
  sendUpdateAgentStatus: function(status) {
    this.showLoading()
    api.put('shopGoods', {
      goodsId: this.data.goods.id,
      status: status
    }, {
      onNext: res => {
        this.refreshShopPage()
        this.loadGoods()
        this.showXToast({
          title: status == 1 ? "成功代理该商品" : "已取消该商品的代理",
          icon: 'yes'
        })
      },
      onCompleted: () => {
        this.hideLoading()
      }

    })
  },
  showCancelAgentConfirmDialog: function() {
    let that = this
    wx.showModal({
      title: '取消代理',
      content: '确定要取消该商品吗？',
      confirmColor: "#fe5a5d",
      success: res => {
        if (res.confirm) {
          that.sendUpdateAgentStatus(-1)
        } else if (res.cancel) {

        }
      }
    })
  },
  loadSpecInfo: function() {
    let that = this
    api.get('goodsSpecification', {
      goodsId: this.data.goodsId
    }, {
      onNext: (res) => {
        let simpleData = []
        Object.keys(res).forEach((key) => {
          let item = {}
          let specName = key.split("|")
          item.id = specName[0]
          item.name = specName[1]
          item.spec = res[key]
          // item.spec[0].checked = true //默认选择每种规格的第一项
          simpleData.push(item)
        })
        that.setData({
          specs: simpleData,
          autoplay: true
        })
        that.updateCurrentProduct()
      },
      onError: (msg, code) => $Toast({
        content: msg,
        type: 'error'
      }),
      onCompleted: () => {
        that.hideLoading()
      }
    })
  },
  updateDescription: function() {
    let des = this.data.goods.goodsDescription
    if (des) {
      this.setData({
        descriptions: "descriptions"
      })
      WxParse.wxParse('articleContent', 'html', des.content, this, 5);
    }
  },
  // loadGoodsDesc: function() {

  //   let that = this
  //   api.get(`goodsDescription/${this.data.goodsId}`, {}, {
  //     onNext: (res) => {
  //       that.setData({
  //         descriptions: "descriptions"
  //       })
  //       WxParse.wxParse('articleContent', 'html', res.content, that, 0);
  //       //1.bindName绑定的数据名(必填) 2 type可以为html或者md(必填) 3 data为传入的具体数据(必填) 4 target为Page对象,一般为this(必填) 5 imagePadding为当图片自适应是左右的单一padding(默认为0,可选)
  //     },
  //     onCompleted: () => {
  //       that.hideLoading()
  //     }
  //   })
  // },
  loadShopInfo: function() {
    let that = this
    api.get("shopInfo/" + app.globalData.shopId, "", {
      onNext: (res) => {
        app.globalData.shopInfo = res
        that.setData({
          shopInfo: res,
        })
      }
    })
  },
  loadProductInfo: function() {
    let that = this
    api.get('productInfo', {
      goodsId: this.data.goodsId
    }, {
      onNext: (res) => {
        let idsAry = []
        res.forEach(it => {
          let ids = it.goodsSpecificationIds.split(",")
          it.goodsSpecificationIds = ids.sort((a, b) => parseInt(a) - parseInt(b)).join(",")
          idsAry.push(it.goodsSpecificationIds)
        })
        that.setData({
          productIdsAry: idsAry,
          products: res
        })
        // console.log("TAG=loadProduct>" + JSON.stringify(res))
        that.updateCurrentProduct()
      },
      onCompleted: () => {
        that.hideLoading()
      }
    })

  },
  onPopCloseClicked: function(e) {
    let which = e.target.dataset.which
    if ("spec" == which) {
      this.closeSepcDialog()
    } else if ("settle" == which) {
      this.showSettleDialog(false)
    } else if ("address" == which) {
      this.showAddressDialog(false)
    }

  },

  shareGoods: function() {


  },

  handleQuantityChange: function({
    detail
  }) {
    this.setData({
      quantity: detail.value || 1
    })
  },
  handleShowSettleDialog: function() {
    this.showSettleDialog(true)
  },
  backToMyShop: function() {
    app.globalData.shopId = app.globalData.userInfo.shopId
    wx.switchTab({
      url: '../shop/shop'
    })
  },
  toShop: function() {
    wx.switchTab({
      url: '../shop/shop'
    })
  },
  toCartPage: function() {
    wx.switchTab({
      url: '../cart/cart'
    })
  },
  specCheckedChanged: function(e) {
    let specName = e.currentTarget.dataset.spec_name
    let value = e.detail.value
    let _specs = this.data.specs
    _specs.filter(it => it.name == specName).map(it => it.spec.forEach(it => {
      it.checked = it.value == value
    }))
    this.setData({
      specs: _specs
    })
    this.updateCurrentProduct()
  },
  showSpecDialog: function(e) {
    if (this.data.goods && this.data.products && this.data.currentProduct) {

      if (!!this.data.goods.saleStatusTitle) {
        this.showXToast({
          title: `该产品${this.data.goods.saleStatusTitle}`,
          icon: 'warning'
        })
      } else {
        let choose = e.currentTarget.dataset.choose
        this.setData({
          specsShow: true,
          chooseSpec: choose
        })
        let popupComponent = this.selectComponent('.popup_spec')
        popupComponent && popupComponent.show()
      }
    }
  },
  closeSepcDialog: function() {
    let popupComponent = this.selectComponent('.popup_spec')
    popupComponent && popupComponent.hide()
  },
  handleSpecConfirm: function() {
    this.closeSepcDialog()
    let that = this
    setTimeout(() => {
      that.showSettleDialog(true)
    }, 500)
  },
  disableNotExsitSpecs: function() {
    let _specs = this.data.specs
    for (let index in _specs) {
      this.findNotExsitSpecs(index, [], _specs)
    }
    this.setData({
      specs: _specs
    })

  },
  queryIdsInProduct: function(ids) {
    let condition = ids.sort((a, b) => parseInt(a) - parseInt(b)).join(",")
    let result = !!this.data.productIdsAry.find(it => it.indexOf(condition) >= 0)
    return result
  },
  findNotExsitSpecs: function(index, ids, specs) {
    if (ids.length < specs.length) { //所有规格还未循环完成
      let array = specs[index % specs.length].spec
      if (ids.length == 0 && specs.length > 1) { //只保留目标数组的选中项
        array = [array.find(item => item.checked)]
      }
      for (let item of array) {
        let _ids = new Array()
        _ids.push(item.id)
        if (ids.length == specs.length - 1) {
          item.disable = !this.queryIdsInProduct(ids.concat(_ids)) //如果是不存在的
        }
        if (item.checked) {
          this.findNotExsitSpecs(parseInt(index) + 1, ids.concat(_ids), specs)
        }
      }
    }
  },
  queryProduct: function() {
    let specsIds = []
    this.data.specs.forEach(it => it.spec.filter(spec => spec.checked == true).map(it => specsIds.push(it.id)))
    let _specsIds = specsIds.sort((a, b) => parseInt(a) - parseInt(b)).join(",")
    let product = null
    this.data.products.filter(it => _specsIds == it.goodsSpecificationIds).map(it => product = it)
    return product
  },
  queryProductId: function() {
    return this.queryProduct().id
  },
  updateCurrentProduct: function() {
    if (this.data.products && this.data.products.length > 0 && this.data.specs) {
      if (!this.data.defaultProduct) { //初始化默认的规格
        // let defaultProdIds = this.data.products[0].goodsSpecificationIds.split(",")
        let _specs = this.data.specs
        let _products = this.data.products
        //过滤掉不符合规则的规格
        let _tempProducts = []
        let _tempIdsAry = []
        let _profitAry = []
        _products.filter(it => it.storeNumber > 0).map(product => {
          let ids = product.goodsSpecificationIds.split(",")
          let match = _specs.every(sp => ids.some(it => sp.spec.some(s => s.id == it)))
          if (match) {
            _tempProducts.push(product)
            _tempIdsAry.push(product.goodsSpecificationIds)
            _profitAry.push(product.profit)
          }
        })
        this.setData({
          products: _tempProducts,
          productIdsAry: _tempIdsAry
        })
        let defaultIndex = 0
        if (this.data.defaultProductId) {
          defaultIndex = _tempProducts.findIndex(it => it.id == this.data.defaultProductId)
        } else {
          defaultIndex = _profitAry.indexOf(Math.max(..._profitAry))
        }
        defaultIndex = defaultIndex > 0 ? defaultIndex : 0
        let defaultProdIds = _tempIdsAry[defaultIndex].split(",")
        // let defaultProdIds = _products.find(product => {
        //   let ids = product.goodsSpecificationIds.split(",")
        //   return _specs.every(sp => ids.some(it => sp.spec.some(s => s.id == it )))
        // }).goodsSpecificationIds.split(",")

        _specs.forEach(it => it.spec.filter(spec => !!defaultProdIds.find(it => it == spec.id)).map(it => {
          it.checked = true
        }))
        this.setData({
          defaultProduct: this.data.products[0],
          specs: _specs
        })
      }
      let currentProduct = this.queryProduct()
      if (currentProduct) {

        this.setData({
          currentProduct: currentProduct
        })
        console.log(`current product is ${JSON.stringify(currentProduct)}`)
        this.updateSpecsSummary()
      } else {
        this.showXToast({
          title: "没有对应的商品",
          icon: 'warning'
        })
      }

      this.disableNotExsitSpecs()
    }
  },
  handleAdd2Cart: function() {
    let that = this
    if (this.data.currentProduct && this.data.shopInfo) {
      api.post('cartInfo', {
        goodsId: this.data.goodsId,
        goodsNumber: this.data.quantity,
        productId: this.data.currentProduct.id,
        shopId: this.data.shopInfo.id,
      }, {
        onNext: (res) => {
          app.globalData.cartNum += 1
          that.setData({
            productInCart: true
          })
          that.showXToast({
            title: '已成功加至购物车',
            icon: 'cart',
            callBack: () => this.closeSepcDialog()
          })
        },
        onError: (msg, code) => that.showXToast({
          title: msg,
          icon: 'warning'
        })
      })
    } else {
      wx.showToast({
        title: '没有找到对应的产品',
        icon: 'none'
      })
    }
  },
  showSettleDialog: function(show) {
    // let popupComponent = this.selectComponent('.popup_settle')
    // if (show) {
    //   let unitPrice = parseFloat(this.data.currentProduct.retailPrice)
    //   let amount = (unitPrice * this.data.quantity).toFixed(2)
    //   this.setData({
    //     orderAmount: amount
    //   })
    //   popupComponent && popupComponent.show()
    // } else {
    //   popupComponent && popupComponent.hide()
    // }
    this.toOrderConfirmPage()
  },
  toOrderConfirmPage: function() {
    let goods = this.data.goods
    let currentProduct = this.data.currentProduct
    let shopInfo = this.data.shopInfo
    let _summary = []
    this.data.specs.forEach(it => it.spec.filter(spec => spec.checked == true).map(it => _summary.push(it.value)))
    let goodsAry = [{
      goodsId: this.data.goodsId,
      goodsNumber: this.data.quantity,
      productId: currentProduct.id,
      shopId: shopInfo.id,
      name: goods.name,
      service: goods.service || '', //七天退换 1是支持 其它不支持
      img: currentProduct.picUrl || goods.picUrls[0],
      invoiceType: goods.invoiceType || '',
      specsAry: _summary,
      price: currentProduct.retailPrice,
      shopName: shopInfo.name,
      shopLogo: shopInfo.logo
    }]

    util.toPage('../orderConfirm/orderConfirm', goodsAry)

  },
  updateSpecsSummary: function() {
    let _summary = []
    this.data.specs.forEach(it => it.spec.filter(spec => spec.checked == true).map(it => _summary.push(it.value)))
    this.setData({
      specsSummary: _summary.join("; ")
    })
  },
  updateAddressInfo: function(addressInfo) {
    if (addressInfo) {
      let simpleAddress = [addressInfo.province, addressInfo.city, addressInfo.district, addressInfo.address].filter(it => it != null && it != "").join(" ")
      this.updateAddress(simpleAddress)
      addressInfo.simple = simpleAddress
      let middle = addressInfo.mobile.substr(3, 6)
      addressInfo.phoneHidden = addressInfo.mobile.replace(middle, "******")
      this.setData({
        addressInfo: addressInfo
      })
    }
  },
  openAddressDialog: function() {
    let that = this
    wx.chooseAddress({
      success: function(res) {
        if (res.errMsg == "chooseAddress:ok") {
          let address = []
          address.push(res.provinceName)
          address.push(res.cityName)
          address.push(res.countyName)
          address.push(res.detailInfo)
          let simpleAddress = address.filter(it => it != null && it != "").join(" ")
          that.updateAddress(simpleAddress)
          res.simple = simpleAddress
          let middle = res.telNumber.substr(3, 6)
          res.phoneHidden = res.telNumber.replace(middle, "******")
          that.setData({
            addressInfo: res
          })
        }
      },
      fail: function(res) {},
      complete: function(res) {},
    })
  },

  handleOnAddressClicked: function() {
    if (this.data.addressList == null) {
      this.loadAddressInfo()
    } else {
      this.showAddressDialog(true)
    }
  },

  loadAddressInfo: function() {

    this.showLoading()
    api.get("addressInfo", {
      limit: 100,
      offset: 0
    }, {
      onNext: res => {
        let _addressList = res.rows
        if (_addressList.length > 0) { //有地址信息
          if (this.data.addressInfo) { //当前已经有默认的地址
            _addressList.forEach(it => {
              it.checked = it.id == this.data.addressInfo.id
              it.simple = [it.province, it.city, it.district, it.address].join(" ")
            })
          }
          this.setData({
            addressList: res.rows
          })
          this.showAddressDialog(true)
        } else { //没有地址信息
          this.selectFromAddressPage()
        }
      },
      onCompleted: () => {
        this.hideLoading()
      }
    })
  },
  showAddressDialog: function(show) {

    //addressShow

    let popupComponent = this.selectComponent('.popup_address')
    if (show) {
      popupComponent && popupComponent.show()
    } else {
      popupComponent && popupComponent.hide()
    }

  },

  onChooseAddress: function(e) {

    let id = e.currentTarget.dataset.address_id
    let _addressList = this.data.addressList
    _addressList.forEach(it => it.checked = it.id == id)
    this.setData({
      addressList: _addressList
    })
    this.updateAddressInfo(_addressList.find(it => it.id == id))
  },

  selectFromAddressPage: function() {
    let params = {
      mode: "select"
    }
    if (this.data.addressInfo) {
      params.checkedId = this.data.addressInfo.id
    }
    util.toPage('../address/address', params)
  },

  createOrder: function() {
    let addressInfo = this.data.addressInfo
    if (addressInfo) {

      let that = this
      var reg = new RegExp(' ', "g")
      let spec = this.data.specsSummary.replace(reg, "")
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
        orderGoodsAddRequestEntityList: [{
          goodsNumber: this.data.quantity,
          productId: this.data.currentProduct.id,
          shopId: this.data.shopInfo.id,
          goodsSpecificationNameValue: spec
        }]
      }


      api.post('orderInfo', params, {
        onNext: (res) => {
          if (res) {
            this.showSettleDialog(false)
            this.showLoading()
            wxUtils.goodsPay(res, (msg) => {
              this.hideLoading()
              this.showXToast({
                title: msg ? msg : "支付成功",
                icon: msg ? 'no' : 'yes'
              })
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
        }
      })

    } else {
      this.showXToast({
        title: '请添加收货地址',
        icon: 'location'
      })
    }

  },
  updateAddress: function(address) {
    this.setData({
      address: address
    })
  },
  previewImage: function(e) {
    console.log(JSON.stringify(e))
    wx.previewImage({
      current: e.target.dataset.picurl,
      urls: this.data.goods.picUrls,
    })

  },
  showMoreParams: function() {
    let unfold = this.data.moreUnfolded
    this.setData({
      moreUnfolded: !unfold
    })
    this.updateGoodsParams()
  },
  updateGoodsParams: function() {
    let params = this.data.goods.goodsParamList
    if (!params) return
    if (this.data.moreUnfolded) { //完全展开时，显示全部
      this.setData({
        goodsParams: params
      })
    } else {
      let _params = []
      params.forEach(it => {
        if (_params.length < 3) _params.push(it)
      })
      this.setData({
        goodsParams: _params
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    util.decodeQueryParams(options)

    let _shopId = options.shopId
    let _goodsId = options.goodsId
    let _userId = options.userId

    let scene = options.scene
    if (scene) {
      let paramsAry = scene.split('_')
      _shopId = paramsAry[0]
      _goodsId = paramsAry[1]
      _userId = paramsAry[2]
    }

    if (_shopId && _goodsId && _userId) { //通过分享直接进入
      app.globalData.shopId = _shopId
      app.globalData.shopInfo = null
      this.setData({
        shopInfo: null,
        goods: null,
        goodsId: _goodsId,
        sharedParams: {
          shopId: _shopId,
          goodsId: _goodsId,
          userId: _userId
        }
      })
    } else {
      let productInCart = app.globalData.cartNum > 0
      let defaultProductId = options.productId || ''
      // let goodsNumber = options.goodsNumber || 1
      if (app.globalData.userInfo) {
        let _inMyShop = app.globalData.userInfo.shopId == app.globalData.shopId
        this.setData({
          hasShop: !!app.globalData.userInfo.shopId,
          inMyShop: _inMyShop,
          goodsId: options.goodsId,
          productInCart: productInCart,
          defaultProductId: defaultProductId

        })
      }
    }
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

      this.setData({
        hasShop: !!app.globalData.userInfo.shopId,
        isMember: app.globalData.userInfo.isMember,
      })

      if (this.data.sharedParams) {
        this.setData({
          inMyShop: this.data.sharedParams.shopId == app.globalData.userInfo.shopId
        })
      }

      if (this.data.addressList) {
        this.setData({
          addressList: null
        }) //清空地址信息
      }

      if (this.data.addressInfo) {
        this.updateAddressInfo(this.data.addressInfo)
      }

      if (this.data.goodsDataChanged) {
        this.refreshShopPage()
      }

      if (this.data.goods == null || this.data.goodsDataChanged) {
        this.loadGoods()
      }


      if (this.data.specs == null) {
        this.loadSpecInfo()
      }

      if (this.data.shopInfo == null) {

        if (app.globalData.shopInfo) {
          this.setData({
            shopInfo: app.globalData.shopInfo
          })

        } else {
          this.loadShopInfo()
        }

      }

      // if (this.data.descriptions == null) {
      //   this.loadGoodsDesc()
      // }

      if (this.data.products == null) {
        this.loadProductInfo()
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



  onShareAppMessage: function() {

    return {
      title: this.data.goods.name,
      path: `pages/goodsDetail/goodsDetail?shopId=${app.globalData.shopId}&goodsId=${this.data.goodsId}&userId=${app.globalData.userInfo.id}`,
      imageUrl: this.data.goods.picUrls[0]
    }
  },

  onOpenSharePopup: function() {
    let _shareData = this.data.goods
    if (this.data.currentProduct) {
      _shareData.profit = this.data.currentProduct.profit
    }
    this.setData({
      shareData: _shareData,
      showShare: true
    })
  },
  onCloseSharePopup: function(e) {
    this.setData({
      showShare: false
    })
  },
  preventTouchPop: function() {},
})