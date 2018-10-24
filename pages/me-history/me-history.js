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
    pullingCards: false,
    toLower: false,
    liking: false,
  },
  onLoad: function(options) {
    this.setData({
      datatype: options.datatype
    })
    if (options.scene) {

      var scene = decodeURIComponent(options.scene)
      console.log(scene)
      parames = scene.split("_")
      if (parames[0] == 'detail') {
        url = "/pages/detail/detail?id=" + parames[1]
      }
      wx.navigateTo({
        url: url
      })
    }
    wx.showLoading({
      title: '加载中',
    });
    try {
      let {
        tabs
      } = this.data;
      var res = wx.getSystemInfoSync()
      this.setData({
        scrollViewHeight: res.windowHeight - 80
      })
      this.windowWidth = res.windowWidth;
      this.data.stv.lineWidth = (this.windowWidth / this.data.tabs.length) / 2;
      this.data.stv.windowWidth = res.windowWidth;
      this.setData({
        stv: this.data.stv
      })
      this.tabsCount = tabs.length;
    } catch (e) {}
    if (!this.data.pullingCards) {
      this.userLiked();
    }
    if (app.globalData.platform == 'ios') {
      this.setData({
        webpCode: ''
      })
    }
  },
  onReady: function(option) {
    setTimeout(function() {
      wx.hideLoading({});
    }, 500)
  },
  onShow: function(option) {
    var datatype = this.data.datatype
    setTimeout(function() {
      wx.hideLoading({});
    }, 500)
    if (datatype =="commment"){
      this.userComment();
    }
    if (datatype == 'send'){
      this.userSend();
    }
    this.userLiked();
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
        if (this.tapStartX - clientX > 15) {
          if (activeTab < this.tabsCount - 1) {
            this.setData({
              activeTab: ++activeTab
            })
          }
        } else if (this.tapStartX - clientX < -15) {
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
    //stv.tStart = false;
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
    if (!this.data.pullingCards) {
      this.userLiked();
    }
  },
  toUpperLoadCards: function() {
    console.log('!!!!!!!!!!!!!!!!!')
    if (!this.data.pullingCards) {
      this.userLiked();
    }
  },
  toLowerLoadCards: function() {
    console.log('################')
    if (!this.data.pullingCards) {
      this.userLiked();
    }
    this.setData({
      toLower: true
    });
  },
  onReachBottom: function() {
    if (!this.data.pullingCards) {
      this.userLiked();
    }
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
  pullCards: function(likelist) {
    this.setData({
      pullingCards: true
    });
    wx.showNavigationBarLoading({})
    var Card = new wx.BaaS.TableObject(52108)
    var datatype = this.data.datatype
    console.log(likelist)
    var query = new wx.BaaS.Query()
    query.compare('status', '<', 2)
    if(datatype == 'send'){
      query.in('created_by',likelist)
    }
    else{
    query.in('_id', likelist)
    }
    var cardLimit = this.data.cards.length + 10

    Card.setQuery(query).limit(cardLimit).offset(0).orderBy('-created_at').find().then(res => {
      console.log(res.data);
      var cardList = res.data.objects;
      //console.log(cardList[0].created_at);
      for (var i = 0; i < cardList.length; i++) {
        //console.log(i);
        cardList[i].created_at_format = util.calculatedFormatTime(cardList[i].created_at, 'Y-M-D h:m:s')
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
      this.setData({
        pullingCards: false
      });
      // success
    }, err => {
      setTimeout(function() {
        wx.hideNavigationBarLoading({})
      }, 500)
      this.setData({
        pullingCards: false
      });
      // err
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
  // setLikeCache: function(cardId, option) {
  //   //option 为1时设 likeCache[cardId] 为true
  //   var likeCache = this.data.likeCache
  //   if (option == 1) {
  //     likeCache[cardId] = true
  //   } else {
  //     likeCache[cardId] = false
  //   }
  //   this.setData({
  //     likeCache: likeCache
  //   });
  // },
  // mergeLikeList: function() {
  //   var that = this
  //   var likeCache = this.data.likeCache
  //   if (likeCache.length > 0) {
  //     for (var i = 0; i < likeCache.length; i++) {
  //       if (likeCache[i].value) {
  //         that.setData({
  //           likedList: that.data.likedList.concat(likeCache[i])
  //         });
  //       }
  //     }
  //   }
  //   this.updateLikedCards()
  // },
  updateLikedCards: function() {
    var cards = this.data.cards
    var likedList = this.data.Likedlist
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

  },

  userLiked: function() {
    console.log(this.data.datatype)
    let tableID = 52143
    let query = new wx.BaaS.Query()
    let currentId = wx.getStorageSync('userId')
    let userLike = new wx.BaaS.TableObject(tableID)
    let likeListId = []
    let datatype = this.data.datatype
    query.compare("created_by", "=", currentId)
    userLike.setQuery(query).find().then(res => {
      // success
      var Likedlist = res.data.objects;
      this.setData({
        Likedlist: Likedlist
      })
      this.updateLikedCards()
      if (datatype == 'like') {
        for (var i = 0; i < Likedlist.length; i++) {
          likeListId[i] = Likedlist[i].to_id
        }
        this.pullCards(likeListId)
        console.log(likeListId)
      }
    }, err => {
      // err
    })
  },

  userComment: function() {
    console.log(this.data.datatype)
    let tableID = 52142
    let query = new wx.BaaS.Query()
    let currentId = wx.getStorageSync('userId')
    let userComment = new wx.BaaS.TableObject(tableID)
    let CommentListId = []
    let datatype = this.data.datatype
    query.compare("created_by", "=", currentId)
    userComment.setQuery(query).find().then(res => {
      // success
      var Commentlist = res.data.objects;
      for (var i = 0; i < Commentlist.length; i++) {
        CommentListId[i] = Commentlist[i].parent_id
      }
      this.pullCards(CommentListId)
      console.log(CommentListId)
    }, err => {
      // err
    })
  },

  userSend: function(){
    var currentId = wx.getStorageSync('userId')
    let Idlist = []
    Idlist[0] = currentId
    this.pullCards(Idlist)
  }

})