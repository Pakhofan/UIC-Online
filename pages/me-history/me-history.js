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