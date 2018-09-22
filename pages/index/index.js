//index.js
//获取应用实例
const app = getApp();
const util = require('../../utils/util.js')
var sliderWidth = 96;

Page({
  data: {
    tabs: ["全部", "树洞", "广场"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    testImg: "https://ss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=3537273527,3254803069&fm=26&gp=0.jpg",
    cards:[]
  },
  onLoad: function() {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
        });
      }
    });
    this.pullCards();
  },
  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
  },
  viewImage: function (event) {
    var currentSrc = event.currentTarget.dataset.src;
    var srcList = event.currentTarget.dataset.list;
    console.log("data is " + currentSrc);
    wx.previewImage({
      current: currentSrc, // 当前显示图片的http链接
      urls: srcList // 需要预览的图片http链接列表
    })
  },
  viewProfile: function (event) {
    var userId = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: "../profile/profile?id=" + userId
    })

  },
  viewDetail: function (event) {
    var cardId = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: "../detail/detail?id=" + cardId
    })
  },
  pullCards: function () {
    var Card = new wx.BaaS.TableObject(52108)

    var query = new wx.BaaS.Query()
    query.compare('status', '<', 2)

    Card.setQuery(query).limit(10).offset(0).orderBy('-created_at').find().then(res => {
      console.log(res.data);
      var cardList = res.data.objects;
      console.log(cardList[0].created_at);
      for (var i = 0; i < cardList.length; i ++){
        console.log(i);
        cardList[i].created_at = util.formatTime(cardList[i].created_at, 'Y-M-D h:m:s')
      }
      this.setData({
        cards: cardList
      });
      // success
    }, err => {
      // err
    })
  }
})