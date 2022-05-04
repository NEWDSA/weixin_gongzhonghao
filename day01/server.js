// 引入 express模块
const express = require('express');

// 引入微信 auth
const auth = require('./auth');


// 创建 app 应用对象
const app = express();
// 验证服务器的有效性
/*
 1.微信服务器要知道开发者服务器是哪个
   -测试号管理页面上填写url开发者服务器地址
   -使用ngrok 内网穿透 将本地端口号开启的服务映射到外网跨域访问一个网址
   -填写token
   -参与微信签名加密的一个参数
  2.开发者服务器 -验证消息是否来自于微信服务器
   目的，计算得出signature微信签名，和微信传递过来的signature比较，如果一致，说明消息来自于微信服务器
   1.将参与微信加密微信签名的三个参数（timestamp,nonce,token）组合在一起按照字典排序并组合在一起
   2.将数组里所有参数拼接成一个字符串，进行sha1加密
   3.加密完成就成一个signature，和微信发送过来的进行对比。
    如果一致，说明消息来自于微信服务器，返回echostr 给微信服务器
    如果不一致，说明消息不是来自于微信服务器，返回error 给微信服务器
 */

//   接受处理所有消息
app.use(auth());

// 监听端口
app.listen(3000, () => {
    console.log('服务器启动成功');
})