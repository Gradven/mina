//logs.js
const util = require('../../utils/util.js')
const api = require('../../utils/net.js')

Page({
  data: {
    logs: [],
    show: false,
    shareData: null,
  },
  onLoad: function() {
    this.setData({
      logs: (wx.getStorageSync('logs') || []).map(log => {
        return util.formatTime(new Date(log))
      })
    })
  },
  
})