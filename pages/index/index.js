//index.js
//获取应用实例
const app = getApp();
var sliderWidth = 96;

Page({
  data: {
    tabs: ["全部", "树洞", "广场"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    testImg: "https://ss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=3537273527,3254803069&fm=26&gp=0.jpg"
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
  },
  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
  },
  viewImage: function (event) {
    var currentSrc = event.currentTarget.dataset.src;
    console.log("data is " + currentSrc);
    wx.previewImage({
      current: '', // 当前显示图片的http链接
      urls: [currentSrc] // 需要预览的图片http链接列表
    })
  },
  viewProfile: function (event) {
    wx.navigateTo({
      url: "../profile/profile"
    })

  },
  viewDetail: function (event) {
    wx.navigateTo({
      url: "../detail/detail"
    })

  }
})