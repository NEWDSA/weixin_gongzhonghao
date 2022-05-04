/*
 * @Author: luciano 
 * @Date: 2022-05-04 00:49:03 
 * 验证服务器有效星
 * @Last Modified by: luciano
 * @Last Modified time: 2022-05-04 01:25:01
 */
const sha1 = require('sha1');
// 引入 config 模块
const config = require('./config');
module.exports = () => {
    return (req, res, next) => {
        // debugger
        const { signature, echostr, timestamp, nonce } = req.query;
        const { token } = config;
        console.log(req.query,'query查询条件');
        console.log(signature);
        //1.将参与微信加密微信签名的三个参数（timestamp,nonce,token）组合在一起按照字典排序并组合在一起
        const arr = [timestamp, nonce, token];
        //2.将数组里所有参数拼接成一个字符串，进行sha1加密
        const str = arr.sort().join('');
        const sha = sha1(str);
        //3.加密完成就成一个signature，和微信发送过来的进行对比。
        if (sha === signature) {
            res.send(echostr);
        } else {
            res.send('error');
        }

       next();
        
    }
}