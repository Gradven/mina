//app.js
const wxUtils = require("/utils/wxUtils.js")

App({
  onLaunch: function () {
    let that = this
    const updateManager = wx.getUpdateManager()

    updateManager.onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调
      console.log(res.hasUpdate)
    })

    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        confirmColor: "#fe5a5d",
        success: function (res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      })

    })

    updateManager.onUpdateFailed(function () {
      // 新的版本下载失败
    })
    wx.getSystemInfo({
      success: function(res) {
        that.globalData.windowHeight = res.windowHeight
        that.globalData.windowWidth = res.windowWidth
        //second_height: res.windowHeight - res.windowWidth / 750 * 300
      },
    })

    // wxUtils.initQQMapSDK()

    // 展示本地存储能力

    // logs.unshift(Date.now())
    // wx.setStorageSync('logs', logs)
  },
  globalData: {
    userInfo: null,
    shopInfo:null,
    shopId:null, //需要跳转的店铺Id
    addressInfo:null,
    checkSelf:true,
    authorizing:false,
    cartNum:0,
    refreshShopPage:false,
    windowHeight:0,
    windowWidth:0
  }
})

