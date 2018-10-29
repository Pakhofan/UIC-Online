//index.js
//获取应用实例
const app = getApp();
var WxSearch = require('../../wxSearch/wxSearch.js');

Page({
  data: {
    tabs: ["全部", "树洞", "广场"],
    stv: {
      windowWidth: 0,
      lineWidth: 0,
      offset: 0,
      tStart: false
    },
    activeTab: 0,
    cards: [],
    webpCode: '!/format/webp',
    anonymousAvatarUrl: 'https://cloud-minapp-20256.cloud.ifanrusercontent.com/1g4MkWmjmCtMquLU.png!/format/webp',
    likeCache: [],
    pullingCards: false,
    toLower: false,
    liking: false,
  },
  onLoad: function(options) {

    if (options.scene) {

      var scene = decodeURIComponent(options.scene)
      console.log(scene)
      parames = scene.split("_")
      if (parames[0] == 'detail') {
        url = "/pages/detail/detail?id=" + parames[1]
      }
      wx.navigateTo({
        url: url
      })
    }

    var that = this;
    //初始化的时候渲染wxSearchdata
    WxSearch.init(that, 43, ['weappdev', '小程序', 'wxParse', 'wxSearch', 'wxNotification']);
    WxSearch.initMindKeys(['weappdev.com', '微信小程序开发', '微信开发', '微信小程序']);

    console.log(getCurrentPages());
  },
  onReady: function(option) {},
  onShow: function(option) {},


  // test share to friend
  onShareAppMessage: function(ops) {
    if (ops.from === 'button') {
      // 来自页面内转发按钮
      console.log("xxx" + ops.target)
      console.log(ops.target.dataset.cardid)
      var cardid = ops.target.dataset.cardid;
      var text = ops.target.dataset.text;
    }
    return {
      title: text,
      path: 'pages/detail/detail?id=' + cardid,
      success: function(res) {
        // 转发成功
        console.log("转发成功:" + JSON.stringify(res));
      },
      fail: function(res) {
        // 转发失败
        console.log("转发失败:" + JSON.stringify(res));
      }
    }

  },


  wxSearchFn: function(e) {
    var that = this
    WxSearch.wxSearchAddHisKey(that);
    console.log(that.data.keywords)
    wx.navigateTo({
      url: '../search/search?keywords=' + that.data.keywords,
    })
  },
  wxSearchInput: function(e) {
    var that = this
    WxSearch.wxSearchInput(e, that);
    that.setData({
      keywords: e.detail.value
    })
  },
  wxSerchFocus: function(e) {
    var that = this
    WxSearch.wxSearchFocus(e, that);
  },
  wxSearchBlur: function(e) {
    var that = this
    WxSearch.wxSearchBlur(e, that);
  },
  wxSearchKeyTap: function(e) {
    var that = this
    WxSearch.wxSearchKeyTap(e, that);
  },
  wxSearchDeleteKey: function(e) {
    var that = this
    WxSearch.wxSearchDeleteKey(e, that);
  },
  wxSearchDeleteAll: function(e) {
    var that = this;
    WxSearch.wxSearchDeleteAll(that);
  },
  wxSearchTap: function(e) {
    var that = this
    WxSearch.wxSearchHiddenPancel(that);
  },
})