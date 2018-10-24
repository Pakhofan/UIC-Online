//index.js
//获取应用实例
const app = getApp();
const util = require('../../utils/util.js')
var sliderWidth = 96;
var WxSearch = require('../../wxSearch/wxSearch.js');

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
      this.pullCards();
    }
    if (app.globalData.platform == 'ios') {
      this.setData({
        webpCode: ''
      })
    }
    var that = this;
    //初始化的时候渲染wxSearchdata
    WxSearch.init(that, 43, ['weappdev', '小程序', 'wxParse', 'wxSearch', 'wxNotification']);
    WxSearch.initMindKeys(['weappdev.com', '微信小程序开发', '微信开发', '微信小程序']);

    console.log(getCurrentPages());
  },
  onReady: function(option) {
    setTimeout(function() {
      wx.hideLoading({});
    }, 500)
  },
  onShow: function(option) {
    this.pullLikedList();
    setTimeout(function() {
      wx.hideLoading({});
    }, 500)
    if (!this.data.pullingCards) {
      this.pullCards();
    }
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
  toUpperLoadCards: function() {
    //console.log('!!!!!!!!!!!!!!!!!')
    if (!this.data.pullingCards) {
      this.pullCards("up");
    }
  },
  toLowerLoadCards: function() {
    //console.log('################')
    if (!this.data.pullingCards) {
      this.pullCards("down");
    }
    this.setData({
      toLower: true
    });
  },
  viewDetail: function(event) {
    let x = event.detail.x;
    let windowWidth = wx.getSystemInfoSync().windowWidth
    let rightX = windowWidth * 14 / 15 / 3 - windowWidth / 18 + windowWidth / 26
    let leftX = windowWidth / 15 + windowWidth / 50
    // console.log(leftX, "-", rightX);
    // console.log(x)
    if (x > rightX || x < leftX) {
      if (event.target.dataset.tag != 'btn-sharetofriend') {
        var cardId = event.currentTarget.dataset.id;
        wx.navigateTo({
          url: "../detail/detail?id=" + cardId + "&type=normal"
        })
      }
    }
  },
  pullCards: function(option) {
    this.setData({
      pullingCards: true
    });
    wx.showNavigationBarLoading({})
    var Card = new wx.BaaS.TableObject(52108)
    var query = new wx.BaaS.Query()
    query.compare('status', '<', 2)
    var cardLimit = this.data.cards.length + 10
    var cardOffset = 0
    if (option == "up") {
      cardLimit = this.data.cards.length
    }
    if (option == "down") {
      cardLimit = 10
      cardOffset = this.data.cards.length
    }
    var cardList;
    if (this.data.cards){
      cardList = this.data.cards;
    }
    Card.setQuery(query).limit(cardLimit).offset(cardOffset).orderBy('-created_at').find().then(res => {
      console.log(res.data);
      if (option == "down") {
        cardList = cardList.concat(res.data.objects);
      }else{
        cardList = res.data.objects
      }
      //console.log(cardList[0].created_at);
      for (var i = 0; i < cardList.length; i++) {
        //console.log(i);
        cardList[i].created_at_format = util.calculatedFormatTime(cardList[i].created_at, 'Y-M-D h:m:s')
      }
      this.setData({
        cards: cardList
      });
      wx.stopPullDownRefresh({
        success: res => {
          //console.log(res)
        }
      })
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
      try {
        wx.setStorage({
          key: "likedList",
          data: likedList
        })
      } catch (e) {
        console.log(e);
      }
      // success
    }, err => {
      // err
    })

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


  wxSearchFn: function(e) {
    var that = this
    WxSearch.wxSearchAddHisKey(that);
    console.log(that.data.keywords)
    wx.navigateTo({
      url: '../search/search?keywords=' + that.data.keywords,
    })
  },
  wxSearchInput: function(e) {
    var that = this
    WxSearch.wxSearchInput(e, that);
    that.setData({
      keywords: e.detail.value
    })
  },
  wxSerchFocus: function(e) {
    var that = this
    WxSearch.wxSearchFocus(e, that);
  },
  wxSearchBlur: function(e) {
    var that = this
    WxSearch.wxSearchBlur(e, that);
  },
  wxSearchKeyTap: function(e) {
    var that = this
    WxSearch.wxSearchKeyTap(e, that);
  },
  wxSearchDeleteKey: function(e) {
    var that = this
    WxSearch.wxSearchDeleteKey(e, that);
  },
  wxSearchDeleteAll: function(e) {
    var that = this;
    WxSearch.wxSearchDeleteAll(that);
  },
  wxSearchTap: function(e) {
    var that = this
    WxSearch.wxSearchHiddenPancel(that);
  },
  //查询信息
  queryInformation: function() {
    var that = this
    let tableID = 52108
    let TableInfo = new wx.BaaS.TableObject(tableID)
    let Query = new wx.BaaS.Query()
    Query.contains('text', this.data.keywords)
    TableInfo.setQuery(Query).find().then(res => {
      // success
      console.log(res.data.objects)
      this.setData({
        returnInfo: res.data.objects
      })
    }, err => {
      // err
    })
  }


})