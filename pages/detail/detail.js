// pages/detail/detail.js

const app = getApp()
const util = require('../../utils/util.js')

Page({
    /**
     * 页面的初始数据
     */
    data: {
        testImg: "https://ss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=3537273527,3254803069&fm=26&gp=0.jpg",
        webpCode: '!/format/webp',
        anonymousAvatarUrl: 'https://cloud-minapp-20256.cloud.ifanrusercontent.com/1g4MkWmjmCtMquLU.png',
        text: '',
        userInfo: {},
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        ishidename: false,
        istreehole: false,
        comments: [],
        showHomeButton: false,
        autoFocus: false,
        liking: false,
        /* action-sheet */
        visible: false,
        actions: [{
                name: '生成海报',
            },
            {
                name: '我要投诉'
            },
            // {
            //   name: '去分享',
            //   icon: 'share',
            //   openType: 'share'
            // }
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

        if (index === 2) {
            let cardId = this.data.card.id
            let cardImg = this.data.card.imgs[0]
            let cardText = this.data.card.text
            let url = url = "/pages/report/report?cardId=" + cardId + "&cardImg=" + cardImg + "&cardText=" + cardText

            wx.navigateTo({
                url: url,
            })
        }

        // $Message({
        //   content: '点击了选项' + index
        // });
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(option) {
        console.log(option)
        if (option.type == 'comment') {
            console.log('comment!')
            this.setData({
                autoFocus: true
            })
        }
        if (app.globalData.userInfo) {
            this.setData({
                userInfo: app.globalData.userInfo,
                hasUserInfo: true
            })
        } else if (this.data.canIUse) {
            // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
            // 所以此处加入 callback 以防止这种情况
            app.userInfoReadyCallback = res => {
                this.setData({
                    userInfo: res.userInfo,
                    hasUserInfo: true
                })
            }
        } else {
            // 在没有 open-type=getUserInfo 版本的兼容处理
            wx.getUserInfo({
                success: res => {
                    app.globalData.userInfo = res.userInfo
                    this.setData({
                        userInfo: res.userInfo,
                        hasUserInfo: true
                    })
                }
            })
        }

        var currentId = option.id;
        this.setData({
            currentId: currentId
        });
        //从index传入的cardID
        console.log(currentId)
        this.pullCard(currentId)
        this.pullComments()
        if (app.globalData.platform == 'ios') {
            this.setData({
                webpCode: ''
            })
        }
    },
    onShow: function(option) {
        // var sceneNum = app.globalData.scene
        // if (sceneNum == 1007 || sceneNum == 1008) {}
        // 根据用户场景改界面（2018年10月18日22点53分）
        if (getCurrentPages().length == 1) {
            //页面路径为1时添加主页按钮
            this.setData({
                showHomeButton: true,
                autoFocus: false
            })
        } else {
            this.setData({
                showHomeButton: false
            })
        }
        this.pullLikedList();
    },
    getUserInfo: function(e) {
        var id = 0
        wx.BaaS.handleUserInfo(e).then(res => {
            console.log('！！！！')
            id = res.id
            let MyUser = new wx.BaaS.User()
            MyUser.get(id).then(res => {
                console.log(res.data)
                //这里获取到的是云端数据
                app.globalData.BaaSAvatar = res.data.avatar
                wx.setStorageSync('BaaSAvatar', res.data.avatar)
                // success
            }, err => {
                // err
            })
            app.globalData.userId = id
            wx.setStorageSync('userId', id)
            // res 包含用户完整信息
        }, res => {
            // **res 有两种情况**：用户拒绝授权，res 包含基本用户信息：id、openid、unionid；其他类型的错误，如网络断开、请求超时等，将返回 Error 对象（详情见下方注解）
        })
        app.globalData.userInfo = e.detail.userInfo
        if (e.detail.userInfo) {
            this.setData({
                userInfo: e.detail.userInfo,
                hasUserInfo: true,
            })
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
    pullCard: function(cardID) {

        let recordID = cardID

        var Card = new wx.BaaS.TableObject(52108)

        Card.get(recordID).then(res => {
            console.log(res.data);
            if (res.data.category == 0) {
                this.setData({
                    ishidename: true,
                    istreehole: true
                })
            }
            var card = res.data;
            card.created_at_format = util.calculatedFormatTime(card.created_at, 'Y-M-D h:m:s')
            this.setData({
                card: card
            });
            // success
        }, err => {
            // err
        })
    },
    pullComments: function() {
        let currentId = this.data.currentId
        var Comment = new wx.BaaS.TableObject(52142)

        let query = new wx.BaaS.Query()
        query.contains('parent_id', currentId)

        Comment.setQuery(query).find().then(res => {
            console.log(res.data);
            var commentList = res.data.objects;
            //console.log(commentList[0].created_at);
            for (var i = 0; i < commentList.length; i++) {
                console.log(i);
                commentList[i].created_at_format = util.calculatedFormatTime(commentList[i].created_at, 'Y-M-D h:m:s')
                commentList[i].floor = i + 1
            }
            this.setData({
                comments: commentList
            });
            // success
        }, err => {
            // err
        })

    },

    userInput: function(e) {
        this.setData({
            hasuserInput: true,
            text: e.detail.value,
        });
    },
    switch1Change: function(e) {
        this.setData({
            ishidename: e.detail.value,
        })
    },
    onSendTap: function(e) {
        this.showModal()
    },
    showModal: function() {
        var that = this;
        wx.showModal({
            title: "发布确认",
            content: "确定发布此条评论吗",
            showCancel: "True",
            cancelText: "取消",
            cancelcolor: "#666",
            confirmText: "确认",
            confirmColor: "#333",
            success: function(res) {
                if (res.confirm) {
                    wx.showLoading({
                        title: '上传中',
                    });
                    that.pushComment()
                }
            },
        })
    },
    pushComment: function() {
        var that = this
        let tableID = 52142
        let SendProduct = new wx.BaaS.TableObject(tableID)
        let sendproduct = SendProduct.create()
        let data = {
            parent_id: this.data.currentId,
            text: this.data.text,
            creator_name: this.data.userInfo.nickName,
            creator_avatar: wx.getStorageSync('BaaSAvatar'),
            status: this.data.ishidename ? 1 : 0
        }
        console.log(data.imgs)
        sendproduct.set(data)
        sendproduct.save().then(res => {
            console.log(res)
            that.addCommentCount()
            wx.showToast({
                title: "发布成功",
                duration: 1000,
                icon: "success",
            })
            that.clearData()
            that.pullComments()
            wx.hideLoading({})
        }, err => {})
    },

    addCommentCount: function() {
        let tableID = 52108
        let recordID = this.data.currentId

        let Comment = new wx.BaaS.TableObject(tableID)
        let comment = Comment.getWithoutData(recordID)

        comment.incrementBy('comment_count', 1)
        comment.update().then(res => {
            console.log(res)
            // success
        }, err => {
            // err
        })
    },

    clearData: function() {
        this.setData({
            text: '',
        });
    },

    // create qrcode
    createqrcode: function(e) {
        // console.log(e.currentTarget.dataset.id)
        const params = {
            scene: 'detail' + '_' + e.currentTarget.dataset.id,
            page: 'pages/index/index',
            width: 230
        }

        wx.BaaS.getWXACode('wxacodeunlimit', params).then(res => {
            this.setData({
                imageBase64: res.image
            })
            // console.log(res)

            wx.previewImage({
                urls: [res.image],
            })

        }).catch(err => {
            console.log(err)
            console.log("上线后才可以调用")
        })
    },

    backToIndex: function() {
        console.log('backToIndex')
        console.log(getCurrentPages())
        wx.switchTab({
            url: "../index/index"
        })
        app.globalData.scene = 1000
        //重置场景参数
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
            this.updateLikedObjects()
            // success
        }, err => {
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
        console.log(event)
        var card = this.data.card
        card.currUserLiked = true
        card.like_count++;
        this.setData({
            card: card
        });
        this.pushLike(this.data.currentId)
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
        wx.vibrateShort({})
        console.log('tapUnlike')
        console.log(event)
        var card = this.data.card
        card.currUserLiked = false
        card.like_count--;
        this.setData({
            card: card
        });
        this.deleteLike(this.data.currentId)
        var that = this
        setTimeout(function() {
            that.setData({
                liking: false
            });
        }, 1000)
    },
    pushLike: function(to_id) {
        console.log('Like++')
        var that = this
        let tableID = 52143
        let Like = new wx.BaaS.TableObject(tableID)
        let like = Like.create()
        let data = {
            to_id: to_id,
        }
        like.set(data)
        like.save().then(res => {
            //console.log(res)
            that.pushLikeCount(to_id, 1)
        }, err => {})
    },
    deleteLike: function(to_id) {
        console.log('Like--')
        var that = this
        let tableID = 52143
        let currentId = wx.getStorageSync('userId')
        let MyTableObject = new wx.BaaS.TableObject(tableID)
        let query = new wx.BaaS.Query()
        query.compare('created_by', '=', currentId)
        query.compare('to_id', '=', to_id)


        MyTableObject.limit(10).offset(0).delete(query).then(res => {
            //console.log(res)
            that.pushLikeCount(to_id, -1)
        }, err => {

        })
    },
    pushLikeCount: function(to_id, num) {
        let tableID = 52108
        let recordID = to_id

        let Object = new wx.BaaS.TableObject(tableID)
        let my_object = Object.getWithoutData(recordID)

        my_object.incrementBy('like_count', num)
        my_object.update().then(res => {
            //console.log(res)
            // success
        }, err => {
            // err
        })
    },
    updateLikedObjects: function() {
        var card = this.data.card
        var likedList = this.data.likedList
        var currentCardId = this.data.currentId
        if (likedList) {
            for (var i = 0; i < likedList.length; i++) {
                if (currentCardId == likedList[i].to_id) {
                    card.currUserLiked = true
                }
            }
        }
        this.setData({
            card: card
        });
    },

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

    tapComment: function(event) {
        this.setData({
            autoFocus: true
        })
    },

})