// pages/personal/certification/certification.js
const app = getApp()
const api = require("../../../utils/net.js")
const { $Toast } = require('../../../dist/base/index')
const session = require("../../../utils/session.js")
const util = require("../../../utils/util.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShowTips:true,

    realName:'',
    idCard:'',
    cardFront: '',
    cardBack: '',
    userCertificateId:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getUserCertificate();
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
  /**
   * 真实姓名
   */
  setName: function (event) {
    this.setData({
      realName: event.detail.value
    })
  },
  /**
   * 身份证号
   */
  setIdCard:function(event){
    this.setData({
      idCard: event.detail.value
    })
  },
  /**
   * 提交
   */
  submit: function () {
    let that = this;
    wx.showLoading();
    let postData = {};
    postData.realName = this.data.realName;
    postData.idCard = this.data.idCard;
    postData.cardFront = this.data.cardFront;
    postData.cardBack = this.data.cardBack;
    if (this.data.userCertificateId){
      postData.id = this.data.userCertificateId;
      api.put("userCertificate", postData, {
        onNext: (res) => {
          if (res.approveStatus == 1) {
            wx.showToast({
              title: '认证成功',
              icon: 'success',
              duration: 2000
            })
            setTimeout(function () {
              wx.navigateBack()
            }, 1500);
          }else{
            wx.showToast({
              title: '审核失败，请检测输入信息！',
              icon: 'none',
              duration: 2000
            })
          }
        },
        onError: (msg, code) => {
          wx.showToast({
            title: msg,
            icon: 'none',
            duration: 2000
          })
        },
        onCompleted: () => {
          wx.hideLoading()
        }
      })
    }else{
      api.post("userCertificate", postData, {
        onNext: (res) => {
          if (res.approveStatus == 1) {
            wx.showToast({
              title: '认证成功',
              icon: 'success',
              duration: 2000
            })
            setTimeout(function () {
              wx.navigateBack()
            }, 1500);
          } else {
            wx.showToast({
              title: '审核失败，请检测输入信息！',
              icon: 'none',
              duration: 2000
            })
          }
        },
        onError: (msg, code) => {
          wx.showToast({
            title: msg,
            icon: 'none',
            duration: 2000
          })
        },
        onCompleted: () => {
          wx.hideLoading()
        }
      })
    }
  },
  getUserCertificate:function(){
    let that = this;
    api.get("userCertificate", {}, {
      onNext: (res) => {
        that.setData({
          userCertificateId: res && res.id
        });
      },
      onError: (msg, code) => {
        wx.showToast({
          title: msg,
          icon: 'none',
          duration: 2000
        })
      },
      onCompleted: () => {
      }
    })
  },
  uploadIcon: function (e) {
    let that = this;
    let imgType = e.currentTarget.dataset.type;
    wx.chooseImage({
      count: 1,
      success: function (res) {
        wx.showLoading({
          title: '正在上传',
        })
        var tempFilePaths = res.tempFilePaths
        let filename = tempFilePaths[0];
        api.get("aliyun/oss/policies", "", {
          onNext: (res) => {
            var accessid = res.accessid;
            var policy = res.policy;
            var signature = res.signature;
            var dirname = res.dir;
            var host = res.host;

            var suffix = '';
            var filePath = '';

            function random_string(len) {
              len = len || 32;
              var chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz0123456789';
              var maxPos = chars.length;
              var pwd = '';
              for (var i = 0; i < len; i++) {
                pwd += chars.charAt(Math.floor(Math.random() * maxPos));
              }
              return pwd;
            }

            function get_suffix(filename) {
              var pos = filename.lastIndexOf('.');
              var suffix = '';
              if (pos != -1) {
                suffix = filename.substring(pos);
              }
              return suffix;
            }

            if (filename != '') {
              suffix = get_suffix(filename);
              filePath = dirname + random_string(32) + suffix;
            }
            // let host = 'https://xiaomaimai-test.oss-cn-hangzhou.aliyuncs.com';
            wx.uploadFile({
              url: host, //仅为示例，非真实的接口地址
              filePath: tempFilePaths[0],
              name: 'file',
              formData: {
                'key': filePath,
                'policy': policy,
                'OSSAccessKeyId': accessid,
                'success_action_status': '200', //让服务端返回200,不然，默认会返回204
                'signature': signature,
              },
              success: function (res) {
                if (imgType == 'cardFront') {
                  that.setData({
                    cardFront: host + "/" + filePath
                  });
                }else if (imgType == 'cardBack') {
                  that.setData({
                    cardBack: host + "/" + filePath
                  });
                }
                wx.showToast({
                  title: '上传成功',
                  icon: 'success',
                  duration: 2000
                })
              }
            })
          },
          onError: (msg, code) => {
            wx.showToast({
              title: msg ? msg : `服务器异常，错误代码${code}`,
            })
          }
        })
      }
    })
  },
  showDesc:function(){
    wx.navigateTo({
      url: '../certificationDesc/certificationDesc'
    })
  },
  closeDialog:function(){
    this.setData({
      isShowTips:false
    })
  }
})