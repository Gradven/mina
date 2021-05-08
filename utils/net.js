const util = require("../utils/util.js")
var app = getApp()

const BASE_URL = "https://hq-api.xxxx.com/v1/"; 

const RESP_CODE_USER_INVALID = 101;

var cookie = ""

function requestConfig() {


  this.urlSuffix = '';
  this.params
  this.method = 'POST';
  this.callback = {
    onStart: function () { },
    onCompleted: function () { },
    onNext: function (data) { },
    onError: function (msg, code) { },
    onGetHeader: function () { },
    onUserInvalid: function () {
    // this.onError("您还没有登录或者登录已过期", RESP_CODE_USER_INVALID
    }
  };

  this.apply = function () {
    request(this)
  }

}
function request(config) {
  if(!app){
    app = getApp()
  }

  let { onStart, onCompleted, onNext, onError, onGetHeader, onUserInvalid } = config.callback
  if (isFunction(onStart)) { onStart() }

  let url = BASE_URL + config.urlSuffix;
  let body = '';
  let contentType = 'application/json';

  if (config.method == "GET") {
    if (!isOptStrNull(config.params)) {
      let params = util.genQueryParams(config.params)
      if (!isOptStrNull(params)) {
        if (url.indexOf('?') > 0) {
          url += `&${params}`
        } else {
          url += `?${params}`
        }
      }
    }
  } else {
    body = JSON.stringify(config.params)
  }

  if ("" == cookie) { cookie = wx.getStorageSync('cookie') }
  wx.request({
    url: url,
    method: config.method,
    header: {
      'content-type': contentType,
      'cookie': cookie
    },
    data: body,
    success: function (res) {
      console.log(`${url} resp======> ${JSON.stringify(res)}`)
      if (res.statusCode == 200) { //Http请求成功
        let errorCode = res.data && res.data.errorCode
        if (errorCode) {
          if (res.data.errorCode == '601') {
            if (isFunction(onUserInvalid)) {
              onUserInvalid()
            } else {
              if (!app.globalData.authorizing)
                wx.navigateTo({ url: '/pages/authorize/authorize', })
              app.globalData.authorizing = true
            }
          }
          else {
            let message = res.data.message;
            if (res.data.errors && res.data.errors.length > 0) {
              message = res.data.errors[0].defaultMessage
            }
            if (isFunction(onError)) {
              onError(message, errorCode)
            } else {
              wx.showToast({
                title: `${message} ${res.statusCode}`,
                icon:'none',
                duration: 2000,
              })
            }
          }

          return
        }

        saveCookie(res)

        if (isFunction(onNext)) { onNext(res.data) }
        if (isFunction(onGetHeader)) { onGetHeader(res.header) }
      } else {

        if (isFunction(onError)) {
          onError(res.data.message ? res.data.message : `服务器${res.statusCode}`, res.statusCode)
        } else {
          wx.showToast({
            title: res.data.message ? res.data.message : `服务器${res.statusCode}`,
            icon: 'none',
            duration: 2000,
          })
        }

      }

    },
    fail: function (res) {
      if (isFunction(onError)) {
        onError("网络请求异常", 1)
      }
    },
    complete: function (res) {
      if (isFunction(onCompleted)) {
        onCompleted()
      }
    }
  })
}

function isFunction(f) {
  return 'function' === typeof f;
}

function saveCookie(res) {
  var cookieFromHeader = res.header['set-cookie']
  if (!cookieFromHeader) {
    cookieFromHeader = res.header['Set-Cookie']
  }

  if (cookieFromHeader && cookie != cookieFromHeader) {
    cookie = cookieFromHeader
    wx.setStorageSync('cookie', cookie)
  }
}


function buildRequest(serviceName, params, method, callBack) {
  let config = new requestConfig();
  config.method = method;
  config.urlSuffix = serviceName;
  config.params = params
  config.callback = callBack;
  return config;
}

function post(serviceName, params, callBack) {
  buildRequest(serviceName, params, "POST", callBack).apply();
}

function put(serviceName, params, callBack) {
  buildRequest(serviceName, params, "PUT", callBack).apply();
}

function get(serviceName, params, callBack) {
  buildRequest(serviceName, params, "GET", callBack).apply();
}

function del(serviceName, params, callBack) {
  buildRequest(serviceName, params, "DELETE", callBack).apply();
}



function isOptStrNull(str) {
  if (str == undefined || str == null || str == '' || str == 'null' || str == '[]' || str == '{}') {
    return true
  } else {
    return false;
  }
}


module.exports = {
  post: post,
  put: put,
  get: get,
  delete:del,
}
