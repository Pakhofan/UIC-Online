//index.js
//获取应用实例
const app = getApp();
const util = require('../../utils/util.js')
var sliderWidth = 96;

Page({
  data: {
    tabs: ["全部", "树洞", "广场"],
    stv: {
      windowWidth: 0,
      lineWidth: 0,
      offset: 0,
      tStart: false
    },
    activeTab: 0,
    cards: [],
    webpCode: '!/format/webp',
    anonymousAvatarUrl: 'https://cloud-minapp-20256.cloud.ifanrusercontent.com/1g4MkWmjmCtMquLU.png!/format/webp',
    likeCache: [],
  },
  onLoad: function(options) {
    wx.showLoading({
      title: '加载中',
    });
    try {
      let {
        tabs
      } = this.data;
      var res = wx.getSystemInfoSync()
      this.windowWidth = res.windowWidth;
      this.data.stv.lineWidth = (this.windowWidth / this.data.tabs.length) / 2;
      this.data.stv.windowWidth = res.windowWidth;
      this.setData({
        stv: this.data.stv
      })
      this.tabsCount = tabs.length;
    } catch (e) {}
    this.pullCards();
  },
  onReady: function(option) {
    this.pullLikedList();
    setTimeout(function() {
      wx.hideLoading({});
    }, 500)
  },
  onShow: function(option) {
    setTimeout(function() {
      wx.hideLoading({});
    }, 500)
  },
  handlerStart(e) {
    let {
      clientX,
      clientY
    } = e.touches[0];
    this.startX = clientX;
    this.tapStartX = clientX;
    this.tapStartY = clientY;
    this.data.stv.tStart = true;
    this.tapStartTime = e.timeStamp;
    this.setData({
      stv: this.data.stv
    })
  },
  handlerMove(e) {
    let {
      clientX,
      clientY
    } = e.touches[0];
    let {
      stv
    } = this.data;
    let offsetX = this.startX - clientX;
    this.startX = clientX;
    stv.offset += offsetX;
    if (stv.offset <= 0) {
      stv.offset = 0;
    } else if (stv.offset >= stv.windowWidth * (this.tabsCount - 1)) {
      stv.offset = stv.windowWidth * (this.tabsCount - 1);
    }
    this.setData({
      stv: stv
    });
  },
  handlerCancel(e) {

  },
  handlerEnd(e) {
    let {
      clientX,
      clientY
    } = e.changedTouches[0];
    let endTime = e.timeStamp;
    let {
      tabs,
      stv,
      activeTab
    } = this.data;
    let {
      offset,
      windowWidth
    } = stv;
    //快速滑动
    if (endTime - this.tapStartTime <= 500) {
      //向左
      if (Math.abs(this.tapStartY - clientY) < 75) {
        if (this.tapStartX - clientX > 5) {
          if (activeTab < this.tabsCount - 1) {
            this.setData({
              activeTab: ++activeTab
            })
          }
        } else if (this.tapStartX - clientX < -5) {
          if (activeTab > 0) {
            this.setData({
              activeTab: --activeTab
            })
          }
        }
        stv.offset = stv.windowWidth * activeTab;
      } else {
        //快速滑动 但是Y距离大于75 所以用户是左右滚动
        let page = Math.round(offset / windowWidth);
        if (activeTab != page) {
          this.setData({
            activeTab: page
          })
        }
        stv.offset = stv.windowWidth * page;
      }
    } else {
      let page = Math.round(offset / windowWidth);
      if (activeTab != page) {
        this.setData({
          activeTab: page
        })
      }
      stv.offset = stv.windowWidth * page;
    }
    stv.tStart = false;
    this.setData({
      stv: this.data.stv
    })
  },
  _updateSelectedPage(page) {
    let {
      tabs,
      stv,
      activeTab
    } = this.data;
    activeTab = page;
    this.setData({
      activeTab: activeTab
    })
    stv.offset = stv.windowWidth * activeTab;
    this.setData({
      stv: this.data.stv
    })
  },
  handlerTabTap(e) {
    this._updateSelectedPage(e.currentTarget.dataset.index);
    console.log('tab tap')
  },
  onPullDownRefresh: function() {
    this.pullCards();
  },
  toUpperLoadCards: function() {
    console.log('!!!!!!!!!!!!!!!!!')
    this.pullCards();
  },
  toLowerLoadCards: function() {
    console.log('################')
    this.pullCards();
  },
  onReachBottom: function() {
    this.pullCards();
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
  viewDetail: function(event) {
    if (event.target.dataset.tag != 'btn-sharetofriend') {
      var cardId = event.currentTarget.dataset.id;
      wx.navigateTo({
        url: "../detail/detail?id=" + cardId + "&type=normal"
      })
    }
  },
  tapComment: function(event) {
    var cardId = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: "../detail/detail?id=" + cardId + "&type=comment"
    })
  },
  pullCards: function() {
    wx.showNavigationBarLoading({})
    var Card = new wx.BaaS.TableObject(52108)

    var query = new wx.BaaS.Query()
    query.compare('status', '<', 2)

    var cardLimit = this.data.cards.length + 10

    Card.setQuery(query).limit(cardLimit).offset(0).orderBy('-created_at').find().then(res => {
      console.log(res.data);
      var cardList = res.data.objects;
      //console.log(cardList[0].created_at);
      for (var i = 0; i < cardList.length; i++) {
        console.log(i);
        cardList[i].created_at = util.formatTime(cardList[i].created_at, 'Y-M-D h:m:s')
      }
      this.setData({
        cards: cardList
      });
      wx.stopPullDownRefresh({
        success: res => {
          console.log(res)
        }
      })
      this.updateLikedCards()
      setTimeout(function() {
        wx.hideNavigationBarLoading({})
      }, 500)
      // success
    }, err => {
      setTimeout(function() {
        wx.hideNavigationBarLoading({})
      }, 500)
      // err
    })
  },
  pullLikedList: function() {
    var that = this
    let currentId = wx.getStorageSync('userId')
    var Like = new wx.BaaS.TableObject(52143)

    let query = new wx.BaaS.Query()
    query.compare('created_by', '=', currentId)

    Like.setQuery(query).find().then(res => {
      //console.log(res.data);
      var likedList = res.data.objects;
      this.setData({
        likedList: likedList
      });
      this.updateLikedCards()
      // success
    }, err => {
      // err
    })

  },
  tapLike: function(event) {
    wx.vibrateShort({})
    console.log('tapLike')
    var cardId = event.currentTarget.dataset.id;
    var cards = this.data.cards
    for (var j = 0; j < cards.length; j++) {
      if (cards[j].id == cardId) {
        cards[j].currUserLiked = true
        cards[j].like_count++
      }
    }
    this.setData({
      cards: cards
    });
    this.pushLike(cardId)
  },
  tapUnlike: function(event) {
    wx.vibrateShort({})
    console.log('tapUnlike')
    var cardId = event.currentTarget.dataset.id;
    var cards = this.data.cards
    for (var j = 0; j < cards.length; j++) {
      if (cards[j].id == cardId) {
        cards[j].currUserLiked = false
        cards[j].like_count--
      }
    }
    this.setData({
      cards: cards
    });
    this.deleteLike(cardId)
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
  setLikeCache: function(cardId, option) {
    //option 为1时设 likeCache[cardId] 为true
    var likeCache = this.data.likeCache
    if (option == 1) {
      likeCache[cardId] = true
    } else {
      likeCache[cardId] = false
    }
    this.setData({
      likeCache: likeCache
    });
  },
  mergeLikeList: function() {
    var that = this
    var likeCache = this.data.likeCache
    if (likeCache.length > 0) {
      for (var i = 0; i < likeCache.length; i++) {
        if (likeCache[i].value) {
          that.setData({
            likedList: that.data.likedList.concat(likeCache[i])
          });
        }
      }
    }
    this.updateLikedCards()
  },
  updateLikedCards: function() {
    var cards = this.data.cards
    var likedList = this.data.likedList
    if (likedList) {
      for (var i = 0; i < likedList.length; i++) {
        var likedCardId = likedList[i].to_id
        for (var j = 0; j < cards.length; j++) {
          if (cards[j].id == likedCardId) {
            cards[j].currUserLiked = true
          }
        }
      }
    }
    this.setData({
      cards: cards
    });
  },

  // test share to friend
  onShareAppMessage: function(ops) {
    if (ops.from === 'button') {
      // 来自页面内转发按钮
      console.log("xxx" + ops.target)
      console.log(ops.target.dataset.cardid)
      var cardid = ops.target.dataset.cardid;
      var text = ops.target.dataset.text;
    }
    return {
      title: text,
      path: 'pages/detail/detail?id=' + cardid,
      success: function(res) {
        // 转发成功
        console.log("转发成功:" + JSON.stringify(res));
      },
      fail: function(res) {
        // 转发失败
        console.log("转发失败:" + JSON.stringify(res));
      }
    }

  }


})