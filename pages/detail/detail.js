// pages/detail/detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    testImg: "https://ss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=3537273527,3254803069&fm=26&gp=0.jpg",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () { },
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})