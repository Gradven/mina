// dist/goods-item/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    shopInfo:{
      type: Object,
      value: {}
    },
    item:{
      type:Object,
      value:{}
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    tapitem:function(event){
      var detail = event.currentTarget.dataset;
      var option = {};
      this.triggerEvent('tapitem', detail, option)
    },
    /**
     * 进入店铺详情
     */
    toGoodsDetailPage: function (event) {
      var detail = event.currentTarget.dataset;
      detail.type = 'toGoodsDetailPage';
      var option = {};
      this.triggerEvent('tapitem', detail, option)
    },
    /**
   * 再次代理
   */
    reOnSelf: function (event) {
      var detail = event.currentTarget.dataset;
      detail.type = 'reOnSelf';
      var option = {};
      this.triggerEvent('tapitem', detail, option)
    },
    /**
     * 代理
     */
    onSelf: function (event) {
      var detail = event.currentTarget.dataset;
      detail.type = 'onSelf';
      var option = {};
      this.triggerEvent('tapitem', detail, option)
    },
    /**
     * 取消
     */
    unSelf: function (event) {
      var detail = event.currentTarget.dataset;
      detail.type = 'unSelf';
      var option = {};
      this.triggerEvent('tapitem', detail, option)
    },
  }
})
