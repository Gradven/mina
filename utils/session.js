const api = require("../utils/net.js")

const app = getApp()

function sessionCheck(callback, selfCheck) {

  if (app.globalData.userInfo) {
    callback()
  } else if (selfCheck) {
    checkSelf(callback)
  } else {
    wxLogin(callback)
  }
}

function checkSelf(callback) {
  api.get("user/self", "", {
    onNext: (res) => {
      res.isMember = res.shopRightFlag == 1
      app.globalData.userInfo = res
      wx.setStorageSync('userInfo', res)
      callback()
    },
    onError: (msg, code) => callback(msg),
    onUserInvalid: (res) => wxLogin(callback)
  })
}

function wxLogin(callback) {

  // 登录
  wx.login({
    success: res => {
      // 发送 res.code 到后台换取 openId, sessionKey, unionId
      let code = res.code
      //获取用户信息
      wx.getSetting({
        success: res => {
          if (res.authSetting['scope.userInfo']) {
            wx.getUserInfo({
              success: res => {
                // 可以将 res 发送给后台解码出 unionId
                delete res.userInfo
                thirdLogin(callback, code, res)
              }
            })
          } else {
            if (!app.globalData.authorizing)
            wx.navigateTo({ url: '/pages/authorize/authorize', })
            app.globalData.authorizing = true
            callback();
          }
        }
      })
    }
  })
}

function thirdLogin(callback, code, minaData) {
  api.post("session/frontThird", {'accountType': '1', 'code':code, 'minaVerifyMap': minaData}, {
    onNext: (res) => {
      res.isMember = res.shopRightFlag == 1
      app.globalData.userInfo = res
      app.globalData.checkSelf = true
      wx.setStorageSync('userInfo', res)
      callback()
    },
    onError: (msg, code) => callback(msg),
  })

}

module.exports = {
  check: sessionCheck,
  checkSelf: checkSelf
}
