//app.js
const util = require('utils/util.js')
App({
  onLaunch: function() {
    wx.BaaS = requirePlugin('sdkPlugin')
    //让插件帮助完成登录、支付等功能
    wx.BaaS.wxExtend(wx.login,
      wx.getUserInfo,
      wx.requestPayment)

    wx.BaaS.init('0b7b864c097b1f73630b')
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        console.log("wx.login success")
        // 发送 res.code 到后台换取 openId, sessionKey, unionId

      }
    })

    // 微信用户登录小程序
    wx.BaaS.login(false).then(res => {
      console.log("wx.BaaS.login success")
      // 登录成功
    }, res => {
      // 登录失败
    })

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo;

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })

    wx.getSystemInfo({
      success: res => {
        this.globalData.statusBarHeight = res.statusBarHeight
        this.globalData.platform = res.platform
      }
    })
  },
  onShow: function(res) {
    util.pullLikedList()
    switch (res.scene) {
      case 1007:
        this.globalData.scene = 1007
        break;
      case 1008:
        this.globalData.scene = 1008
        break;
      default:
        this.globalData.scene = 1000;
    }
  },
  globalData: {
    userInfo: null,
    userId: null,
    BaaSAvatar: null,
    platform: null,
    infoConfirm: false,
  }
})