// pages/detail/detail.js

const util = require('../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    testImg: "https://ss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=3537273527,3254803069&fm=26&gp=0.jpg",
    webpCode: '!/format/webp',
    anonymousAvatarUrl: 'https://cloud-minapp-20256.cloud.ifanrusercontent.com/1g4MkWmjmCtMquLU.png'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (option) {
    var currentId = option.id;
    this.setData({
      currentId: currentId
    });
    //从index传入的cardID
    console.log(currentId)
    this.pullCard(currentId)
    this.pullComments()
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
  pullCard: function (cardID) {

    let recordID = cardID

    var Card = new wx.BaaS.TableObject(52108)

    Card.get(recordID).then(res => {
      console.log(res.data);
      var card = res.data;
      card.created_at = util.formatTime(card.created_at, 'Y-M-D h:m:s')
      this.setData({
        card: card
      });
      // success
    }, err => {
      // err
    })
  },
  pullComments: function () {
    let currentId = this.data.currentId
    var Comment = new wx.BaaS.TableObject(52142)

    let query = new wx.BaaS.Query()
    query.contains('parent_id', currentId)

    Comment.setQuery(query).find().then(res => {
      console.log(res.data);
      var commentList = res.data.objects;
      //console.log(commentList[0].created_at);
      for (var i = 0; i < commentList.length; i++) {
        console.log(i);
        commentList[i].created_at = util.formatTime(commentList[i].created_at, 'Y-M-D h:m:s')
        commentList[i].floor = i + 1
      }
      this.setData({
        comments: commentList
      });
      // success
    }, err => {
      // err
    })

  }
})