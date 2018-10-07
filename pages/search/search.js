var WxSearch = require('../../wxSearch/wxSearch.js');
var app = getApp();
  Page({
    data: {
      //keywords: "",
      //returnInfo: "",
      // wxSearchData:{
      //   view:{
      //     isShow: true
      //   }
      // }
    },
    onLoad: function () {
      console.log('onLoad');
      var that = this;
        //初始化的时候渲染wxSearchdata
        WxSearch.init(that, 43, ['weappdev', '小程序', 'wxParse', 'wxSearch', 'wxNotification']);
      WxSearch.initMindKeys(['weappdev.com', '微信小程序开发', '微信开发', '微信小程序']);
    },
    wxSearchFn: function (e) {
      var that = this
      WxSearch.wxSearchAddHisKey(that);
      console.log(that.data.keywords)
      that.queryInformation()
    },
    wxSearchInput: function (e) {
      var that = this
      WxSearch.wxSearchInput(e, that);
      that.setData({
        keywords: e.detail.value
      })
    },
    wxSerchFocus: function (e) {
      var that = this
      WxSearch.wxSearchFocus(e, that);
    },
    wxSearchBlur: function (e) {
      var that = this
      WxSearch.wxSearchBlur(e, that);
    },
    wxSearchKeyTap: function (e) {
      var that = this
      WxSearch.wxSearchKeyTap(e, that);
    },
    wxSearchDeleteKey: function (e) {
      var that = this
      WxSearch.wxSearchDeleteKey(e, that);
    },
    wxSearchDeleteAll: function (e) {
      var that = this;
      WxSearch.wxSearchDeleteAll(that);
    },
    wxSearchTap: function (e) {
      var that = this
      WxSearch.wxSearchHiddenPancel(that);
    },
    //查询信息
    queryInformation: function(){
      var that = this
      let tableID = 52108
      let TableInfo = new wx.BaaS.TableObject(tableID)
      let Query = new wx.BaaS.Query()
      Query.contains('text',this.data.keywords)
      TableInfo.setQuery(Query).find().then(res => {
        // success
        console.log(res.data.objects)
        this.setData({
          returnInfo: res.data.objects
        })
      }, err => {
        // err
      })
    }
  })
