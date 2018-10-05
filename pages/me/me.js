// pages/me/me.js
const app = getApp()
Page({
  //hello
  /**
   * 页面的初始数据
   */

  data: {
    motto: 'Hello UIC',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    disabled_WX: false,
    Change_WX: true,
  },

  onShow: function() {
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
  },
  getUserInfo: function(e) {
    var id = 0
    wx.BaaS.handleUserInfo(e).then(res => {
      console.log('！！！！')
      console.log(res)
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
    if (e.detail.userInfo) {
      app.globalData.userInfo = e.detail.userInfo
      this.setData({
        userInfo: e.detail.userInfo,
        hasUserInfo: true,
      })
    }
    console.log(app.globalData.userInfo)
  },

  onChange_WX: function(e) {
    if (this.data.Change_WX) {
      this.showModal();
    } else {
      this.setData({
        Change_WX: !this.data.Change_WX,
        disabled_WX: !this.data.disabled_WX,
      })
    }
  },

  showModal: function() {
    var that = this;
    wx.showModal({
      title: "修改确认",
      content: "确认此次修改",
      showCancel: "True",
      cancelText: "取消",
      cancelcolor: "#666",
      confirmText: "确认",
      confirmColor: "#333",
      success: function(res) {
        if (res.confirm) {
          that.setData({
            Change_WX: !that.data.Change_WX,
            disabled_WX: !that.data.disabled_WX,
          })
          that.information_update()
        }
      },
    })
  },

  information_update: function() {
    let MyUser = new wx.BaaS.User()
    let currentUser = MyUser.getCurrentUserWithoutData()
    let userdata = {
      wechat_id: this.data.text_WX,
      phone_number: this.data.text_Phone,
    }
    currentUser.set(userdata).update().then(res => {
      // success
    }, err => {
      // err
    })

  },


  userInput_WX: function(e) {
    this.setData({
      text_WX: e.detail.value,
    })
  },
  userInput_Phone: function(e) {
    this.setData({
      text_Phone: e.detail.value.replace(/[^\d]/g, ''),
    })
  },

  Logout: function(){
    wx.BaaS.logout().then(res => {
      // success
    }, err => {
      // err
    })
    this.setData({
      hasUserInfo: false
    })
    app.globalData.userInfo = false
  }
})