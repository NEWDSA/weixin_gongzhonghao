/*
 * @Author: luciano 
 * @Date: 2022-05-04 14:38:21 
 * @Last Modified by: luciano
 * @Last Modified time: 2022-05-04 23:35:18
 */
/*
 * @Author: luciano 
 * @Date: 2022-05-04 11:39:32 
 * 获取access_token
 * @Last Modified by:   luciano 
 * @Last Modified time: 2022-05-04 11:39:32 
 */

/* 什么是access_token？
* access_token是公众号的全局唯一接口调用凭据，公众号调用各接口时都需使用access_token。
* 特点：
* 1.access_token的有效期目前为2个小时，需定时刷新，重复获取将导致上次获取的access_token失效。
* 2.access_token对于每个公众号是唯一的，同一个公众号的不同账号共享同一个access_token。 
  请求地址：
  https请求方式: GET https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET
  设计思路：
    1.首次本地没有，发送请求获取access_token,保存下来(本地文件)
    2.第二或以后
     -先去本地读取文件，判断它是否过期
     - 过期了
        - 重新请求获取access_token，保存下来覆盖之前的文件（保证文件是唯一的）
     - 没过期
      - 直接使用

   整理思路：
   读取本地文件 (readAccessToken)
   - 本地有文件
   - 判断它是否过期 (isValidAccessToken)
     - 过期了
        - 重新请求获取access_token (getAccessToken)，保存下来覆盖之前的文件（保证文件是唯一的）
     - 没过期
      - 直接使用
    - 本地没有文件
    - 发送请求获取access_token,保存下来(本地文件)
*/
const { appID, appsecret } = require('./config');
// 只需要引入 request-promise-native
const rp = require('request-promise-native');
// 引入 fs模块
const { writeFile, readFile } = require('fs');
// 定义类获取 access_token
class Wechat {
    constructor() {

    }
    /**
     * 用来获取 access_token
     */
    getAccessToken() {
        // 定义请求的地址
        const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appID}&secret=${appsecret}`;
        // 发送请求
        /**
         * request
         * request-promise-native 返回值是一个promise对象
         */
        return new Promise((resolve, reject) => {
            rp({
                method: 'GET',
                url,
                json: true
            }).then(result => {
                console.log(result);
                /**
                 * {
                    access_token: '56_7zC6o34pDUVupdMxzif5oMedjEUXrb_prtA5RPDaPUi6IfF0esyiWbNztlbokcmKgowRuJCJ4p-UYv1rL6oX8WI3XS6jaDgMa9KcysQhTs9rpr8ARY2FE99LAbK7QkPYVuJjOB9w8yXrvQ2zEVXdAFAHYA',
                    expires_in: 7200
                    7200秒
                    7200 /60 = 2小时
                }
                 */
                // 设置access_token的过期时间
                result.expires_in = Date.now() + (result.expires_in - 300) * 1000;
                // 将promise对象状态改成成功的状态
                resolve(result);

            }).catch(err => {
                console.log(err);
                // 将promise对象状态改成失败的状态
                reject('getAccessToken方法出了问题' + err);
            })
        })

    }

    /**
     * 用来保存access_token的方法
     * @param accessToken 要保存的凭据
     */
    saveAccessToken(accessToken) {
        // 将access_token写入文件
        return new Promise((resolve, reject) => {
            // 将access_token写入文件
            writeFile('./accessToken.txt', JSON.stringify(accessToken), err => {
                if (!err) {
                    console.log('文件保存成功');
                    resolve();
                } else {
                    console.log('文件保存失败');
                    reject('saveAccessToken方法出了问题:' + err);
                }
            })
        })

    }
    /**
     * 用来读取 access_token
     * @param accessToken 要保存的凭据
     */
    readAccessToken() {
        // 将access_token写入文件
        return new Promise((resolve, reject) => {
            // 将access_token写入文件
            readFile('./accessToken.txt', JSON.stringify(accessToken), (err, data) => {
                if (!err) {
                    console.log('文件读取成功');
                    data = JSON.parse(data);
                    resolve(data);
                } else {
                    console.log('文件读取失败');
                    reject('readAccessToken方法出了问题:' + err);
                }
            })
        })

    }
    /**
     * 用来检测 access_token 是否有效
     * @param {*} accessToken 
     */
    isValidAccessToken(data) {
        // 检测传入的参数是否有效的
        // if (!data && !data.access_token && !data.expires_in) { 
        //     // 代表 access_token 无效的
        //     return false;
        // }
        // // 检测access_token是否在有效期内
        // if(data.expires_in < Date.now()) {
        //     // 代表 access_token 无效的
        //     return false;
        // }else{
        //     return true;
        // }
       
        console.log(data.expires_in > Date.now());
        return data.expires_in > Date.now();
    }

    /**
     * 
     * 用来获取没有过期的acc1ss_token
     * @return {Promise<any>} access_token
     * 
     */
    fetchAccessToken() {
        // 优化
        debugger
        if (this.access_token && this.expires_in && this.isValidAccessToken(this)) {
            // 说明之前保存过 access_token，并且它是有效的，直接使用
            // return Promise.resolve(this);
            return Promise.resolve({
                access_token: this.access_token,
                expires_in: this.expires_in
            })
        }
        return this.readAccessToken()
            .then(async res => {
                // 本地有文件
                // 判断它是否过期
                if (this.isValidAccessToken(res)) {
                    // 没过期
                    console.log('有效的access_token');
                    // resolve(res);
                    return Promise.resolve(res);
                } else {
                    // 过期了
                    // 发送请求获取access_token(getAccessToken)
                    const res = this.getAccessToken();
                    // 保存下来(本地文件) (saveAccessToken)
                    await this.saveAccessToken(res);
                    // 将请求回来的access_token返回出去
                    // resolve(res);
                    return Promise.resolve(res);
                }

            })
            .catch(async err => {
                // 本地没有文件
                // 发送请求获取access_token(getAccessToken)
                const res = this.getAccessToken();
                // 保存下来(本地文件) (saveAccessToken)
                await this.saveAccessToken(res);
                // 将请求回来的access_token返回出去
                return Promise.resolve(res);
            })
            .then(res => {
                //将access_token挂载到this上
                this.access_token = res.access_token;
                this.expires_in = res.expires_in;
                // 返回res包装了一层promise对象（此对象为成功的状态）
                return Promise.resolve(res);
            })
    }
}

// 模拟测试
const w = new Wechat();
w.fetchAccessToken();
//w.getAccessToken();
/**
 * 读取本地文件 (readAccessToken)
   - 本地有文件
   - 判断它是否过期 (isValidAccessToken)
     - 过期了
        - 重新请求获取access_token (getAccessToken)，保存下来覆盖之前的文件（保证文件是唯一的）
     - 没过期
      - 直接使用
    - 本地没有文件
    - 发送请求获取access_token,保存下来(本地文件)
 */
// new Promise((resolve, reject) => {
//     w.readAccessToken().then(res => {
//         // 本地有文件
//         // 判断它是否过期
//         if (w.isValidAccessToken(res)) {
//             // 没过期
//             console.log('有效的access_token');
//             resolve(res);
//         } else {
//             // 过期了
//             // 发送请求获取access_token(getAccessToken)
//             w.getAccessToken().then(res => {
//                 // 保存下来(本地文件) (saveAccessToken)，直接使用
//                 w.saveAccessToken(res).then(() => {
//                     resolve(res);
//                 })
//             })
//         }

//     }).catch(err => {
//         // 本地没有文件
//         // 发送请求获取access_token(getAccessToken)
//         w.getAccessToken().then(res => {
//             // 保存下来(本地文件) (saveAccessToken)，直接使用
//             w.saveAccessToken(res).then(() => {
//                 resolve(res);
//             })
//         })
//     })
// }).then(res => {
//     console.log(res);
// })
