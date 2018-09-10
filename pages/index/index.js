//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    dataSet: [{
        id: '1',
        content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ',
        backgroundColor: '#6a8',
        fontColor: '#6a8',
        time: 1533106010,
        likedCount: 0,
        liked: false,
        user: {
          avatar: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1536490263336&di=e3171a8c5aff5a6044488a45c574f8f3&imgtype=0&src=http%3A%2F%2Fimg3.duitang.com%2Fuploads%2Fitem%2F201409%2F10%2F20140910202407_vZFfJ.jpeg',
          username: 'MS Car',
          userId: '1'
        }
      },
      {
        id: '2',
        content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ',
        fontColor: '#fff',
        backgroundColor: '#f4b',
        time: 1533106010,
        likedCount: 0,
        liked: false,
        user: {
          avatar: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1536490234935&di=59e3abdd861579e8f3109fd1f2c2993f&imgtype=0&src=http%3A%2F%2Fwww.feizl.com%2Fupload2007%2Fallimg%2F170726%2F1940255V6-14.jpg',
          username: 'Minya Chan',
          userId: '1'
        }
      }
    ],
    testImg: "https://ss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=3537273527,3254803069&fm=26&gp=0.jpg"
  },
  onLoad: function() {},
  viewImage: function (event) {
    var currentSrc = event.currentTarget.dataset.src;
    console.log("data is " + currentSrc);
    wx.previewImage({
      current: '', // 当前显示图片的http链接
      urls: [currentSrc] // 需要预览的图片http链接列表
    })
  }
})