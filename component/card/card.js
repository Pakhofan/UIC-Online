// component/card/card.js
const app = getApp();
const util = require('../../utils/util.js')
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    //注意：在 properties 定义段中，属性名采用驼峰写法（propertyName）；
    //在 wxml 中，指定属性值时则对应使用连字符写法（component-tag-name property-name="attr value"），应用于数据绑定时采用驼峰写法（attr="{{propertyName}}"）。
    card: { // 属性名
      type: Object,
      observer: function(newVal, oldVal, changedPath) {
        if (newVal != oldVal && oldVal != null) {
          this.updateLikedCard()
        }
        // 属性被改变时执行的函数（可选），也可以写成在methods段中定义的方法名字符串, 如：'_propertyChange'
        // 通常 newVal 就是新设置的数据， oldVal 是旧数据
      }
    },
    size: { 
      type: String, // "small" 或者 "normal"
      value: 'normal', // 属性初始值
      observer: function (newVal, oldVal, changedPath) {
      }
    },


  },

  /**
   * 组件的初始数据
   */
  data: {
    webpCode: '!/format/webp',
  },

  lifetimes: {
    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    created: function() {
      //此时不能调用 setData
    },
    attached: function() {
      if (app.globalData.platform == 'ios') {
        this.setData({
          webpCode: ''
        })
      }
      console.log(this.properties.size)
      this.setData({
        size: this.properties.size
      })
    },
    ready: function() {
      this.updateLikedCard()
    },
  },

  pageLifetimes: {
    // 组件所在页面的生命周期函数
    show: function() {
      console.log("cardshow")
      this.updateLikedCard()
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
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
    tapComment: function(event) {
      var cardId = event.currentTarget.dataset.id;
      wx.navigateTo({
        url: "../detail/detail?id=" + cardId + "&type=comment"
      })
    },
    tapLike: function(event) {
      if (this.data.liking) {
        return
      }
      wx.vibrateShort({})
      this.setData({
        liking: true
      });
      console.log('tapLike')
      var cardId = event.currentTarget.dataset.id;
      var card = this.data.card
      card.currUserLiked = true
      card.like_count++;
      this.setData({
        card: card
      });
      this.pushLike(cardId)
      var that = this
      setTimeout(function() {
        that.setData({
          liking: false
        });
      }, 1000)
    },
    tapUnlike: function(event) {
      if (this.data.liking) {
        return
      }
      wx.vibrateShort({})
      this.setData({
        liking: true
      });
      console.log('tapUnlike')
      var cardId = event.currentTarget.dataset.id;
      var card = this.data.card
      card.currUserLiked = false
      card.like_count--;
      this.setData({
        card: card
      });
      this.deleteLike(cardId)
      var that = this
      setTimeout(function() {
        that.setData({
          liking: false
        });
      }, 1000)
    },
    pushLike: function(cardId) {
      console.log('Like++')
      var that = this
      let tableID = 52143
      let Like = new wx.BaaS.TableObject(tableID)
      let like = Like.create()
      let data = {
        to_id: cardId,
      }
      like.set(data)
      like.save().then(res => {
        //console.log(res)
        that.pushLikeCount(cardId, 1)
      }, err => {})
    },
    deleteLike: function(cardId) {
      console.log('Like--')
      var that = this
      let tableID = 52143
      let currentId = wx.getStorageSync('userId')
      let MyTableObject = new wx.BaaS.TableObject(tableID)
      let query = new wx.BaaS.Query()
      query.compare('created_by', '=', currentId)
      query.compare('to_id', '=', cardId)
      MyTableObject.limit(10).offset(0).delete(query).then(res => {
        //console.log(res)
        that.pushLikeCount(cardId, -1)
      }, err => {

      })
    },
    pushLikeCount: function(cardId, num) {
      util.pullLikedList()
      let tableID = 52108
      let recordID = cardId
      let Comment = new wx.BaaS.TableObject(tableID)
      let comment = Comment.getWithoutData(recordID)
      comment.incrementBy('like_count', num)
      comment.update().then(res => {
        //console.log(res)
        // success
      }, err => {
        // err
      })
    },
    updateLikedCard: function() {
      //console.log("updateLikedCard")
      var card = this.data.card
      var likedList = wx.getStorageSync('likedList')
      if (likedList) {
        for (var i = 0; i < likedList.length; i++) {
          var likedCardId = likedList[i].to_id
          if (card.id == likedCardId) {
            card.currUserLiked = true
          }
        }
      }
      this.setData({
        card: card
      });
    },
    tapLabel: function(e) {
      console.log(e)
      wx.navigateTo({
        url: '../search/search?keywords=' + e.currentTarget.dataset.label,
      })
    }
  },
})