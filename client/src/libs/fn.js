import axios from 'axios';
import store from '../store/store'
/**
 * @author xiayong
 * @desc   url参数转对象
 * @param  {String} url  default: window.location.href
 * @return {Object} {a: 1, b: 2}
 */
export function parseQueryString(url = window.location.href) {
  	var search = url.lastIndexOf('?') !== -1 ? url.substring(url.lastIndexOf('?') + 1) : '';
  	if (!search) {
      	return {};
  	}
  	return JSON.parse('{"' + decodeURIComponent(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}');
}
/**
 * @author xiayong
 * @desc   更改url参数方法
 * @param  {String} _query  必填，参数key
 * @param  {String} _newQuery  必填，参数的新value
 */
export function pushStatequery(_query, _newQuery){
    var searchUrl = location.search;
    if (searchUrl.indexOf('&'+_query+'=') != -1) {
        searchUrl = searchUrl.replace('&'+_query+'='+escape(parseQueryString()[_query]), '&'+_query+'='+_newQuery);
    }
    else if (searchUrl.indexOf('?'+_query+'=') != -1) {
    	searchUrl = searchUrl.replace('?'+_query+'='+escape(parseQueryString()[_query]), '?'+_query+'='+_newQuery);
    }
    else{
        let _paramFlag =  searchUrl.indexOf('?') != -1 ? '&' : '?';
        searchUrl = searchUrl+_paramFlag+_query+'='+_newQuery;
    }
    window.history.pushState('','',searchUrl);
}
/**
 * @author xiayong
 * @desc   深度拷贝数组对象
 * @param  {Any} values  必填
 */
export function deepCopy(values) {
    let copy;
    if (null == values || "object" != typeof values) return values;
    if (values instanceof Date) {
        copy = new Date();
        copy.setTime(values.getTime());
        return copy;
    }
    if (values instanceof Array) {
        copy = [];
        for (let i = 0, len = values.length; i < len; i++) {
            copy[i] = deepCopy(values[i]);
        }
        return copy;
    }
    if (values instanceof Object) {
        copy = {};
        for (let attr in values) {
            if (values.hasOwnProperty(attr)) copy[attr] = deepCopy(values[attr]);
        }
        return copy;
    }
    throw new Error("Unable to copy values! Its type isn't supported.");
}
/**
 * @author xiayong
 * @desc   localstorage存储
 * @param  {String} key 必填
 */
// 得到
export function getLocalStore(key) {
    return JSON.parse(window.localStorage.getItem(key)) || '';
}
// 设置
export function setLocalStore(key, val) {
    window.localStorage.setItem(key, JSON.stringify(val));
}
// 删除项
export function removeLocalItem(key) {
    window.localStorage.removeItem(key);
}
/**
 * @author xiayong
 * @desc   发送请求
 * @param  {String} method 必填 get|post
 * @param  {String} url 必填
 * @param  {Object} data 选填 query
 * @param  {Function} callback 选填
 * @param  {Function} errCb 选填
 */
export function handleRequest(type, url, data, callback, errCb, boo = false) {
    let obj = {
        method: type,
        url: url
    };
    if(type == 'post' || type == 'POST') {
        !boo ? obj.headers = { 'content-type': 'application/x-www-form-urlencoded' } : null;
    }
    if(data) {
        if(type == 'post' || type == 'POST') {
            if(boo) {
                obj.data = data;
            } else {
                obj.data = stringfyQueryString(data);
            }
        } else {
            obj.params = data;
        }
    }
    axios(obj).then(res => {
        if(res.data.needlogin) {
            store.dispatch('storeLogout');
        } else {
            callback ? callback(res) : null;
        }
    }).catch(err => {
        errCb ? errCb(err) : null;
    });
}
/**
 * @author xiayong
 * @desc   url参数数组格式化
 * @desc   用逗号判断，并不太好，慎用
 * @param  {Object} obj 要处理的对象
 * @param  {Array}  arr 要处理的字段名字汇总
 */
export function formatQuery(obj, arr) {
    let keys = Object.keys(obj);
    if(keys.length !== 0) {
        keys.forEach(key => {
            if(arr.indexOf(key) !== -1) {
                obj[key] = obj[key].split(',');
            }
        });
    }
    return obj;
}
/**
 * @author xiayong
 * @desc   金额格式化|浮点数精确计算
 * @param  {String}  str 数据
 * @param  {Number}  num 截取长度
 * @param  {Boolean} boo 金额是否特殊处理
 * @param  {Number}  float 十进制保留小数位数
 */
function round10 (value, exp) { // 四舍五入调整
    if (typeof exp === 'undefined' || +exp === 0) {
        return Math.round(value);
    }
    value = +value;
    exp = +exp;
    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
        return NaN;
    }
    value = value.toString().split('e');
    value = Math.round(+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
}
function formatMoney (str, num) {
    var newStr = "";
    var count = 0;
    str = round10(+str, num) + ''; // 先四舍五入再变为字符串
    if (str.indexOf(".") == -1) {
        for (var i = str.length - 1; i >= 0; i--) {
            if (count % 3 == 0 && count != 0) {
                newStr = str.charAt(i) + "," + newStr;
            } else {
                newStr = str.charAt(i) + newStr;
            }
            count++;
        }
        str = newStr + ".00"; //自动补小数点后两位
    } else {
        for (var i = str.indexOf(".") - 1; i >= 0; i--) {
            if (count % 3 == 0 && count != 0) {
                newStr = str.charAt(i) + "," + newStr;
            } else {
                newStr = str.charAt(i) + newStr; //逐个字符相接起来
            }
            count++;
        }
        str = newStr + (str + "00").substr((str + "00").indexOf("."), 3);
    }
    return str;
}
export function toFixNum (str, num, boo, float) {
    var res = '';
    if (boo) {
        res = formatMoney(str, float); // 金额保留位数四舍五入
        return res.slice(0, res.length - num); // 截取长度
    }
    // 非金额
    if (num !== undefined) {
        return round10(parseFloat(str), -num); // 保留n位小数
    } else {
        return round10(parseFloat(str), 0); // 取整
    }
}
// 千分金额无小数点
export function toFixThree(num) {
    return toFixNum(num, 3, true, 0);
}
//千分金额，有小数点
export function toFixThreeFloat(money) {
    if(money && money != null) {
        money = String(money);
        let left = money.split('.')[0],
            right = money.split('.')[1],
            temp = left.split('').reverse().join('').match(/(\d{1,3})/g);
      right = right
                ? right.length >= 2
                ? right.substr(1, 2) == 0
                ? right.substr(0, 1) == 0
                ? ''
                : `.${right.substr(0, 1)}`
                : `.${right.substr(0, 2)}`
                : `.${right}`
                : '';
      return (Number(money) < 0 ? '-' : '') + temp.join(',').split('').reverse().join('') + right;
    }else if (money === 0) {
        return '0';
    }else {
        return '';
    }
}
/**
 * @author xiayong
 * @desc   获取全部标签
 */
export function getAllTags() {
    return axios.get('/api/base/tag/search').then(res => {
        const _data = res.data;
        if(_data.success) {
            return _data.tags.map(obj => {
                return obj = {
                    label: obj.name,
                    value: obj.id
                }
            });
        }
    }).catch(err => console.log(err));
}
/**
 * @author xiayong
 * @desc   生成从m到n的数组
 * @param {Number} start 起始数
 * @param {Number} end   结束数
 */
export function arrByLen(start = 0, end = 0) {
    return Array.from({length: (end - start)}, (v, k) => k + start);
}
/**
 * @author   xiayong
 * @function chunkArr 数组分块
 * @desc     [1,2,3,4] => [[1,2],[3,4]]
 * @param    {Array} arr 原始数组
 * @param    {Number} num 子数组元素数
 */
export function chunkArr(arr, num) {
    let res = [];
    for(let i = 0; i < arr.length; i += num) {
      res.push(arr.slice(i, i + num));
    }
    return res;
}
/**
 * @author         xiayong
 * @function       判断提交数据是否为空
 * @data           要判断的数据对象
 * @canEmptyArr    可以为空的参数名称
 * @_this          当前页面的this
 */
export function checkEmpty(data, _this, canEmptyArr = []) {
    let _lock = false,
        _isArr = data instanceof Array ? true : false;
    let checkFn = (source) => {
        Object.keys(source).every(key => {
            let _isEmpty = false;
            canEmptyArr.forEach(c => {
                if (key === c) {
                    _isEmpty = true;
                }
            });
            if(!_isEmpty && (source[key].length === 0 || (typeof source[key] === 'string' && source[key].trim() === ''))) {
                _this.$Message.destroy();
                _this.$Message.warning('请填写完整信息');
                _lock = true;
                return;
            } else {
                return true;
            }
        });
    };
    if (_isArr) {
        if (data.length === 0) {
            _this.$Message.destroy();
            _this.$Message.warning('请填写完整信息');
            return false;
        }
        data.forEach(d => {
            checkFn(d);
        });
    } else {
        checkFn(data);
    }
    return !_lock;
}
/**
 * @author  xiayong
 * @desc   对象序列化
 * @param  {Object} obj
 * @return {String}
 */
export function stringfyQueryString(obj) {
    if (!obj) return '';
    let pairs = [];
    for (let key in obj) {
        let value = obj[key];
        if (value instanceof Array) {
            for (let i = 0; i < value.length; ++i) {
                pairs.push(encodeURIComponent(key + '[' + i + ']') + '=' + encodeURIComponent(value[i]));
            }
            continue;
        }
        pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
    }
    return pairs.join('&');
}
/**
 * @author   xiayong
 * @function 获取地址list
 */
export function getAds() {
    return axios.get('/api/common/region/listAll').then(res => {
        const _data = res.data;
        if(_data.success) {
            // id转为字符串
            _data.provinceList.forEach(province => {
                province.value = province.value + '';
                province.parentId = province.parentId + '';
                province.children.forEach(city => {
                    city.value = city.value + '';
                    city.parentId = city.parentId + '';
                    city.children.forEach(area => {
                        area.value = area.value + '';
                        area.parentId = area.parentId + '';
                    });
                });
            });
            return _data.provinceList;
        }
    }).catch(err => console.log(err));
}
/**
 * @author   xiayong
 * @function 获取仓库list
 * @argument { type } 0-区域仓库 1-门店仓库 2-临时仓库 3-工厂仓库 4-内部仓库
 */
export function getStockNameList(data = { type: '0,1,2,4' }) {
    return axios.get('/api/depot/warehouse/list', {
        params: data
    }).then(res => {
        const _data = res.data;
        if(_data.success) {
            _data.warehouseList.forEach(x => {
                x.label = x.name;
                x.value = x.id;
            });
            return _data.warehouseList;
        }
    }).catch(err => console.log(err));
}
/**
 * @author   xiayong
 * @function 获取业务list
 */
export function getListBusinessType() {
    return axios.get('/api/depot/stock/listBusinessType').then(res => {
        let _data = res.data,
            _blist = [],
            arrList = [];
        if(_data.success) {
            Object.keys(_data.list).forEach(key => {
                _blist.push({
                    label: key,
                    value: ''
                });
                arrList.push(_data.list[key]);
            });
            _blist.forEach((item, i) => item.value = i + '');
            return {
                filter: _blist,
                option: arrList
            };
        }
    }).catch(err => console.log(err));
}
/**
 * @author   xiayong
 * @function 获取门店list
 */
export function getStoreNameList() {
    return axios.get('/api/store/mendian/list').then(res => {
        const _data = res.data;
        if(_data.success) {
            return _data.mendianList.map(o => ({ label: o.name, value: o.id, enabled: o.enabled }));
        }
    }).catch(err => console.log(err));
}
/**
 * @author   王刚
 * @function 获取权限下门店list
 */
export function getAcessStoreNameList() {
    return axios.get('/api/store/mendian/current/list').then(res => {
        const _data = res.data;
        if(_data.success) {
            return _data.mendianList.map(o => ({ label: o.name, value: o.id, enabled: o.enabled }));
        }
    }).catch(err => console.log(err));
}
/**
 * @author   xiayong
 * @function 获取供应商list
 */
export function getSupplierList() {
    return axios.get('/api/procurement/supplier/search').then(res => {
        const _data = res.data;
        if(_data.success) {
            return _data.tableData.map(o => ({ label: o.supplierName, value: o.id, addGoods: o.addGoods, sn: o.supplierSn }));
        }
    }).catch(err => console.log(err));
}
/**
 * @author   caoyiming
 * @function 获取渠道list
 * @desc 根据渠道筛选
 */
export function getChannelList() {
    // @desc 不根据渠道筛选
    // return axios.get('/api/order/selectSellChannels').then(res => {
    //     const _data = res.data;
    //     if(_data.success) {
    //         return _data.data.map(o => ({ label: o.channelName, value: o.id}));
    //     }
    // }).catch(err => console.log(err));

    // @desc 根据渠道筛选
    return axios.get('/api/order/selectCurrentChannels').then(res => {
        const _data = res.data;
        if(_data.success) {
            return _data.data.map(o => ({ label: o.channelName, value: o.id }));
        }
    }).catch(err => console.log(err));
}
/**
 * @author   xiayong
 * @function 时间格式化
 * @desc 2018-03-12 15:56:56
 */
function toFix(num) {
    return num < 10 ? '0' + num : num;
}
export function normalTime(time, type) {
    if (time) {
        let oDate = new Date();
        oDate.setTime(new Date(time));
        let y = oDate.getFullYear();
        let m = oDate.getMonth() + 1;
        let d = oDate.getDate();
        let h = oDate.getHours();
        let mm = oDate.getMinutes();
        let s = oDate.getSeconds();
        if (type == 'ymd') {
            return y + '-' + toFix(m) + '-' + toFix(d);
        } else {
            return y + '-' + toFix(m) + '-' + toFix(d) + ' ' + toFix(h) + ':' + toFix(mm) + ':' + toFix(s);
        };
    } else {
        return '';
    }
}
/**
 * @author   xiayong
 * @function 改变url中的字段
 * @param {String} name 字段名
 * @param {String} key  值
 */
export function changeUrlQuery(name, key) {
    const idx = location.href.indexOf('?'),
            _path = idx !== -1 ? location.hash.substr(0, location.hash.indexOf('?')) : location.hash,
            query = idx !== -1 ? location.href.substr(idx) : '',
            reg = new RegExp(`${name}=([^&]*)`);
    if(query === '') {
        history.replaceState(null, '', `${_path}?${name}=${encodeURIComponent(key)}`); // 无查询串
    } else if(reg.test(query)) {
        history.replaceState(null, '', `${_path}${query.replace(reg, `${name}=${encodeURIComponent(key)}`)}`); // 有字段
    } else {
        history.replaceState(null, '', `${_path}${query + `&${name}=${encodeURIComponent(key)}`}`); // 无字段
    }
}
/**
 * @author   xiayong
 * @function 校验对象属性值是否为正数
 * @param {Object} obj 数据
 * @param {Array}  arr 检测字段 [{ label: '提示语', value: 'key' }]
 */
export function isObjPropNum(_this, obj = {}, arr = [], ifFloat) {
    if(arr.length === 0) return false;
    const reg = ifFloat ? /^[+]?([0-9]*[.])?[0-9]+$/ : /^\d+$/; // 是否检测浮点数
    for(let o of arr) {
        if(!+obj[o.value] || !reg.test(+obj[o.value])) {
            _this.$Message.destroy();
            _this.$Message.warning(`${o.label}需输入正${!ifFloat ? '整' : ''}数`);
            return false;
        }
    }
    return true;
}
/**
 * @author   xiayong
 * @function 信息handle
 */
export function msgHandler(type, msg, _this, _time = 2.5) {
    _this.$Message.destroy();
    _this.$Message[type]({
        content: msg,
        duration: _time
    });
}
/**
 * @author   xiayong
 * @function 对象数组根据key去重
 */
export function arrUniqBy(arr = [], key = '') {
    let obj = {};
    return arr.reduce((item, next) => {
        obj[next[key]] ? '' : obj[next[key]] = true && item.push(next);
        return item;
    }, []);
}
/**
 * @author   xiayong
 * @function 数组查重
 */
export function checkIfArrayIsUnique(arr) {
    return arr.length === new Set(arr).size;
}
/**
 * @author   xiayong
 * @function 打印
 */
export function toPrint(_this, type, ids, shippingCompanyId, orderObj) {
    let _params = { type: type };
    if(Array.isArray(ids)) {
        _params.ids = ids.join(',');
    } else if(ids || ids === 0) {
        _params.ids = ids;
    }
    if(shippingCompanyId || shippingCompanyId === 0) {
        _params.companyType = shippingCompanyId;
    }
    if(orderObj) {
        _params.orderKey = orderObj.orderKey;
        _params.orderVal = orderObj.orderVal;
    }
    if(type == 3 || type == 4){
        const { href } = _this.$router.resolve({
            name: 'Procurement',
            query: _params
        });
        window.open(href, '_blank');
    }else{
        _this.$router.push({
            name: 'Procurement',
            query: _params
        });
    }
}
/**
 * @author   xiayong
 * @function 获取元素文档绝对距离
 */
export function getPosition(el) {
    let x = el.offsetLeft,
        y = el.offsetTop,
        cur = el.offsetParent;
    while(cur !== null) {
        x += cur.offsetLeft;
        y += cur.offsetTop;
        cur = cur.offsetParent;
    }
    return { x: x, y: y };
}
/**
 * @author   xiayong
 * @function 获取元素的高度和距离
 */
export function initHeaderHeight(_this) {
    // 每次都需要在fixed为false的情况下计算高度
    _this.$store.dispatch('noFixHeader').then(() => {
        const el = document.querySelector('.cdt-table .ivu-table-header'),
            el2 = document.querySelector('.table-header'),
            footEl = document.querySelector('.footer-ct'),
            _h = el ? el.offsetHeight : el2 ? el2.offsetHeight : 0,
            footH = footEl ? footEl.offsetHeight : 0,
            offsetTop = el ? getPosition(el).y : el2 ? getPosition(el2).y : 0;
        _this.$store.dispatch('saveHeaderSize', {_h: _h, offsetT: offsetTop - 10, footH: footH}); // 减10是为了留出上面10像素的padding
    });
}

/**
 * @function canvas to img
 */
export function Canvas2Image() {

    var $support = function () {
        var canvas = document.createElement('canvas'),
            ctx = canvas.getContext('2d');

        return {
            canvas: !!ctx,
            imageData: !!ctx.getImageData,
            dataURL: !!canvas.toDataURL,
            btoa: !!window.btoa
        };
    }();

    var downloadMime = 'image/octet-stream';

    function scaleCanvas (canvas, width, height) {
        var w = canvas.width,
            h = canvas.height;
        if (width == undefined) {
            width = w;
        }
        if (height == undefined) {
            height = h;
        }

        var retCanvas = document.createElement('canvas');
        var retCtx = retCanvas.getContext('2d');
        retCanvas.width = width;
        retCanvas.height = height;
        retCtx.drawImage(canvas, 0, 0, w, h, 0, 0, width, height);
        return retCanvas;
    }

    function getDataURL (canvas, type, width, height) {
        canvas = scaleCanvas(canvas, width, height);
        return canvas.toDataURL(type);
    }

    function saveFile (strData) {
        document.location.href = strData;
    }

    function genImage(strData) {
        var img = document.createElement('img');
        img.src = strData;
        return img;
    }
    function fixType (type) {
        type = type.toLowerCase().replace(/jpg/i, 'jpeg');
        var r = type.match(/png|jpeg|bmp|gif/)[0];
        return 'image/' + r;
    }
    function encodeData (data) {
        if (!window.btoa) { throw 'btoa undefined' }
        var str = '';
        if (typeof data == 'string') {
            str = data;
        } else {
            for (var i = 0; i < data.length; i ++) {
                str += String.fromCharCode(data[i]);
            }
        }

        return btoa(str);
    }
    function getImageData (canvas) {
        var w = canvas.width,
            h = canvas.height;
        return canvas.getContext('2d').getImageData(0, 0, w, h);
    }
    function makeURI (strData, type) {
        return 'data:' + type + ';base64,' + strData;
    }


    /**
     * create bitmap image
     * 按照规则生成图片响应头和响应体
     */
    var genBitmapImage = function (oData) {

        //
        // BITMAPFILEHEADER: http://msdn.microsoft.com/en-us/library/windows/desktop/dd183374(v=vs.85).aspx
        // BITMAPINFOHEADER: http://msdn.microsoft.com/en-us/library/dd183376.aspx
        //

        var biWidth  = oData.width;
        var biHeight    = oData.height;
        var biSizeImage = biWidth * biHeight * 3;
        var bfSize  = biSizeImage + 54; // total header size = 54 bytes

        //
        //  typedef struct tagBITMAPFILEHEADER {
        //      WORD bfType;
        //      DWORD bfSize;
        //      WORD bfReserved1;
        //      WORD bfReserved2;
        //      DWORD bfOffBits;
        //  } BITMAPFILEHEADER;
        //
        var BITMAPFILEHEADER = [
            // WORD bfType -- The file type signature; must be "BM"
            0x42, 0x4D,
            // DWORD bfSize -- The size, in bytes, of the bitmap file
            bfSize & 0xff, bfSize >> 8 & 0xff, bfSize >> 16 & 0xff, bfSize >> 24 & 0xff,
            // WORD bfReserved1 -- Reserved; must be zero
            0, 0,
            // WORD bfReserved2 -- Reserved; must be zero
            0, 0,
            // DWORD bfOffBits -- The offset, in bytes, from the beginning of the BITMAPFILEHEADER structure to the bitmap bits.
            54, 0, 0, 0
        ];

        //
        //  typedef struct tagBITMAPINFOHEADER {
        //      DWORD biSize;
        //      LONG  biWidth;
        //      LONG  biHeight;
        //      WORD  biPlanes;
        //      WORD  biBitCount;
        //      DWORD biCompression;
        //      DWORD biSizeImage;
        //      LONG  biXPelsPerMeter;
        //      LONG  biYPelsPerMeter;
        //      DWORD biClrUsed;
        //      DWORD biClrImportant;
        //  } BITMAPINFOHEADER, *PBITMAPINFOHEADER;
        //
        var BITMAPINFOHEADER = [
            // DWORD biSize -- The number of bytes required by the structure
            40, 0, 0, 0,
            // LONG biWidth -- The width of the bitmap, in pixels
            biWidth & 0xff, biWidth >> 8 & 0xff, biWidth >> 16 & 0xff, biWidth >> 24 & 0xff,
            // LONG biHeight -- The height of the bitmap, in pixels
            biHeight & 0xff, biHeight >> 8  & 0xff, biHeight >> 16 & 0xff, biHeight >> 24 & 0xff,
            // WORD biPlanes -- The number of planes for the target device. This value must be set to 1
            1, 0,
            // WORD biBitCount -- The number of bits-per-pixel, 24 bits-per-pixel -- the bitmap
            // has a maximum of 2^24 colors (16777216, Truecolor)
            24, 0,
            // DWORD biCompression -- The type of compression, BI_RGB (code 0) -- uncompressed
            0, 0, 0, 0,
            // DWORD biSizeImage -- The size, in bytes, of the image. This may be set to zero for BI_RGB bitmaps
            biSizeImage & 0xff, biSizeImage >> 8 & 0xff, biSizeImage >> 16 & 0xff, biSizeImage >> 24 & 0xff,
            // LONG biXPelsPerMeter, unused
            0,0,0,0,
            // LONG biYPelsPerMeter, unused
            0,0,0,0,
            // DWORD biClrUsed, the number of color indexes of palette, unused
            0,0,0,0,
            // DWORD biClrImportant, unused
            0,0,0,0
        ];

        var iPadding = (4 - ((biWidth * 3) % 4)) % 4;

        var aImgData = oData.data;

        var strPixelData = '';
        var biWidth4 = biWidth<<2;
        var y = biHeight;
        var fromCharCode = String.fromCharCode;

        do {
            var iOffsetY = biWidth4*(y-1);
            var strPixelRow = '';
            for (var x = 0; x < biWidth; x++) {
                var iOffsetX = x<<2;
                strPixelRow += fromCharCode(aImgData[iOffsetY+iOffsetX+2]) +
                               fromCharCode(aImgData[iOffsetY+iOffsetX+1]) +
                               fromCharCode(aImgData[iOffsetY+iOffsetX]);
            }

            for (var c = 0; c < iPadding; c++) {
                strPixelRow += String.fromCharCode(0);
            }

            strPixelData += strPixelRow;
        } while (--y);

        var strEncoded = encodeData(BITMAPFILEHEADER.concat(BITMAPINFOHEADER)) + encodeData(strPixelData);

        return strEncoded;
    };

    /**
     * saveAsImage
     * @param canvasElement
     * @param {String} image type
     * @param {Number} [optional] png width
     * @param {Number} [optional] png height
     */
    var saveAsImage = function (canvas, width, height, type) {
        if ($support.canvas && $support.dataURL) {
            if (typeof canvas == "string") { canvas = document.getElementById(canvas); }
            if (type == undefined) { type = 'png'; }
            type = fixType(type);
            if (/bmp/.test(type)) {
                var data = getImageData(scaleCanvas(canvas, width, height));
                var strData = genBitmapImage(data);
                saveFile(makeURI(strData, downloadMime));
            } else {
                var strData = getDataURL(canvas, type, width, height);
                saveFile(strData.replace(type, downloadMime));
            }
        }
    };

    var convertToImage = function (canvas, width, height, type) {
        if ($support.canvas && $support.dataURL) {
            if (typeof canvas == "string") { canvas = document.getElementById(canvas); }
            if (type == undefined) { type = 'png'; }
            type = fixType(type);

            if (/bmp/.test(type)) {
                var data = getImageData(scaleCanvas(canvas, width, height));
                var strData = genBitmapImage(data);
                return genImage(makeURI(strData, 'image/bmp'));
            } else {
                var strData = getDataURL(canvas, type, width, height);
                return genImage(strData);
            }
        }
    };



    return {
        saveAsImage: saveAsImage,
        saveAsPNG: function (canvas, width, height) {
            return saveAsImage(canvas, width, height, 'png');
        },
        saveAsJPEG: function (canvas, width, height) {
            return saveAsImage(canvas, width, height, 'jpeg');
        },
        saveAsGIF: function (canvas, width, height) {
            return saveAsImage(canvas, width, height, 'gif');
        },
        saveAsBMP: function (canvas, width, height) {
            return saveAsImage(canvas, width, height, 'bmp');
        },

        convertToImage: convertToImage,
        convertToPNG: function (canvas, width, height) {
            return convertToImage(canvas, width, height, 'png');
        },
        convertToJPEG: function (canvas, width, height) {
            return convertToImage(canvas, width, height, 'jpeg');
        },
        convertToGIF: function (canvas, width, height) {
            return convertToImage(canvas, width, height, 'gif');
        },
        convertToBMP: function (canvas, width, height) {
            return convertToImage(canvas, width, height, 'bmp');
        }
    };
};
/**
 * @author   wanggang
 * @function 获取售后所需类型数组
 */
export function getAfsalesConstList() {
    return axios.get('/api/afsale/aftersaleTypeList').then(res => {
        const _data = res.data;
        if(_data.success) {
            return _data.typeList
        }
    }).catch(err => console.log(err));
}
