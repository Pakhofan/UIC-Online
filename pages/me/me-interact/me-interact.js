// pages/me/me-interact/me-interact.js
Page({

  /**
   * 页面的初始数据
   */
  data: {},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var userId = wx.getStorageSync('userId')
    console.log(userId)
    this.pullConfirm()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  pullConfirm: function() {
    let userId = wx.getStorageSync('userId')
    let tableID = 56190
    let confirmPro = new wx.BaaS.TableObject(tableID)
    let query = new wx.BaaS.Query()
    query.compare('to_id', '=', userId) //记得要将数字改成userId哦！！！！！！！！！！
    confirmPro.setQuery(query).find().then(res => {
      // success
      let confirmInfo = res.data.objects
      console.log(confirmInfo)
      if (confirmInfo.length) {
        this.setData({
          confirmInfo: confirmInfo
        })
      }
      else{
        this.setData({
          confirmInfo: false
        })
      }
    }, err => {
      // err
    })
  },

  confirmPass: function(e) {
    //var that = this
    var confirmInfo = this.data.confirmInfo
    let tableID = 56190
    console.log(confirmInfo)
    var recordID = e.currentTarget.dataset.passid
    console.log(recordID)
    let ConfirmRecord = new wx.BaaS.TableObject(tableID)
    let confirmRecord = ConfirmRecord.getWithoutData(recordID)
    confirmRecord.set('status', 1)
    confirmRecord.update().then(res => {
      // success
      this.pullConfirm()
    }, err => {
      // err
    })
  },

  confirmdelete: function(e){
    let tableID = 56190
    var recordID = e.currentTarget.dataset.passid
    let Delete = new wx.BaaS.TableObject(tableID)
    Delete.delete(recordID).then(res => {
      // success
      this.pullConfirm()
    }, err => {
      // err
    })
  }


})