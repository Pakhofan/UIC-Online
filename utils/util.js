function formatTime(timestamp, format) {
  const formateArr = ['Y', 'M', 'D', 'h', 'm', 's'];
  let returnArr = [];
  //let date = new Date(timestamp); //13位的时间戳
  let date = new Date(timestamp * 1000) //10位的时间戳
  let year = date.getFullYear()
  let month = date.getMonth() + 1
  let day = date.getDate()
  let hour = date.getHours()
  let minute = date.getMinutes()
  let second = date.getSeconds()
  returnArr.push(year, month, day, hour, minute, second);
  returnArr = returnArr.map(formatNumber);
  for (var i in returnArr) {
    format = format.replace(formateArr[i], returnArr[i]);
  }
  return format;
}

function calculatedFormatTime(timestamp, format) {
  const formateArr = ['Y', 'M', 'D', 'h', 'm', 's'];
  let returnArr = [];
  var nowDate = new Date();
  var nowTimestamp = Date.parse(new Date());
  //let date = new Date(timestamp); //13位的时间戳
  let date = new Date(timestamp * 1000) //10位的时间戳
  let timestampGap = nowTimestamp - timestamp * 1000
  //console.log(timestampGap)
  let year = date.getFullYear()
  let month = date.getMonth() + 1
  let day = date.getDate()
  let hour = date.getHours()
  let minute = date.getMinutes()
  let second = date.getSeconds()

  if (timestampGap < 60000) {
    // 1 minute
    return "刚刚"
  } else {
    if (timestampGap < 900000) {
      // 15 minutes
      return "几分钟前"
    } else {
      if (timestampGap < 2700000) {
        // 45 minutes
        return "半小时前"
      } else {
        if (timestampGap < 5400000) {
          // 1.5 hours
          return "1小时前"
        } else {
          if (timestampGap < 9000000) {
            // 2.5 hours
            return "2小时前"
          } else {
            if (nowDate.getDate() - day == 0 && timestampGap < 86400000) {
              var format = "h:m"
              //console.log("今天")
              const formateArr = ['h', 'm'];
              returnArr.push(hour, minute);
              returnArr = returnArr.map(formatNumber);
              for (var i in returnArr) {
                format = format.replace(formateArr[i], returnArr[i]);
              }
              return "今天 " + format;
            } else {
              if (nowDate.getDate() - day == 1 && timestampGap < 172800000) {
                var format = "h:m"
                //console.log("昨天")
                const formateArr = ['h', 'm'];
                returnArr.push(hour, minute);
                returnArr = returnArr.map(formatNumber);
                for (var i in returnArr) {
                  format = format.replace(formateArr[i], returnArr[i]);
                }
                return "昨天" + format;
              } else {
                if (nowDate.getFullYear() - year == 0) {
                  var format = "M-D h:m"
                  const formateArr = ['M', 'D', 'h', 'm'];
                  returnArr.push(month, day, hour, minute);
                  returnArr = returnArr.map(formatNumber);
                  for (var i in returnArr) {
                    format = format.replace(formateArr[i], returnArr[i]);
                  }
                  return format;
                } 
              }
            }
          }
        }
      }
    }
  }
  returnArr.push(year, month, day, hour, minute, second);
  returnArr = returnArr.map(formatNumber);
  for (var i in returnArr) {
    format = format.replace(formateArr[i], returnArr[i]);
  }
  return format;
}
const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}


function pullLikedList() {
  //更新点赞缓存
  var that = this
  let currentId = wx.getStorageSync('userId')
  var Like = new wx.BaaS.TableObject(52143)

  let query = new wx.BaaS.Query()
  query.compare('created_by', '=', currentId)

  Like.setQuery(query).find().then(res => {
    //console.log(res.data);
    var likedList = res.data.objects;
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

}

module.exports = {
  formatTime: formatTime,
  calculatedFormatTime: calculatedFormatTime,
  pullLikedList: pullLikedList,
}