/*
 * @Author: luciano 
 * 工具函数包
 * @Date: 2022-05-15 13:12:52 
 * @Last Modified by: luciano
 * @Last Modified time: 2022-05-15 16:37:15
 */
// 引入xml2js，将xml数据转换成js对象
const { parseString } = require('xml2js');
module.exports = {
    getUserDataAsync(req) {
        return new Promise((resolve, reject) => {
            let xmldata = '';
            req.on('data', data => {
                // 当流式数据传递过来时，会触发当前事件，会将数据注入到回调函数中
                // xmldata += data;
                console.log(data.toString());
                // 读取都数据是buffer，需将其转化成字符串
                xmldata += data.toString();
            })
                .on('end', () => {
                    // 当数据接受完毕时，会触发当前
                    resolve(xmldata);
                })

        })
    },
    // 将xml数据解析为js对象
    parseXMLAsync(xmlData) {
        return new Promise((resolve, reject) => {
            parseString(xmlData, { trim: true }, (err, data) => {
                if (!err) {
                    resolve(data);
                } else {
                    reject('parseXMLAsync方法出了问题' + err);
                }
            })
        })

    },
    formatMessage(jsData) {
        let message = {};
        // 获取xml对象
        jsData = jsData.xml;
        // 判断数据是否是一个对象
        if (typeof jsData === 'object') {
            // 遍历对象
            for (let key in jsData) {
                // 获取属性值
                let value = jsData[key];
                // 过滤掉空数据
                if (Array.isArray(value) && value.length > 0) {
                    // 判断是否是数组
                    // 将合法的数据复制到message对象上
                    message[key] = value[0];
                }
            }
        }
        return message;
    }
}
