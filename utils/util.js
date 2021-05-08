const moment = require("../libs/moment.min.js")

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

/*计算page页面居中需要的top距离 px */
const verticalDistanceToCenter = (arr, viewHeight) => {
  let winWidth = getApp().globalData.windowWidth
  let winHeight = getApp().globalData.windowHeight
  if (winWidth && winHeight) {
    let sumHeight = arr.reduce((prev, curr, idx, arr) => parseInt(prev) + parseInt(curr))
    let distance = ((winHeight - winWidth / 750 * sumHeight) - winWidth / 750 * viewHeight) / 2
    return distance < 0 ? 0 : distance
  }
  return 0
}

const rpx2px = rpx => rpx * getApp().globalData.windowWidth / 750

function encodeObjectStringValues(obj){
  if(obj instanceof Array){
    obj.forEach(item => { encodeObjectStringValues(item)})
  }else{
    Object.keys(obj).filter(key => key => obj[key] != null && ("string" === typeof obj[key])).map(key => obj[key] = encodeURIComponent(obj[key]))
  }
  return obj
}

const genQueryParams = obj => {

  if (obj instanceof Array) {
    return `extras=${JSON.stringify(encodeObjectStringValues(obj))}`
  }

  return Object.keys(obj).filter(key => obj[key] != null && obj[key] != "" || obj[key] == 0).map(key => key + "=" + encodeURIComponent(obj[key])).join('&')
}

function decodeObjectStringValues(obj) {
  Object.keys(obj).filter(key => obj[key] != null && ("string" === typeof obj[key])).map(key => {
    obj[key] = decodeURIComponent(obj[key])
  })
}

const decodeParams = obj =>{
  if(obj instanceof Array){
    obj.forEach(it => decodeParams(it) )
  }else{
    decodeObjectStringValues(obj)
  }
} 

const toPage = (page, obj) => wx.navigateTo({
  url: `${page}?${genQueryParams(obj)}`
})

const isEmptyStr = str => {
  if (str == undefined || str == null || str == '' || str == 'null' || str == '[]' || str == '{}') {
    return true
  } else {
    return false;
  }
}

const getTime = seconds => {
  let m = seconds / 60;
  let s = seconds % 60;
  return formatNumber(Math.floor(m)) + ':' + formatNumber(s);
}

const friendlyTime = milliseconds => {
  let targetDate = moment(milliseconds)  
  let today = new Date()
  let yesterDay = moment(new Date()).subtract(1, 'days')
  let beforeYesterday = moment(new Date()).subtract(2, 'days')
  if (moment(today).isSame(targetDate, 'day')) {
    let duration = moment.duration(milliseconds)
    let hour = moment().get("hour") - targetDate.get('hour')
    // let hour = duration.get('hour')
    if (hour != 0) {
      return `${hour}小时前`
    }
    let minutes = duration.get('minutes')
    if (minutes != 0) {
      return `${minutes}分钟前`
    }
    return "刚刚"
    // return "今天"
  } else if (moment(yesterDay).isSame(targetDate, 'day')) {
    return "昨天"
  } else if (moment(beforeYesterday).isSame(targetDate, 'day')) {
    return "前天"
  } else {
    return targetDate.format('YYYY-MM-DD')
  }

}

module.exports = {
  isEmptyStr: isEmptyStr,
  formatTime: formatTime,
  genQueryParams: genQueryParams,
  decodeQueryParams: decodeParams,
  toPage: toPage,
  getTime: getTime,
  verticalDistance: verticalDistanceToCenter,
  rpx2px: rpx2px,
  friendlyTime: friendlyTime
}