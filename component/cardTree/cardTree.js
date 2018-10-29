// component/cardTree/cardTree.js
const app = getApp();
const util = require('../../utils/util.js')
var sliderWidth = 96;
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    displayTabs: { // 属性名
      type: Boolean, // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
      value: false, // 属性初始值（可选），如果未指定则会根据类型选择一个
      observer: function(newVal, oldVal, changedPath) {
        // 属性被改变时执行的函数（可选），也可以写成在methods段中定义的方法名字符串, 如：'_propertyChange'
        // 通常 newVal 就是新设置的数据， oldVal 是旧数据
      }
    },
    minusHeight: { //请传入组件上面所有内容的高度
      type: Number,
      value: 0,
      observer: function(newVal, oldVal, changedPath) {}
    },
    cardTreeType: { // 父页面类型，通常和cardsData一起提供
      type: String,
      value: "all", // search, like, comment
      observer: function(newVal, oldVal, changedPath) {}
    },
    cardsData: { // 外部是否提供cards数据
      type: Object,
      value: null,
      observer: function(newVal, oldVal, changedPath) {}
    },
    searchKeywords: {
      type: String,
      value: "", // search, like, comment
      observer: function(newVal, oldVal, changedPath) {}
    }
  },

  /**
   * 组件的初始数据
   */
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
    pullingCards: false,
    toLower: false,
    liking: false,
    firstLoading: true,
    scroll: true,
    scrollTop: 0,
    moving: false
  },

  lifetimes: {
    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    created: function() {
      if (this.properties.cardTreeType == "all") {
        if (!this.data.pullingCards) {
          this.pullCards();
        }
      }
    },
    attached: function() {
      try {
        let {
          tabs
        } = this.data;
        var res = wx.getSystemInfoSync()
        this.setData({
          scrollViewHeight: res.windowHeight - this.properties.minusHeight
        })
        this.windowWidth = res.windowWidth;
        this.data.stv.lineWidth = (this.windowWidth / this.data.tabs.length) / 2;
        this.data.stv.windowWidth = res.windowWidth;
        this.setData({
          stv: this.data.stv
        })
        this.tabsCount = tabs.length;
      } catch (e) {}
    },
    ready: function() {
      var that = this
      setTimeout(function() {
        that.setData({
          firstLoading: false
        })
      }, 3000)
    }
  },

  pageLifetimes: {
    // 组件所在页面的生命周期函数
    show: function() {
      console.log("cardTreeShow")
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    handlerStart(e) {
      let {
        clientX,
        clientY
      } = e.touches[0];
      this.startX = clientX;
      this.startY = clientY;
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
      let offsetY = this.startY - clientY;
      console.log(offsetY)
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
      //console.log(this.tapStartY - clientY)
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
      stv.tStart = false; //加这个会导致ios滑动僵硬
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
      wx.pageScrollTo({
        scrollTop: 0,
        duration: 300
      })
    },
    scrollViewY: function (e) {
      var that = this
      //console.log(e.detail.deltaY)
      let offectY = -e.detail.deltaY
      let minusHeight = this.properties.minusHeight
      let scrollTop = this.data.scrollTop
      var movingY = scrollTop;
      if (offectY > minusHeight - scrollTop) {
        movingY = minusHeight
      } else if (offectY < -scrollTop) {
        movingY = 0
      }
      if (movingY != scrollTop && !this.data.moving) {
        wx.pageScrollTo({
          scrollTop: movingY,
          duration: 300
        })
        this.setData({
          scrollTop: movingY,
          moving: true
        })
        setTimeout(function () {
          that.setData({
            moving: false
          })
        }, 300)
      }
    },
    toUpperLoadCards: function() {
      //console.log('!!!!!!!!!!!!!!!!!')
      if (!this.data.pullingCards && this.properties.cardTreeType == "all") {
        this.pullCards("up");
      }
    },
    toLowerLoadCards: function() {
      //console.log('################')
      if (!this.data.pullingCards && this.properties.cardTreeType == "all") {
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
      if (this.data.cards) {
        cardList = this.data.cards;
      }
      Card.setQuery(query).limit(cardLimit).offset(cardOffset).orderBy('-created_at').find().then(res => {
        console.log(res.data);
        if (option == "down") {
          cardList = cardList.concat(res.data.objects);
        } else {
          cardList = res.data.objects
        }
        //console.log(cardList[0].created_at);
        for (var i = 0; i < cardList.length; i++) {
          //console.log(i);
          cardList[i].created_at_format = util.calculatedFormatTime(cardList[i].created_at, 'Y-M-D h:m:s')
          if (cardList[i].text && cardList[i].text.length > 150) {
            cardList[i].longText = true
            cardList[i].formatText = cardList[i].text.substr(0, 120)
          }
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
    displayKeywords: function() {
      // not work
      var cards = this.properties.cardsData
      console.log(cards)
      let keywords = this.properties.searchKeywords
      let replaceString = '<span style="color: rgb(247, 150, 70);"><strong>' + keywords + '</strong></span>'
      for (var i = 0; i < cards.length; i++) {
        while (cards[i].text.indexOf(keywords) != -1) {
          cards[i].text = cards[i].text.replace(keywords, replaceString)
        }
      }
      this.setData({
        cardsData: []
      })
    },
  }
})