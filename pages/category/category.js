// pages/category/category.js
const app = getApp()
const api = require("../../utils/net.js")
const { $Toast } = require('../../dist/base/index')
const session = require("../../utils/session.js")
const util = require("../../utils/util.js")
const wxUtils = require("../../utils/wxUtils.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoading: true,

    id:0,
    goodsCategory: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      id : options.id
    });
    session.check((msg) => {
      if (msg) {
        $Toast({ content: msg, type: 'error' })
        return
      }
      this.getGoodsCategory();
    })
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
   * 改变分类
   */
  changeCategory:function(e){
    let id = e.currentTarget.dataset.id;
    this.setData({
      id:id
    })
  },
  toCategorySearchPage:function(e){
    let id = e.currentTarget.dataset.id;
    let name = e.currentTarget.dataset.name;
    if (id) {
      util.toPage("../categorySearch/categorySearch", { "id": id, "name": name  });
    }else{
      wx.showToast({
        title: "分类id为空",
        icon: 'none',
        duration: 2000
      })
    }
  },
  /**
   * 获取商品分类列表
   */
  getGoodsCategory: function () {
    let that = this;
    api.get("goodsCategory",
      {}, {
        onNext: (res) => {
          let id = 0;
          if(that.data.id == 0){
            id = res.childCategories[0].id;
            that.setData({
              goodsCategory: res,
              id: id
            })
          } else {
            that.setData({
              goodsCategory: res
            })
          }
        },
        onError: (msg, code) => {
          wx.showToast({
            title: msg,
            icon: 'none',
            duration: 2000
          })
        }
      })
  },
})