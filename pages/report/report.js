// pages/report/report.js
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        testImg: "https://ss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=3537273527,3254803069&fm=26&gp=0.jpg",
        files: [],
        text: '',
        uploaderDisplay: 'inline',
        userInfo: {},
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        paths: [],
        isopen: false,

    },

    onLoad: function(option) {
        let cardId = option.cardId;
        let cardImg = option.cardImg;
        let cardText = option.cardText;
        this.setData({
            cardId: cardId,
            cardImg: cardImg,
            cardText: cardText
        });

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
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onShow: function(option) {

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

    userInput: function(e) {
        this.setData({
            text: e.detail.value,
        });
    },

    chooseImage: function(e) {
        var that = this;
        wx.chooseImage({
            sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            count: 6 - this.data.files.length,
            success: function(res) {
                // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                that.setData({
                    files: that.data.files.concat(res.tempFilePaths)
                });
                if (that.data.files.length >= 6) {
                    that.setData({
                        uploaderDisplay: 'none'
                    });
                }
            }
        })
    },
    previewImage: function(e) {
        wx.previewImage({
            current: e.currentTarget.id, // 当前显示图片的http链接
            urls: this.data.cardImg // 需要预览的图片http链接列表
        })
    },

    onSendTap: function(e) {
        this.showModal()
    },
    //发布确认弹出框
    showModal: function() {
        var that = this;
        wx.showModal({
            title: "提交确定",
            content: "确定投诉此信息吗？",
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
                    that.Files_upload()
                    that.uploadInterval()
                }
            },
        })
    },

    uploadInterval: function() {
        var that = this
        var intervalId = setInterval(function() {
            if (that.data.paths.length == that.data.files.length) {
                that.Information_upload()
                clearInterval(intervalId)
                wx.hideLoading({});
            }
        }, 1000)
    },
    //上传发布内容
    Information_upload: function() {

        var that = this
        let tableID = 55481
        let SendReport = new wx.BaaS.TableObject(tableID)
        let sendReport = SendReport.create()
        let data = {
            text: this.data.text,
            imgs: this.data.paths,
            creator_name: this.data.userInfo.nickName,
            card_id: this.data.cardId,
            status: 0,
        }

        console.log(data.imgs)
        sendReport.set(data)
        sendReport.save().then(res => {
            console.log(res)
            wx.showToast({
                title: "提交成功",
                duration: 1000,
                icon: "success",
            })
            that.clearData()
        }, err => {})
    },
    //清除数据
    clearData: function() {
        this.setData({
            text: '',
            paths: [],
            files: [],
        });
    },
    //图片上传
    Files_upload: function() {
        let MyFile = new wx.BaaS.File()
        for (var i = 0; i < this.data.files.length; ++i) {
            let fileParams = {
                filePath: this.data.files[i]
            }
            let metaData = {
                categoryName: 'imgs'
            }
            MyFile.upload(fileParams, metaData).then(res => {
                /*
                 * 注: 只要是服务器有响应的情况都会进入 success, 即便是 4xx，5xx 都会进入这里
                 * 如果上传成功则会返回资源远程地址,如果上传失败则会返回失败信息
                 */
                //console.log(res)
                var arr = [res.data.path] // res.data 为 Object 类型
                //this.data.paths.concat(arr)
                this.setData({
                    paths: this.data.paths.concat(arr)
                });

            }, err => {})
        }
    },

    //用户输入位置
    userInputPosition: function(e) {
        console.log(e.detail.value)
        this.setData({
            position: e.detail.value,
        })
    },

    viewSource: function() {
        let url = '/pages/detail/detail?id=' + this.data.cardId
        wx.redirectTo({
            url: url,
        })
        // wx.navigateBack({
        //     delta: 1
        // })
    }

})