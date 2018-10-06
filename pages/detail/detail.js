// pages/detail/detail.js

const app = getApp()
const util = require('../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    testImg: "https://ss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=3537273527,3254803069&fm=26&gp=0.jpg",
    webpCode: '!/format/webp',
    anonymousAvatarUrl: 'https://cloud-minapp-20256.cloud.ifanrusercontent.com/1g4MkWmjmCtMquLU.png',
    text: '',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    ishidename: true,
    comments: [],
    showHomeButton: false,
    autoFocus: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(option) {
    console.log(option)
    if (option.type == 'comment') {
      console.log('comment!')
      this.setData({
        autoFocus: true
      })
    }
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }

    var currentId = option.id;
    this.setData({
      currentId: currentId
    });
    //从index传入的cardID
    console.log(currentId)
    this.pullCard(currentId)
    this.pullComments()
  },
  onShow: function(option) {
    var sceneNum = app.globalData.scene
    if (sceneNum == 1007 || sceneNum == 1008) {
      this.setData({
        showHomeButton: true,
        autoFocus: true
      })
    } else {
      this.setData({
        showHomeButton: false
      })
    }
  },
  getUserInfo: function(e) {
    var id = 0
    wx.BaaS.handleUserInfo(e).then(res => {
      console.log('！！！！')
      id = res.id
      let MyUser = new wx.BaaS.User()
      MyUser.get(id).then(res => {
        console.log(res.data)
        //这里获取到的是云端数据
        app.globalData.BaaSAvatar = res.data.avatar
        wx.setStorageSync('BaaSAvatar', res.data.avatar)
        // success
      }, err => {
        // err
      })
      app.globalData.userId = id
      wx.setStorageSync('userId', id)
      // res 包含用户完整信息
    }, res => {
      // **res 有两种情况**：用户拒绝授权，res 包含基本用户信息：id、openid、unionid；其他类型的错误，如网络断开、请求超时等，将返回 Error 对象（详情见下方注解）
    })
    app.globalData.userInfo = e.detail.userInfo
    if (e.detail.userInfo) {
      this.setData({
        userInfo: e.detail.userInfo,
        hasUserInfo: true,
      })
    }
  },

  viewImage: function(event) {
    var currentSrc = event.currentTarget.dataset.src;
    var srcList = event.currentTarget.dataset.list;
    console.log("data is " + currentSrc);
    wx.previewImage({
      current: currentSrc, // 当前显示图片的http链接
      urls: srcList // 需要预览的图片http链接列表
    })
  },
  viewProfile: function(event) {
    var userId = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: "../profile/profile?id=" + userId
    })

  },
  pullCard: function(cardID) {

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
  pullComments: function() {
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

  },

  userInput: function(e) {
    this.setData({
      hasuserInput: true,
      text: e.detail.value,
    });
  },
  switch1Change: function(e) {
    this.setData({
      ishidename: e.detail.value,
    })
  },
  onSendTap: function(e) {
    this.showModal()
  },
  showModal: function() {
    var that = this;
    wx.showModal({
      title: "发布确认",
      content: "确定发布此条评论吗",
      showCancel: "True",
      cancelText: "取消",
      cancelcolor: "#666",
      confirmText: "确认",
      confirmColor: "#333",
      success: function(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '上传中',
          });
          that.pushComment()
        }
      },
    })
  },
  pushComment: function() {
    var that = this
    let tableID = 52142
    let SendProduct = new wx.BaaS.TableObject(tableID)
    let sendproduct = SendProduct.create()
    let data = {
      parent_id: this.data.currentId,
      text: this.data.text,
      creator_name: this.data.userInfo.nickName,
      creator_avatar: wx.getStorageSync('BaaSAvatar'),
      status: this.data.ishidename ? 1 : 0
    }
    console.log(data.imgs)
    sendproduct.set(data)
    sendproduct.save().then(res => {
      console.log(res)
      that.addCommentCount()
      wx.showToast({
        title: "发布成功",
        duration: 1000,
        icon: "success",
      })
      that.clearData()
      that.pullComments()
      wx.hideLoading({})
    }, err => {})
  },

  addCommentCount: function() {
    let tableID = 52108
    let recordID = this.data.currentId

    let Comment = new wx.BaaS.TableObject(tableID)
    let comment = Comment.getWithoutData(recordID)

    comment.incrementBy('comment_count', 1)
    comment.update().then(res => {
      console.log(res)
      // success
    }, err => {
      // err
    })
  },

  clearData: function() {
    this.setData({
      text: '',
    });
  },

  backToIndex: function() {
    console.log('backToIndex')
    console.log(getCurrentPages())
    wx.switchTab({
      url: "../index/index"
    })
    app.globalData.scene = 1000
    //重置场景参数
  }

})