// pages/profile/profile.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    passConfirm: false,
    status: 0,
    confirmInfo: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(option) {
    this.setData({
      cardId: parseInt(option.id),
      userId: wx.getStorageSync('userId'),
    })
    var currentId = option.id;
    var userId = wx.getStorageSync('userId')
    //从index传入的userID
    console.log(currentId)
    console.log(wx.getStorageSync('userId'))
    this.pullProfile(currentId)
    this.pullRequest(userId)
    this.pullConfirm()
  },

  pullProfile: function(cardId) {
    let user = new wx.BaaS.User()
    user.get(cardId).then(res => {
      console.log(res.data);
      this.setData({
        profile: res.data
      });
      // success
    }, err => {
      // err
    })
  },

  pullRequest: function(userId){
    let user = new wx.BaaS.User()
    user.get(userId).then(res => {
      console.log(res.data);
      this.setData({
        userProfile: res.data
      });
      // success
    }, err => {
      // err
    })
  },

  inputConfirmText: function(e) {
    this.setData({
      ConfirmText: e.detail.value,
    })
  },

  confirmSend: function() {
    this.showModal()
    console.log(this.data.waitConfirm)
  },

  showModal: function() {
    var that = this;
    if (this.data.ConfirmText) {
      var ConfirmText = this.data.ConfirmText
    } else {
      var ConfirmText = "无"
    }
    wx.showModal({
      title: "确认发送请求",
      content: "确认此次发送，发送信息为：" + ConfirmText,
      showCancel: "True",
      cancelText: "取消",
      cancelcolor: "#666",
      confirmText: "确认",
      confirmColor: "#333",
      success: function(res) {
        if (res.confirm) {
          that.sendConfirm()
        }
      },
    })
  },

  sendConfirm: function() {
    var userProfile = this.data.userProfile
    var that = this
    var requestorId = this.data.userId
    var receiverId = this.data.cardId
    if (this.data.ConfirmText) {
      var ConfirmText = this.data.ConfirmText
    } else {
      var ConfirmText = "无"
    }
    let tableID = 56190
    let confirmProduct = new wx.BaaS.TableObject(tableID)
    let confirmproduct = confirmProduct.create()
    let data = {
      from_id: requestorId,
      to_id: receiverId,
      confirmText: ConfirmText,
      status: 0,
      to_avatar: userProfile.avatar,
      to_nickname: userProfile.nickname
    }
    confirmproduct.set(data)
    confirmproduct.save().then(res => {
      console.log(res.data.id)
      wx.showToast({
        title: "发送请求成功",
        duration: 1000,
        icon: "success",
      })
      that.clearData()
      that.pullConfirm()
    }, err => {})
  },

  clearData: function() {
    this.setData({
      ConfirmText: "",
    })
  },

  pullConfirm: function() {
    var receiverId = this.data.cardId
    let tableID = 56190
    let confirmPull = new wx.BaaS.TableObject(tableID)
    let query = new wx.BaaS.Query()
    query.compare('to_id', '=', receiverId)
    confirmPull.setQuery(query).find().then(res => {
      // success
      let confirmInfo = res.data.objects
      if (confirmInfo.length != 0) {
        this.setData({
          confirmInfo: confirmInfo
        })
      }else{
        this.setData({
          confirmInfo: false
        })
      }
    }, err => {
      // err
    })
  }

})