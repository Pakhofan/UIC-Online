// pages/me/me.js
const app = getApp()
Page({
  //hello
  /**
   * 页面的初始数据
   */

  data: {
    disabledWX: false,
    ChangeWX: true,
  },

  onShow: function() {

  },

  onChangeWX: function() {
    var ChangeWX = this.data.ChangeWX
    if (ChangeWX) {
      this.showModal()
    }
    else{
      this.setData({
        ChangeWX: !this.data.ChangeWX
      })
    }
  },

  //信息更新确认弹出框
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
            ChangeWX: !that.data.ChangeWX,
            disabledWX: !that.data.disabledWX,
          })
          that.information_update()
        }
      },
    })
  },
  //信息更新
  information_update: function() {
    let MyUser = new wx.BaaS.User()
    let currentUser = MyUser.getCurrentUserWithoutData()
    let userdata = {
      wechat_id: this.data.textWX,
      phone_number: this.data.textPhone,
    }
    currentUser.set(userdata).update().then(res => {
      // success
    }, err => {
      // err
    })

  },

  //微信号输入
  userInputWX: function(e) {
    this.setData({
      textWX: e.detail.value,
    })
  },
  //手机号输入
  userInputPhone: function(e) {
    this.setData({
      textPhone: e.detail.value.replace(/[^\d]/g, ''),
    })
  },
})