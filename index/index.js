// pages/set_network/set_network.js
const app = getApp()
const Sign = require("../utils/util.js")
// const setNet = require("../../utils/bluetooth.js")
Page({
  data: {
    startError: '',//初始化错误提示
    system: '', //版本号
    platform: '', //系统 android
    ssid: '',//wifi帐号(必填)
    pass: '',//无线网密码(必填)
    endError: '',//连接最后的提示
    sendMassage: [],// 发送蓝牙信息
    wifiOk: true, // WiFi配网是否成功
    deviceId: '',//蓝牙mac地址
    serviceId: '',//服务器特征值
    notify_id: '',
    write_id: '',//写特征值
    device_id: '',//设备号
    wifiFlag: true,// wifi防重标识
    netFlag: true,//开始配网防重标识
    count: 0,
    progress_txt: "正在配网"
  },
  onLoad() {
    let that = this;
    Sign.drawProgressbg();
    that.setData({ wifiFlag: true })
    // Sign.drawCircle(1) 
  },
  onShow: function () {
    var that = this;
    try {
      let deviceId = wx.getStorageSync('mac'), device_id = wx.getStorageSync('deviceNum'),
        ssid = wx.getStorageSync('ssid');
      that.setData({ device_id: device_id, deviceId: deviceId, ssid: ssid });
      console.log(device_id, '-----设备号-----');
      console.log(deviceId, '-----mac地址----')
    } catch (e) {

    }
    //检测手机型号
    wx.getSystemInfo({
      success: function (res) {
        console.log(res, '------phone-----')
        var system = '';
        if (res.platform == 'android') system = parseFloat(res.system.substr(8));
        if (res.platform == 'ios') system = parseFloat(res.system.substr(4));
        console.log(res.platform, '------ios---')
        console.log(system, '-----系统版本----')
        if (res.platform == 'android' && system < 6) {
          that.setData({ startError: '手机版本暂时不支持，请升级到最新版本' });
          return false;
        }
        if (res.platform == 'ios' && system < 11.2) {
          that.setData({ startError: '手机版本暂时不支持，请升级到最新版本' });
          return false;
        }
        that.setData({ platform: res.platform });
      }
    })
    if (!wx.openBluetoothAdapter) {
      Sign.alert('当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试')
      return false;
    }
    // that.startWifi(that); 
  },
  // 输入WiFi名称
  getssid(e) {
    // console.log(e.detail.value)
    this.setData({ ssid: e.detail.value })
  },
  //输入WiFi密码
  getpass(e) {
    // console.log(e.detail.value)
    this.setData({ pass: e.detail.value })
  },
  conWifibtn() {
    console.log('wifibtn')
    let that = this, ssid = that.data.ssid, pass = that.data.pass, ssidutf8 = '', passmsg = '';
    that.setData({ 'wifiFlag': false });
    if (!ssid) {
      Sign.alert('请输入WiFi账号');
      that.setData({ 'wifiFlag': true });
      return false;
    } else {
      ssidutf8 = "04" + Sign.strToutf8(ssid);
      if (ssidutf8.length > 20) {
        Sign.alert('WiFi名称过长，请重新输入');
        that.setData({ 'wifiFlag': true });
        return false;
      }
    }
    console.log(ssidutf8)
    that.setData({ 'sendMassage[0]': ssidutf8 })
    if (!pass) {
      passmsg = "05";
    } else {
      passmsg = "05" + Sign.strToascii(pass);
      if (passmsg.length > 20) {
        Sign.alert('WiFi密码过长，请重新输入');
        that.setData({ 'wifiFlag': true });
        return false;
      }
    }
    that.setData({ 'sendMassage[1]': passmsg })
    console.log(that.data.sendMassage, '-----发送的ssid和pass----')
    //初始化 Wi-Fi 模块
    that.startWifi(that);
  },
  //初始化 Wi-Fi 模块。
  startWifi(that) {
    wx.startWifi({
      success: function (res) {
        // that.getList(that);
        console.log('----init----wifi', res)
        // that.setData({ endError: "WiFi初始化成功", startError:''});
        that.conwifi();
      },
      fail: function (res) {
        console.log(res, '------res----')
        that.setData({ startError: "请打开手机WiFi", endError: '', wifiFlag: true });
      }
    })
  },
  getList: function (that) {
    //安卓执行方法 
    if (that.data.platform == 'android') {
      //请求获取 Wi-Fi 列表       
      wx.getWifiList({
        success: function (res) {
          //安卓执行方法           
          that.AndroidList(that);
        },
        fail: function (res) {
          // that.setData({ wifiListError: true });
          // that.setData({ wifiListErrorInfo: res.errMsg });
        }
      })
    }
    //IOS执行方法 
    if (that.data.platform == 'ios') {
      that.IosList(that);
    }
  },
  AndroidList: function (that) {
    //监听获取到 Wi-Fi 列表数据
    wx.onGetWifiList(function (res) { //获取列表 
      console.log(res, '------安卓获取WiFi列表------')
    })
  },
  IosList: function (that) {
    // that.setData({ wifiListError: true });
    // that.setData({ wifiListErrorInfo: 'IOS暂不支持' });
  },
  connected() {
    console.log('-------onwificonnected----')
    wx.onWifiConnected(function (res) {
      console.log(res, '----已连接----')
    })
  },
  //连接wifi
  conwifi() {
    let that = this, ssid = that.data.ssid, pass = that.data.pass;
    wx.connectWifi({
      SSID: ssid,
      password: pass,
      success: function (res) {
        console.log(res)
        wx.setStorageSync('ssid', ssid)
        that.setData({ endError: 'wifi连接成功', wifiOk: false, startError: '' });
        // that.getConWifi();
        that.stopwifi();
      },
      fail: function (err) {
        console.log(err, '----lianjie errr---')
        that.wifiErr(err);
        that.setData({ endError: '', wifiOk: true });
        that.stopwifi();
      }
    })
  },
  //获取已连接中的 Wi-Fi 信息
  getConWifi() {
    let that = this;
    wx.getConnectedWifi({
      success(res) {
        console.log('------已连接WiFi---res-', res)
        that.stopwifi();
      },
      fail(error) {
        console.log('------已连接WiFi---error-', error)
      }
    })
  },
  stopwifi() {
    this.setData({ wifiFlag: true })
    wx.stopWifi({
      success(res) {
        console.log(res, '----stopwifi----')
      }
    })
  },
  //WiFi错误码
  wifiErr(err) {
    let errcode = err.errCode, that = this;
    switch (errcode) {
      case 12002:
        that.setData({ startError: '密码错误' });
        break;
      case 12003 || 12012:
        that.setData({ startError: '连接超时' });
        break;
      case 12005:
        that.setData({ startError: '未打开 Wi-Fi 开关' });
        break;
      case 12006:
        that.setData({ startError: '未打开 GPS 定位开关' });
        break;
      case 12007:
        that.setData({ startError: '用户拒绝授权链接 Wi-Fi' });
        break;
      case 12008:
        that.setData({ startError: '无效wifi名称' });
        break;
      case 12011:
        that.setData({ startError: '应用在后台无法配置 Wi-Fi ' });
        break;
      case 12013:
        that.setData({ startError: '连接 deviceId 为空或者是格式不正确 ' });
        break;
    }
  },
  // 开始配网
  startNet() {
    let that = this;
   
  },
  //防止重复操作
  preNet() {
    Sign.alert('正在链接，请勿重复操作，请稍等');
  },
  onHide: function () {

  },
  onUnload: function () {
   
  },
})