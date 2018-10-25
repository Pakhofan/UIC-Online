// pages/test/test.js
Page({

  /**
   * Page initial data
   */
  data: {
    /* action-sheet */
    visible: false,
    actions: [{
        name: '选项1',
      },
      {
        name: '选项2'
      }
      
    ],
  },
  openActionSheet() {
    this.setData({
      visible: true
    });
  },

  closeActionSheet() {
    this.setData({
      visible: false
    });
  },
  handleClickItem({
    detail
  }) {
    const index = detail.index + 1;
    console.log("click item ：" + index)
    // $Message({
    //   content: '点击了选项' + index
    // });
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function(options) {

  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function() {

  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function() {

  },

  /**
   * Lifecycle function--Called when page hide
   */
  onHide: function() {

  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload: function() {

  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function() {

  },

  /**
   * Called when page reach bottom
   */
  onReachBottom: function() {

  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage: function() {

  }
})