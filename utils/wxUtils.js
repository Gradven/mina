const api = require("../utils/net.js")
const QQMapWX = require("../libs/qqmap-wx-jssdk.min.js")

let qqMapsdk = null

function getLocationInfo(callback) {

  if (qqMapsdk == null) {
    qqMapsdk = new QQMapWX({
      key: 'OWBBZ-K3OW3-QLN3U-YD57J-N7A3Q-YMBJZ'
    });
  }
  wx.getLocation({
    success: function(res) {
      qqMapsdk.reverseGeocoder({
        location: {
          latitude: res.latitude,
          longitude: res.longitude
        },
        success: function(addressRes) {
          let locationInfo = {
            region: null,
            city: null
          }
          let adInfo = addressRes.result.ad_info
          locationInfo.region = [adInfo.province, adInfo.city, adInfo.district]
          locationInfo.city = adInfo.city
          callback(locationInfo)
        },
        fail: (res) => console.log(res)
      })
    },
  })
}



const goodsPay = (params, callback) => {

  wx.requestPayment({
    'timeStamp': params.timeStamp,
    'nonceStr': params.nonceStr,
    'package': params.package,
    'signType': params.signType,
    'paySign': params.paySign,
    'success': function(res) {
      callback()
      // checkOrderStatus(params, callback) //在参数里加入orderId
      // wx.showToast({
      //   title: '支付成功',
      //   icon: 'success'
      // })
    },
    'fail': function(res) {
      let message = res.errMsg
      if ("requestPayment:fail cancel" == res.errMsg) {
        message = "用户取消支付"
      }
      callback(message)
    }
  })

}

function checkOrderStatus(params, callback, count = 0) {
  if (count < 5) { //最多五次查询
    let delay = 1000 + count * 2000
    let which = 'orderInfo'
    if (params.feeType == "service"){
      which = 'orderShopService'
    }
    setTimeout(() => {
      api.get(`${which}/${params.sn}`, null, {
        onNext: res => {
          if (res.payStatus == 1) {
            callback()
          } else if (res.payStatus == 99) {
            callback("用户取消支付")
          } else { // if (res.payStatus == 0) 
            this.checkOrderStatus(orderId, callback, parseInt(count) + 1)
          }

        },
        onError: (msg, code) => callback(msg)
      })
    }, delay)
  } else {
    callback("查询支付结果超时")
  }
}

function prepareShareData(data, callBack) {

  let shopId = data.code.shopId
  let goodsId = data.code.goodsId
  let userId = getApp().globalData.userInfo.id || "0"
  let _scene = [shopId, goodsId, userId].join("_")
  console.log(`page is ${data.code.page}`)
  let params = {
    scene: _scene,
    page: data.code.page,
    width: 430,
    auto_color: false,
    line_color: {
      "r": "0",
      "g": "0",
      "b": "0"
    },
    is_hyaline: true,
  }

  api.post('weixin/apis/getwxacodeunlimit', params, {
    onNext: res => {
      if (res) {
        data.code.img = res
        downloadShareImgs(data, callBack)
      } else {
        callBack("生成小程序码失败")
      }
    },
    onError: (msg, code) => {
      callBack(msg ? msg : "生成小程序码失败")
    },
    onCompleted: () => {}
  })


}

function downloadShareImgs(data, callBack) {

  if (data.goods.length == 1) {
    let img = data.goods[0].img
    if (data.shareType == 'goodsDetail' && data.goods[0].img.length == 1) {
      img = data.goods[0].cover
    }
    let startIndex = img.indexOf('x-oss-process')
    if (startIndex != -1) {
      let width = parseInt(getApp().globalData.windowWidth * 0.6333 * 0.9)
      let height = parseInt(width * 0.4638)
      img = img.substring(0, startIndex) + `x-oss-process=image/resize,m_fill,w_${width},h_${height}`

      if (data.shareType == 'goodsDetail' && data.goods[0].img.length == 1) {
        data.goods[0].img[0] = img
      } else {
        data.goods[0].img = img
      }
    }
  }

  let imgs = [data.code, data.shop]
  let count = imgs.length
  if (data.shareType == 'goodsDetail') {
    count += data.goods[0].img.length
    data.goods[0].paths = []
    data.goods[0].img.forEach(it => {

      wx.downloadFile({
        url: it,
        success: function(res) {
          data.goods[0].paths.push(res.tempFilePath)
          if (--count == 0) {
            callBack(null, data)
          }
        },
        fail: msg => callBack("缓存文件失败", data)
      })
    })
  } else {
    imgs = imgs.concat(data.goods)
    count = imgs.length
  }


  imgs.forEach(it => {
    wx.downloadFile({
      url: it.img,
      success: function(res) {
        it.path = res.tempFilePath
        if (--count == 0) {
          callBack(null, data)
        }
      },
      fail: msg => callBack("缓存文件失败", data)
    })
  })
}


function updateCartTabBarBadge() {
  let cartNum = getApp().globalData.cartNum || 0
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


module.exports = {
  goodsPay: goodsPay,
  getLocationInfo: getLocationInfo,
  prepareShareData: prepareShareData,
  updateCartTabBarBadge: updateCartTabBarBadge
}