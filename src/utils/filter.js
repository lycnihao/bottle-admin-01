import Vue from 'vue'
import moment from 'moment'
import 'moment/locale/zh-cn'
moment.locale('zh-cn')

Vue.filter('NumberFormat', function (value) {
  if (!value) {
    return '0'
  }
  const intPartFormat = value.toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,') // 将整数部分逢三一断
  return intPartFormat
})

Vue.filter('moment', function(dataStr, pattern = 'YYYY-MM-DD HH:mm') {
  return moment(dataStr).format(pattern)
})

Vue.filter('moment_post_date', function(dataStr, pattern = '/YYYY/M/') {
  return moment(dataStr).format(pattern)
})

Vue.filter('moment_post_day', function(dataStr, pattern = '/YYYY/M/D/') {
  return moment(dataStr).format(pattern)
})

Vue.filter('fileSizeFormat', function(value) {
  if (!value) {
    return '-'
  }
  var unitArr = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  var index = 0
  var srcsize = parseFloat(value)
  index = Math.floor(Math.log(srcsize) / Math.log(1024))
  var size = srcsize / Math.pow(1024, index)
  size = size.toFixed(2)
  return size + ' ' + unitArr[index]
})

Vue.filter('dayjs', function (dataStr, pattern = 'YYYY-MM-DD HH:mm:ss') {
  return moment(dataStr).format(pattern)
})

Vue.filter('moment', function (dataStr, pattern = 'YYYY-MM-DD HH:mm:ss') {
  return moment(dataStr).format(pattern)
})
