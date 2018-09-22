// pages/profile/profile.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (option) {
    var currentId = option.id;
    //从index传入的userID
    console.log(currentId)
    this.pullProfile(currentId)
  },

  pullProfile: function(userId) {
    let user = new wx.BaaS.User()
    user.get(userId).then(res => {
      console.log(res.data);
      this.setData({
        profile: res.data
      });
      // success
    }, err => {
      // err
    })
  },

})