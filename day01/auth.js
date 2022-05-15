/*
 * @Author: luciano 
 * @Date: 2022-05-04 00:49:03 
 * 验证服务器有效星
 * @Last Modified by: luciano
 * @Last Modified time: 2022-05-15 16:45:31
 */
const sha1 = require('sha1');
// 引入 config 模块
const config = require('./config');
// 引入 tool 模块
const { getUserDataAsync,parseXMLAsync,formatMessage} = require('./utils/tool');
module.exports = () => {
    return async (req, res, next) => {
        // debugger
        const { signature, echostr, timestamp, nonce } = req.query;
        const { token } = config;
        console.log(req.query, 'query查询条件1');
        // console.log(res, '响应参数');
        // console.log(signature);
        // //1.将参与微信加密微信签名的三个参数（timestamp,nonce,token）组合在一起按照字典排序并组合在一起
        // const arr = [timestamp, nonce, token];
        // //2.将数组里所有参数拼接成一个字符串，进行sha1加密
        // const str = arr.sort().join('');
        // const sha = sha1(str);

        const sha = sha1([timestamp, nonce, token].sort().join(''));



        //    next();
        /**
         * 微信服务器会发送两种类型的消息给开发者服务器
         * 1.GET 请求
         *  --验证服务器有效性
         * 2.POST 请求
         *  --微信服务器会将用户发送的消息发以post请求的方式转发送到开发者服务器
         */
        if (req.method === 'GET') {
            //3.加密完成就成一个signature，和微信发送过来的进行对比。
            if (sha === signature) {
                res.send(echostr);
            } else {
                res.send('error');
            }

        } else if (req.method === 'POST') {
            //微信服务器会将用户发送的消息发以post请求的方式转发送到开发者服务器
            // 验证消息来自于微信服务器
            if (sha !== signature) {
                // 说明消息不是来自于微信服务器
                res.end('error');
            }
            console.log('---------------------------------');
            console.log(req.query, 'query查询条件');
            // 接受请求体中的数据,流式数据
            // {
            //     signature: '07c7f3dee979ef2b7429926f79a84243f040292a',
            //     timestamp: '1652590307',
            //     nonce: '626472919',
            //     openid: 'o21nK6eu88gUj0Cm8MN1PfbmZuI0' // 微信用户的唯一标识
            //   }

            var xmlData = await getUserDataAsync(req);

            // console.log(xmlData, 'xmlData');
            // <xml><ToUserName><![CDATA[gh_bfa8e862faf2]]></ToUserName> //开发者的id
            //     <FromUserName><![CDATA[o21nK6eu88gUj0Cm8MN1PfbmZuI0]]></FromUserName>  /用户openid
            //     <CreateTime>1652597595</CreateTime> //发送的时间戳
            //     <MsgType><![CDATA[text]]></MsgType> //发送消息类型
            //     <Content><![CDATA[兄弟]]></Content> // 发送的内容
            //     <MsgId>23659509886351088</MsgId> // 消息id 微信服务器会默认保存3天用户发送的数据，通过此id三天内就能找到消息数据，三天后就被销毁
            // </xml>
            //将xml数据解析为js对象
            const jsData = await parseXMLAsync(xmlData)
            console.log(jsData, 'jsData');
            // {
            //     xml: {
            //       ToUserName: [ 'gh_bfa8e862faf2' ],
            //       FromUserName: [ 'o21nK6eu88gUj0Cm8MN1PfbmZuI0' ],
            //       CreateTime: [ '1652601591' ],
            //       MsgType: [ 'text' ],
            //       Content: [ '来呀' ],
            //       MsgId: [ '23659565904987562' ]
            //     }
            //   } 

            // 格式化数据
            const message=formatMessage(jsData);
            console.log(message, 'message');
            // 如果开发者服务器没有返回响应给微信服务器，微信服务器
            res.end('');

        } else {
            res.send('error');
        }

    }
}