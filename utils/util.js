const app = getApp()

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('-')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function alert(msg){
  wx.showToast({
    title: msg,
    icon: 'none',
    duration: 3000
  })
}

// 字符串转utf-8编码
function strToutf8(str){
  let back = [];
  let byteSize = 0;
  let utf8 = '';
  for (let i = 0; i < str.length; i++) {
    let code = str.charCodeAt(i);
    if (0x00 <= code && code <= 0x7f) {
      byteSize += 1;
      back.push(code);
    } else if (0x80 <= code && code <= 0x7ff) {
      byteSize += 2;
      back.push((192 | (31 & (code >> 6))));
      back.push((128 | (63 & code)))
    } else if ((0x800 <= code && code <= 0xd7ff)
      || (0xe000 <= code && code <= 0xffff)) {
      byteSize += 3;
      back.push((224 | (15 & (code >> 12))));
      back.push((128 | (63 & (code >> 6))));
      back.push((128 | (63 & code)))
    }
  }
  for (let i = 0; i < back.length; i++) {
    back[i] &= 0xff;
    utf8 += back[i].toString(16);
  }
  return utf8;
}
//字符串转ASCII码
function strToascii(str){
  let code = ''
  for (let i = 0; i < str.length; i++) {
    code += str.charCodeAt(i).toString(16)
  }
  return code;
}
function drawProgressbg() {
  // 使用 wx.createContext 获取绘图上下文 context
  var ctx = wx.createCanvasContext('canvasProgressbg')
  ctx.setLineWidth(4);// 设置圆环的宽度
  ctx.setStrokeStyle('#20183b'); // 设置圆环的颜色
  ctx.setLineCap('round') // 设置圆环端点的形状
  ctx.beginPath();//开始一个新的路径
  ctx.arc(55, 55, 50, 0, 2 * Math.PI, false);
  //设置一个原点(100,100)，半径为90的圆的路径到当前路径
  ctx.stroke();//对当前路径进行描边
  ctx.draw();
}
function drawCircle(step) {
  var context = wx.createCanvasContext('canvasProgress');
  // 设置渐变
  var gradient = context.createLinearGradient(200, 100, 100, 200);
  gradient.addColorStop("0", "#2661DD");
  gradient.addColorStop("0.5", "#40ED94");
  gradient.addColorStop("1.0", "#5956CC");

  context.setLineWidth(8);
  context.setStrokeStyle(gradient);
  context.setLineCap('round')
  context.beginPath();
  // 参数step 为绘制的圆环周长，从0到2为一周 。 -Math.PI / 2 将起始角设在12点钟位置 ，结束角 通过改变 step 的值确定
  context.arc(55, 55, 50, -Math.PI / 2, step * Math.PI - Math.PI / 2, false);
  context.stroke();
  context.draw()
}

module.exports = {
  formatTime: formatTime,
  alert: alert,
  strToutf8: strToutf8,
  strToascii: strToascii,
  drawProgressbg: drawProgressbg,
  drawCircle: drawCircle
}


