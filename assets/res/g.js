//mobile页面专有的工具、通用业务逻辑
(function (window, undefined) {
    "use strict";

    //路由器信息
    var route_mac = "";
    var route_uptime = 0;
    var router_info_response = {};
    var wait_router_restart_timer = null;

    var HiWiFi = {
        //通过openapi的jsonp模式获取路由器信息
        getRouterInfo: function (callback) {
            $.ajax({
                type: "get",
                async: false,
                url: "http://client.openapi.hiwifi.com/router_info?local=1",
                data: "jsonp",
                dataType: "jsonp",
                success: function (rsp) {
                    rsp = rsp || {};
                    router_info_response = router_info_response || {};
                    router_info_response.debug_info = rsp.debug_info || {};
                    router_info_response.app_data = rsp.app_data || {};
                    if (typeof callback === "function") {
                        callback(router_info_response);
                    }
                }
            });
        },
        setRouteInfo: function (callback) {
            var _self = this;
            var uptime = 0;
            _self.getRouterInfo(function (rsp) {
                if (rsp.app_data) {
                    route_mac = rsp.app_data.mac || "";
                    uptime = rsp.app_data.uptime || 0;
                    if (route_uptime < uptime) {
                        route_uptime = uptime;
                    }
                    if (typeof callback === "function") {
                        callback(rsp.app_data);
                    }
                }
            });
        },
        waitRouterReconnect: function (callback) {
            var _self = this;
            _self.getRouterInfo(function (rsp) {
                rsp = rsp || {};
                rsp.app_data = rsp.app_data || {};
                if (rsp.app_data.mac !== route_mac) {
                    _self.dialog({
                        type: "warning",
                        content: '<p class="tip-text">连接超时 您没有连接到这台路由器</p>'
                    }).show();
                } else if (rsp.app_data.uptime < route_uptime) {
                    //只有现路由器MAC与保存的路由器MAC一致,并系统启动时间小于原系统启动时间
                    //防止有jsonp接口延迟返回
                    if (typeof callback === "function") {
                        callback();
                    }
                    return;
                }
            });
            //定时重新请求
            wait_router_restart_timer = setTimeout(function () {
                window.clearTimeout(wait_router_restart_timer);
                _self.waitRouterReconnect(callback);
            }, 5000);
        },
        showReconnectTip: function (reboot) {
            var _self = this;
            var content_text = "重启中...请稍候";
            if (reboot) {
                setTimeout(function () {
                    _self.showReconnectTip(false);
                }, 30000);
            } else {
                content_text = "请稍后手动连回路由器";
                _self.waitRouterReconnect(function () {
                    location.href = "/";
                });
            }
            _self.dialog({
                type: "loading",
                content: content_text
            }).show();
        },
        constructWriteCallback: function (successCallback, errorCallback) {
            var _self = this;
            //默认的写入类型的报错,需要对接口报错对用户进行反馈
            //只要报错，导致程序不正常，就应当给用户提示
            var callbacks = {
                success: function (rsp, status, xhr) {
                    if (typeof successCallback === "function") {
                        successCallback(rsp, status, xhr);
                    }
                },
                responseError: function (rsp) {
                    _self.dialog({
                        type: "warning",
                        content: rsp.msg
                    }).show().time(1500);
                    if (typeof errorCallback === "function") {
                        errorCallback(rsp);
                    }
                },
                noAuthError: function (rsp) {
                    _self.dialog({
                        type: "warning",
                        content: "页面已过期,请重新登陆!",
                        closeCallback: function () {
                            location.href = "/";
                        }
                    }).show().time(1500);
                },
                requestError: function (e) {
                    _self.dialog({
                        type: "warning",
                        content: "请求失败,请重新尝试!"
                    }).show().time(1500);
                    if (typeof errorCallback === "function") {
                        errorCallback(e);
                    }
                },
                canceledError: function (e) {
                    //@todo不做提示,应做记录
                },
                timeoutError: function (e) {
                    _self.dialog({
                        type: "warning",
                        content: "请求超时,请重新尝试!"
                    }).show().time(1500);
                }
            };
            return callbacks;
        },
        constructReadCallback: function (successCallback, errorCallback) {
            var _self = this;
            //默认读取类型接口的报错，只有失去权限报错需要展现给用户
            var callbacks = {
                success: function (rsp, status, xhr) {
                    if (typeof successCallback === "function") {
                        successCallback(rsp, status, xhr);
                    }
                },
                responseError: function (rsp) { },
                noAuthError: function (rsp) {
                    _self.dialog({
                        type: "warning",
                        content: "页面已过期,请重新登陆!",
                        closeCallback: function () {
                            location.href = "/";
                        }
                    }).show().time(1500);
                },
                requestError: function (e) {
                    //目前不做处理，@todo需要相应的诊断处理
                    if (typeof errorCallback === "function") {
                        errorCallback(e);
                    }
                },
                canceledError: function (e) { }
            };
            return callbacks;
        }

    };

    //初始化操作
    //1、设置默认mac
    HiWiFi.setRouteInfo();
    return (window.HiWiFi = $.extend(false, window.HiWiFi, HiWiFi));
} (window));
��否存在
         * @param {array} arg_array         待处理数组
         * @param {boolean} [ignore_case]   是否忽略字符大小写
         * @return {boolean}
         */
        inArray: function (arg_string, arg_array, ignore_case) {
            if (!arg_string || !HiWiFi.isArray(arg_array)) {
                return false;
            }
            var i = 0;
            for (i = 0; i < arg_array.length; i++) {
                if (ignore_case) {
                    if (arg_string.toUpperCase() === arg_array[i].toUpperCase()) {
                        return true;
                    }
                } else {
                    if (arg_string === arg_array[i]) {
                        return true;
                    }
                }
            }
            return false;
        },
        /**
        * 克隆对象
        * @method cloneObj
        * @public
        * @param {object} obj       需要被克隆的对象
        * @return {object}          被克隆过的对象
        */
        cloneObj: function (obj) {
            var _self = HiWiFi,
                str,
                newobj = _self.isArray(obj) ? [] : {};
            if (typeof obj !== 'object') {
                return;
            } else if (window.JSON) {
                str = JSON.stringify(obj), //系列化对象
                    newobj = JSON.parse(str); //还原
            } else {
                for (var i in obj) {
                    newobj[i] = typeof obj[i] === 'object' ? _self.cloneObj(obj[i]) : obj[i];
                }
            }
            return newobj;
        },
        /**
         * 设置客户端类型,用于强制使用 web或mobile 页面，而不默认跳转到根据ua判断的页面
         * @method setClientType
         * @public
         * @param {string} type   mobile || web
         * @return {boolean}
         */
        setClientType: function (type) {
            type = (type === "mobile" || type === "web") ? type : "web";
            this.setCookie("client_type", type);
        },
        /**
         * 获取客户端类型（优先使用用户设置的，默认用UA判断）
         * @method getClientType
         * @public
         * @param
         * @return {string} mobile || web
         */
        getClientType: function () {
            var type = this.getCookie("client_type");
            if (!type) {
                type = this.getCookie("is_mobile") === 1 ? "mobile" : "web";
            }
            return type;
        },
        /**
         * 格式化存储单位 to KB
         * @method formatSizeToKByte
         * @public
         * @param {string|number} a     以Byte为基础单位的数值（如：MB） 
         * @return {number}             单位/KB
         */
        formatSizeToKByte: function (a) {
            var result = false;
            if ((typeof (a) === "string" && a.length > 0) || typeof (a) === "number") {
                var a1 = '' + a;
                var a_val = a1.toUpperCase();
                var unit = a_val.substr(a_val.length - 1, 1);
                var num = 0;
                if (unit >= 0 && unit <= 9) {
                    num = a_val;
                } else {
                    num = a_val.substr(0, a_val.length - 1);
                }
                var n = 1;
                if (unit === 'T') {
                    n = 1000 * 1000 * 1000;
                } else if (unit === 'G') {
                    n = 1000 * 1000;
                } else if (unit === 'M') {
                    n = 1000;
                } else if (unit === 'K') {
                    n = 1;
                } else if (unit === 'B') {
                    n = 0.001;
                } else {
                    //默认按兆处理
                    n = 1000;
                }
                result = parseFloat(num) * parseFloat(n);
            }
            return result;
        },
        /**
         * 比较两个携带单位的存储大小
         * @method compareStorageSize
         * @public
         * @param {string|number} a     以Byte为基础单位的数值字符串（如：MB） 
         * @return {number}             1 || 0 || -1 
         */
        compareStorageSize: function (a, b) {
            var a_val = this.formatSizeToKByte(a);
            var b_val = this.formatSizeToKByte(b);
            if (a_val) {
                if (b_val) {
                    if (a_val < b_val) {
                        return -1;
                    } else if (a_val === b_val) {
                        return 0;
                    } else {
                        return 1;
                    }
                } else {
                    return 1;
                }
            } else {
                if (b_val) {
                    return -1;
                } else {
                    return 0;
                }
            }
        },
        /**
         * 存储的单位换算
         * @method compareStorageSize
         * @public
         * @param {string|number} v     以Byte为基础单位的数值字符串（如：MB，若没有单位默认为MB） 
         * @param {string} unit         单位（如：G、M、K、B） 
         * @param {number} [fixed]      保留小数位（如保留两位小数则传参：100） 
         * @return {string}             带单位的存储字符串（"100M"）
         */
        conversionStorageSize: function (v, unit, fixed) {
            if (typeof (v) === "string" || typeof (v) === "number") {
                var val = this.formatSizeToKByte(v);
                var unit_tmp = unit.toUpperCase();
                if (typeof val !== "undefined") {
                    if (typeof (unit) === "string") {
                        var n = 1;
                        if (unit_tmp === 'T') {
                            n = 1000 * 1000 * 1000;
                        } else if (unit_tmp === 'G') {
                            n = 1000 * 1000;
                        } else if (unit_tmp === 'M') {
                            n = 1000;
                        } else if (unit_tmp === 'K') {
                            n = 1;
                        }
                        var rst = "";
                        if (fixed) {
                            rst += Math.floor(val / parseFloat(n) * fixed) / fixed;
                        } else {
                            rst += val / parseFloat(n);
                        }
                        rst += unit_tmp;
                        return rst;
                    } else {
                        return 0 + unit_tmp;
                    }
                }
            }
        },
        /**
         * 将以秒为单位的时间，转换成时间对象
         * @method formatTimeToObj
         * @public
         * @param {string|number} time     以秒为单位的时间 
         * @return {object}                {day:1, hour:2, minute:3, second:4}
         */
        formatTimeToObj: function (time) {
            var temp_time = parseInt(time, 10);
            var day = time > 86400 ? Math.floor(temp_time / 86400) : 0;
            var hour = time > 3600 ? Math.floor((temp_time - day * 86400) / 3600) : 0;
            var minute = time > 60 ? Math.floor((temp_time - day * 86400 - hour * 3600) / 60) : 0;
            var second = Math.floor(temp_time - day * 86400 - hour * 3600 - minute * 60);
            return {
                day: day,
                hour: hour,
                minute: minute,
                second: second
            };
        },
        /**
         * 获取今天的日期文本
         * @method getTodayDateText
         * @public
         * @return {string}                例：“20160801”
         */
        getTodayDateText: function () {
            var date_obj = new Date();
            var full_year = date_obj.getFullYear();
            var month = date_obj.getMonth() + 1;
            month = month < 10 ? "0" + month : "" + month;
            var date = date_obj.getDate();
            date = date < 10 ? "0" + date : "" + date;
            return full_year + month + date;
        },
        /**
         * 格式化MAC地址（大写）
         * @method formatMacAddress
         * @public
         * @param {string} mac          mac地址字符串
         * @param {boolean} has_colon   是否需要：分隔符 
         * @return {string}             处理过的mac地址
         */
        formatMacAddress: function (mac, has_colon) {
            if (typeof mac !== "string") {
                return "";
            }
            if (mac.length !== 17 && mac.length !== 12) {
                return "";
            }
            mac = mac.toUpperCase();
            var reg_mac = /[A-F\d]{2}:?[A-F\d]{2}:??[A-F\d]{2}:?[A-F\d]{2}:?[A-F\d]{2}:?[A-F\d]{2}/;
            if (!reg_mac.test(mac)) {
                return "";
            }
            if (typeof has_colon !== "undefined") {
                if (has_colon) {
                    if (mac.length === 12) {
                        mac = mac.replace(/(.{2})/g, '$1:');
                        mac = mac.substring(0, 17);
                    }
                } else {
                    mac = mac.replace(/:/g, '');
                }
            }
            return mac;
        },
        /**
         * 获取字节长度
         * @method getLengthOfByte
         * @public
         * @param {string} value      需要查询字节长度的字符串
         * @return {number}           字符串的字节长度
         */
        getLengthOfByte: function (value) {
            var length_now = 0;
            var one;
            var i = 0;
            for (i = 0; i < value.length; i += 1) {
                one = value.substr(i, 1);
                //ascii 码
                if (one.charCodeAt(0) > 127) {
                    //中文占用2个字节
                    length_now += 2;
                } else {
                    length_now += 1;
                }
            }
            return length_now;
        },
        /**
         * 判断是否含有除英文符号及数字外的特殊字符
         * @method checkSpecialCharacter
         * @public
         * @param {string} value      需要查询的字符串
         * @return {boolean}
         */
        checkSpecialCharacter: function (value) {
            var result = false;
            var one;
            var i = 0;
            for (i = 0; i < value.length; i += 1) {
                one = value.substr(i, 1);
                //ascii 码
                if (one.charCodeAt(0) > 127) {
                    result = true;
                    break;
                }
            }
            return result;
        },
        /**
         * 把timer添加到全局缓存中，默认只缓存最近添加的20个
         * @method addTimerToGlobal
         * @public
         * @param {number} timer      setTimeout或setInterval的返回值
         */
        addTimerToGlobal: function (timer) {
            if (timer) {
                global_timer.push(timer);
                if (global_timer.length > 20) {
                    global_timer.shift();
                }
            }
        },
        /**
         * 清空全局缓存中的timer，并执行clear
         * @method stopTimerFromGlobal
         * @public
         * @param
         */
        stopTimerFromGlobal: function () {
            global_timer = global_timer || [];
            var i = 0;
            for (i = 0; i < global_timer.length; i++) {
                window.clearInterval(global_timer[i]);
            }
        },
        /**
         * 把callback添加到全局缓存中,多用于不同的模块间“通过函数名称作为协议来共享数据”
         * @method addGlobalCallback
         * @public
         * @param {string} key          回调函数的名称
         * @param {function} callback   回调函数
         */
        addGlobalCallback: function (key, callback) {
            if (typeof key === "string" && typeof callback === "function") {
                global_callbacks_object[key] = callback;
            }
        },
        /**
         * 触发全局缓存中的callback
         * @method triggerGlobalCallback
         * @public
         * @param {string} key          回调函数的名称
         * @param {object} obj          需要向回调函数传递的参数
         */
        triggerGlobalCallback: function (key, obj) {
            if (typeof key === "string" && typeof global_callbacks_object[key] === "function") {
                global_callbacks_object[key](obj);
            }
        },
        /**
         * 计算MD5
         * @method md5
         * @public
         * @param {string} string     需要被计算的字符串
         * @return {string}           经过MD5处理的字符串
         */
        md5: function (string) {
            //jsonp调用openapi时会用到md5
            function md5_RotateLeft(lValue, iShiftBits) {
                return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
            }

            function md5_AddUnsigned(lX, lY) {
                var lX4, lY4, lX8, lY8, lResult;
                lX8 = (lX & 0x80000000);
                lY8 = (lY & 0x80000000);
                lX4 = (lX & 0x40000000);
                lY4 = (lY & 0x40000000);
                lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
                if (lX4 & lY4) {
                    return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
                }
                if (lX4 | lY4) {
                    if (lResult & 0x40000000) {
                        return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
                    } else {
                        return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
                    }
                } else {
                    return (lResult ^ lX8 ^ lY8);
                }
            }

            function md5_F(x, y, z) {
                return (x & y) | ((~x) & z);
            }

            function md5_G(x, y, z) {
                return (x & z) | (y & (~z));
            }

            function md5_H(x, y, z) {
                return (x ^ y ^ z);
            }

            function md5_I(x, y, z) {
                return (y ^ (x | (~z)));
            }

            function md5_FF(a, b, c, d, x, s, ac) {
                a = md5_AddUnsigned(a, md5_AddUnsigned(md5_AddUnsigned(md5_F(b, c, d), x), ac));
                return md5_AddUnsigned(md5_RotateLeft(a, s), b);
            }

            function md5_GG(a, b, c, d, x, s, ac) {
                a = md5_AddUnsigned(a, md5_AddUnsigned(md5_AddUnsigned(md5_G(b, c, d), x), ac));
                return md5_AddUnsigned(md5_RotateLeft(a, s), b);
            }

            function md5_HH(a, b, c, d, x, s, ac) {
                a = md5_AddUnsigned(a, md5_AddUnsigned(md5_AddUnsigned(md5_H(b, c, d), x), ac));
                return md5_AddUnsigned(md5_RotateLeft(a, s), b);
            }

            function md5_II(a, b, c, d, x, s, ac) {
                a = md5_AddUnsigned(a, md5_AddUnsigned(md5_AddUnsigned(md5_I(b, c, d), x), ac));
                return md5_AddUnsigned(md5_RotateLeft(a, s), b);
            }

            function md5_ConvertToWordArray(string) {
                var lWordCount;
                var lMessageLength = string.length;
                var lNumberOfWords_temp1 = lMessageLength + 8;
                var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
                var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
                var lWordArray = Array(lNumberOfWords - 1);
                var lBytePosition = 0;
                var lByteCount = 0;
                while (lByteCount < lMessageLength) {
                    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
                    lBytePosition = (lByteCount % 4) * 8;
                    lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
                    lByteCount++;
                }
                lWordCount = (lByteCount - (lByteCount % 4)) / 4;
                lBytePosition = (lByteCount % 4) * 8;
                lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
                lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
                lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
                return lWordArray;
            }

            function md5_WordToHex(lValue) {
                var WordToHexValue = "",
                    WordToHexValue_temp = "",
                    lByte, lCount;
                for (lCount = 0; lCount <= 3; lCount++) {
                    lByte = (lValue >>> (lCount * 8)) & 255;
                    WordToHexValue_temp = "0" + lByte.toString(16);
                    WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
                }
                return WordToHexValue;
            }

            function md5_Utf8Encode(string) {
                string = string.replace(/\r\n/g, "\n");
                var utftext = "";
                for (var n = 0; n < string.length; n++) {
                    var c = string.charCodeAt(n);
                    if (c < 128) {
                        utftext += String.fromCharCode(c);
                    } else if ((c > 127) && (c < 2048)) {
                        utftext += String.fromCharCode((c >> 6) | 192);
                        utftext += String.fromCharCode((c & 63) | 128);
                    } else {
                        utftext += String.fromCharCode((c >> 12) | 224);
                        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                        utftext += String.fromCharCode((c & 63) | 128);
                    }
                }
                return utftext;
            }
            var x = Array();
            var k, AA, BB, CC, DD, a, b, c, d;
            var S11 = 7,
                S12 = 12,
                S13 = 17,
                S14 = 22;
            var S21 = 5,
                S22 = 9,
                S23 = 14,
                S24 = 20;
            var S31 = 4,
                S32 = 11,
                S33 = 16,
                S34 = 23;
            var S41 = 6,
                S42 = 10,
                S43 = 15,
                S44 = 21;
            string = md5_Utf8Encode(string);
            x = md5_ConvertToWordArray(string);
            a = 0x67452301;
            b = 0xEFCDAB89;
            c = 0x98BADCFE;
            d = 0x10325476;
            for (k = 0; k < x.length; k += 16) {
                AA = a;
                BB = b;
                CC = c;
                DD = d;
                a = md5_FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
                d = md5_FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
                c = md5_FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
                b = md5_FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
                a = md5_FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
                d = md5_FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
                c = md5_FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
                b = md5_FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
                a = md5_FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
                d = md5_FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
                c = md5_FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
                b = md5_FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
                a = md5_FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
                d = md5_FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
                c = md5_FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
                b = md5_FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
                a = md5_GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
                d = md5_GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
                c = md5_GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
                b = md5_GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
                a = md5_GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
                d = md5_GG(d, a, b, c, x[k + 10], S22, 0x2441453);
                c = md5_GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
                b = md5_GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
                a = md5_GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
                d = md5_GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
                c = md5_GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
                b = md5_GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
                a = md5_GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
                d = md5_GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
                c = md5_GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
                b = md5_GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
                a = md5_HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
                d = md5_HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
                c = md5_HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
                b = md5_HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
                a = md5_HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
                d = md5_HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
                c = md5_HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
                b = md5_HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
                a = md5_HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
                d = md5_HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
                c = md5_HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
                b = md5_HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
                a = md5_HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
                d = md5_HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
                c = md5_HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
                b = md5_HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
                a = md5_II(a, b, c, d, x[k + 0], S41, 0xF4292244);
                d = md5_II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
                c = md5_II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
                b = md5_II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
                a = md5_II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
                d = md5_II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
                c = md5_II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
                b = md5_II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
                a = md5_II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
                d = md5_II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
                c = md5_II(c, d, a, b, x[k + 6], S43, 0xA3014314);
                b = md5_II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
                a = md5_II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
                d = md5_II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
                c = md5_II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
                b = md5_II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
                a = md5_AddUnsigned(a, AA);
                b = md5_AddUnsigned(b, BB);
                c = md5_AddUnsigned(c, CC);
                d = md5_AddUnsigned(d, DD);
            }
            return (md5_WordToHex(a) + md5_WordToHex(b) + md5_WordToHex(c) + md5_WordToHex(d)).toLowerCase();
        },
        /**
         * 获取存储类型的中文名称
         * @method getStorageAliasByType
         * @public
         * @param {string} storage_type     存储类型字符串
         * @return {string}                 存储的中文名称
         */
        getStorageAliasByType: function (storage_type) {
            if (typeof storage_type === "string") {
                storage_type = storage_type.toUpperCase();
            }
            var another_namers = {};
            another_namers.SD = "SD卡";
            another_namers.SATA = "硬盘(SATA)";
            another_namers.USB = "USB设备";
            another_namers.DISK = "硬盘(DISK)";
            another_namers.TF = "TF卡";
            another_namers.SSD = "硬盘(SSD)";
            another_namers.MTD = "加密分区(插件)";
            if (another_namers[storage_type]) {
                return another_namers[storage_type];
            }
            return storage_type;
        },
        /**
         * 获取存储的错误信息
         * @method getMsgByStorageStatus
         * @public
         * @param {string} status     存储的状态信息
         * @return {string}           存储的错误信息
         */
        getMsgByStorageStatus: function (status) {
            var storage_state_data = {};
            storage_state_data.ready = {
                "state": "正常",
                "msg": ""
            };
            storage_state_data.format_fail = {
                "state": "格式化失败",
                "msg": "格式化失败，请稍后重试"
            };
            storage_state_data.mount_fail = {
                "state": "挂载失败",
                "msg": "挂载失败，建议尝试格式化修复"
            };
            storage_state_data.mount_partly = {
                "state": "部分存储分区挂载失败",
                "msg": "警告：部分存储分区挂载失败"
            };
            storage_state_data.mounting = {
                "state": "挂载中",
                "msg": "挂载中 (请稍后再查看)"
            };
            storage_state_data.formatting = {
                "state": "格式化中",
                "msg": "格式化中 (请稍后再查看)"
            };
            storage_state_data.umounting = {
                "state": "移除中",
                "msg": "移除中 (请稍后再查看)"
            };
            storage_state_data.umounted = {
                "state": "已卸载",
                "msg": "已卸载，请稍后刷新查看最新状态"
            };
            //磁盘扫描中的状态
            storage_state_data.fsck = {
                "state": "磁盘扫描状态",
                "msg": "正在磁盘扫描状态,请稍后刷新"
            };
            //兼容老版本的接口参数
            storage_state_data.not_init = {
                "state": "格式不符",
                "msg": "格式不符，需要格式化（如果是刚刚插入卡，请刷新查看最新状态）"
            };
            storage_state_data.notformat = {
                "state": "格式不符",
                "msg": "格式不符，需要格式化（如果是刚刚插入卡，请刷新查看最新状态）"
            };
            storage_state_data.failed = {
                "state": "挂载失败",
                "msg": "挂载失败，建议尝试格式化修复"
            };
            storage_state_data.locked = {
                "state": "禁止写入",
                "msg": "禁止写入，可能开启了写保护"
            };
            if (!status) {
                storage_state_data[status] = {
                    "state": "",
                    "msg": "路由器没有发现存储设备"
                };
            }
            return storage_state_data[status] || {
                "state": "未知错误",
                "msg": "未知错误，建议尝试格式化修复"
            };
        },
        /**
         * 获取极路由设备的wan口状态值
         * @method getWanModesText
         * @public
         * @param {string} key        wan口模式字段
         * @return {string}           wan口模式名称
         */
        getWanModesText: function (key) {
            var wan_modes_text = {
                "auto": "自动协商",
                "10full": "10M全双工",
                "10half": "10M半双工",
                "100full": "100M全双工",
                "100half": "100M半双工",
                "1000full": "1000M全双工",
                "1000half": "1000M半双工"
            };
            return wan_modes_text[key] || wan_modes_text.auto;
        },
        /**
         * 获取极路由设备的默认名称
         * @method getDefaultName
         * @public
         * @param {string} mac        MAC地址
         * @return {string}           极路由默认名称（HiWiFi_123456）
         */
        getDefaultName: function (mac) {
            var _self = this;
            var new_mac = _self.formatMacAddress(mac, false);
            var pre_router_name = window.g_pre_router_name || "HiWiFi";
            if (new_mac.substr(0, 6) === "D4EE07") {
                return pre_router_name + "_" + new_mac.substr(6, 12);
            }
            return "";
        },
        /**
         * 重新尝试执行函数
         * @method retry
         * @public
         * @param {function} retry_function     需要重新尝试执行的函数
         * @param {object} retry_arguments      函数执行时携带的参数agreements对象
         * @param {string} [max_times]          尝试的最大次数，默认3次
         */
        retry: function (retry_function, retry_arguments, max_times) {
            //最好使用观察者模式去做这件事，有个第三方的manager,去管理，去触发这件事
            max_times = max_times || 3;
            retry_arguments = retry_arguments || [];
            var _self = this;
            var timer = null;
            var function_name = "";
            var num = 0;
            if (typeof retry_function === "function") {
                function_name = retry_function.toString().match(/function\s*([^()]*)\(/)[1] || "name";
                num = repeat_history[function_name] || 0;
                repeat_history[function_name] = num + 1;
                if (repeat_history[function_name] > max_times) {
                    return;
                }
                timer = setTimeout(function () {
                    //因为js语法规范限制出入参数不得大于4个，所以这利用4个传入参数
                    retry_function(retry_arguments[0], retry_arguments[1], retry_arguments[2], retry_arguments[3]);
                    retry_function = null;
                    retry_arguments = null;
                }, 1500);
                _self.addTimerToGlobal(timer);
            }
        },
        /**
         * 将相同类型的对象的内容向左合并
         * @method extendSameAttr
         * @public
         * @param {object} obj          原始数据的对象
         * @param {object} update_obj   包含更新信息的数据对象
         * @return {boolean}            原始对象是否发生了改变
         */
        extendSameAttr: function (obj, update_obj) {
            obj = obj || {};
            update_obj = update_obj || {};
            var is_changed = false;
            var name = null;
            for (name in update_obj) {
                if (typeof obj[name] !== "undefined" && obj[name] !== update_obj[name]) {
                    obj[name] = update_obj[name];
                    is_changed = true;
                }
            }
            return is_changed;
        },

        /**
         * 重构JSON对象，使其变得简单(将从form表单中提取出的json对象简化)
         * {name:"ssid",value:"HiWiFi-5661"} to {ssid:"HiWiFi-5661"}
         * @method simplifyJSON
         * @public
         * @for HiWiFi
         * @param {object} old_json         需要格式化的json对象
         * @param {object} [config]         函数执行时携带的参数agreements对象
         * @return {object}                 被简化过的json对象
         */
        simplifyJSON: function (old_json, config) {
            var obj = {};
            config = config || {};
            var value = "";
            $.each(old_json, function () {
                if (!this || !this.name) {
                    obj = old_json;
                    return false;
                }
                value = this.value || "";
                if (config === true || config[this.name]) {
                    value = $.trim(value);
                }
                if (obj[this.name]) {
                    if (!HiWiFi.isArray(obj[this.name])) {
                        obj[this.name] = [obj[this.name]];
                    }
                    obj[this.name].push(value);
                } else {
                    obj[this.name] = value;
                }
            });
            return obj;
        },
        /**
         * 为document元素去除首尾空格，依赖JQuery
         * @method formElementTrim
         * @public
         * @param {object} element         需要格式化的document元素
         * @param {array} exception        例外的表单name数组
         */
        formElementTrim: function (element, exception) {
            exception = exception;
            var $element = $(element);
            var element_array = [];
            var element_name = "";
            if ($element.is("input") || $element.is("textarea")) {
                $element.val($.trim($element.val()));
                return;
            }
            element_array = $element.find("input,textarea");
            $.each(element_array, function (index, value) {
                element_name = $(value).attr('name') || "";
                if (!HiWiFi.isArray(exception) && !HiWiFi.inArray(element_name, exception)) {
                    $(value).val($.trim($(value).val()));
                }
            });
        },
        /**
         * 获取jsonp方式调用openapi所需要的token，依赖JQuery
         * @method getLocalToken
         * @public
         * @param {string} syspwd         路由器后台密码
         * @param {function} callback     获取到token后执行回调
         */
        getLocalToken: function (syspwd, callback) {
            //根据路由器管理密码获取local_token,多用于jsonp调用openapi
            syspwd = syspwd || "admin";
            var data = 'api_args={"syspwd":"' + syspwd + '"}';
            $.ajax({
                type: "get",
                async: false,
                url: "http://client.openapi.hiwifi.com/generate_local_token?local=1&callback=?",
                data: data,
                dataType: "json",
                success: function (rsp) {
                    if (typeof callback === "function") {
                        callback(rsp);
                    }
                },
                error: function (e) {
                    if (typeof callback === "function") {
                        callback({
                            msg: "获取token失败"
                        });
                    }
                }
            });
        },
        /**
         * 在web页面中启动app，依赖JQuery
         * @method startApp
         * @public
         * @param {string} action         启动app后需要执行的action
         * @param {function} callback     没有app时执行回调
         */
        startApp: function (action, errorCallback) {
            action = action || "";
            var _self = HiWiFi;
            var iframe = window.document.createElement("iframe");
            iframe.hidden = true;
            var chrome_num = _self.getChromeNum();
            if ($(window).width() > 10) {
                iframe.src = 'http://www.hiwifi.com';
                document.body.appendChild(iframe);
                setTimeout(function () {
                    if (chrome_num > 25) {
                        location.href = "intent://" + action + "/#Intent;scheme\x3dhiwifi;package\x3dcom.hiwifi;end";
                    } else {
                        iframe.src = 'hiwifi://' + action;
                        document.body.appendChild(iframe);
                    }
                }, 1500);
                setTimeout(function () {
                    if (typeof errorCallback === "function") {
                        errorCallback();
                    }
                }, 1750);
            }
        }
    };

    //网络相关的函数工具
    var network_tools = {
        /**
         * 通过图片的url获取图片，并执行回调
         * @method getNetworkStatusByImages
         * @public
         * @param {array} images          图片url数组
         * @param {function} callback     always回调函数，携带参数boolean值，true成功，false失败
         */
        getNetworkStatusByImages: function (images, callback) {
            var img = {};
            var random = 1;
            var rnd_id = "";
            var i = 0;
            var num = 0;
            var is_conn = false;
            images = images || [];
            var img_callback = function (e) {
                var status = e.type !== "error" ? true : false;
                num++;
                if (status) {
                    is_conn = status;
                    if (typeof callback === "function") {
                        callback(true);
                    }
                } else if (!is_conn && num === images.length) {
                    if (typeof callback === "function") {
                        callback(false);
                    }
                }
            };
            for (i = 0; i < images.length; i++) {
                img = new Image();
                img.hidden = true;
                random = Math.random();
                rnd_id = "_img_" + random;
                window[rnd_id] = img;
                img.onload = img_callback;
                img.onerror = img_callback;
                img.src = images[i] + "?_" + random;
            }
        },
        /**
         * 通过BAT的静态文件图片，来判断是否还在连接着外网（使用时需要先测试，图片是否还存在）
         * @method isConnectedNetwork
         * @public
         * @param {function} callback     always回调函数，携带参数boolean值，true成功，false失败
         */
        isConnectedNetwork: function (callback) {
            var images = [];
            images.push("http://www.baidu.com/img/bdlogo.gif");
            images.push("http://mat1.gtimg.com/www/images/qq2012/qqlogo_1x.png");
            this.getNetworkStatusByImages(images, callback);
        }
    };


    /**
     * 一个已提供getData、updateData、addChangeListener等方法的数据仓库，监听的事件在数据发生变化时触发
     * @class  HiWiFi.dataStore
     * @constructor
     * @param {object} data         初始化参数，需要固化的数据对象的对象{"对象1":{}, "对象2ModelObject":function() {return {...}}, "对象2":[]}
     * @return {object}             经过初始化后的store对象
     */
    HiWiFi.dataStore = function (data) {
        //进行初始化
        data_store_cache = data || {};
        data_store_change_listener = {};

    };
    $.extend(true, HiWiFi.dataStore, {
        /**
         * 更新dataStore缓存的数据对象，如果发生数据变化则触发相应事件
         * @method updateData
         * @public
         * @for HiWiFi.dataStore
         * @param {string} name         需要更新的对象的名称
         * @param {object} obj          需要更新的内容对象
         */
        updateData: function (name, obj) {
            var _self = this;
            var new_obj = {};
            if (typeof name !== "string" || !name || typeof data_store_cache[name] === "undefined") {
                return;
            } else if (HiWiFi.isArray(data_store_cache[name])) {
                if (HiWiFi.isArray(obj)) {
                    data_store_cache[name] = obj;
                    //约定数组内的模板对象是通过***ModelObject命名的，且为函数式创建对象
                    //例：aplistModelObject和aplist，aplist是个数组，aplistModelObject是个函数并需要return{...}
                } else if (typeof data_store_cache[name + "ModelObject"] !== "function") {
                    new_obj = data_store_cache[name + "ModelObject"]();
                    HiWiFi.extendSameAttr(new_obj, obj);
                    data_store_cache[name].push(new_obj);
                } else {
                    data_store_cache[name].push(obj);
                }
                //数组对象，不做复杂对比，认为每次更新都有改变
                _self.fireChangeCallbacks(name);
            } else {
                //更新普通对象，如果属性发生改变触发事件
                HiWiFi.extendSameAttr(data_store_cache[name], obj) && _self.fireChangeCallbacks(name);
            }
        },
        /**
         * 获取一个被固化的对象
         * @method getData
         * @public
         * @for HiWiFi.dataStore
         * @param {string} name         需要获取的对象的名称
         * @return {object}             带有数据的对象
         */
        getData: function (name) {
            var obj = typeof name === "undefined" ? data_store_cache : (data_store_cache[name] || data_store_cache);
            return HiWiFi.cloneObj(obj);
        },
        /**
         * 判断是否有这个固化的对象
         * @method checkObjInStore
         * @public
         * @for HiWiFi.dataStore
         * @param {string} name         需要判断的对象的名称
         * @return {blooean}
         */
        checkObjInStore: function (name) {
            return name ? !!data_store_cache[name] : false;
        },
        /**
         * 向dataStore添加数据变化监听事件
         * @method addChangeListener
         * @public
         * @for HiWiFi.dataStore
         * @param {string} names         需要监听的对象的名称
         * @param {function} callback    数据发生变化后需要调用的函数
         */
        addChangeListener: function (names, callback) {
            var i = 0;
            var name = "";
            if (typeof names !== "string") {
                return;
            }

            names = names.split(",");
            for (i = 0; i < names.length; i++) {
                name = names[i];
                if (data_store_cache[name]) {
                    data_store_change_listener[name] = data_store_change_listener[name] || [];
                    data_store_change_listener[name].push(callback);
                }
            }

        },
        /**
         * 移除某个datastore的数据对象上所有已添加的监听事件
         * @method removeChangeListener
         * @public
         * @for HiWiFi.dataStore
         * @param {string} names         需要监听的对象的名称
         */
        removeChangeListener: function (names) {
            var i = 0;
            var name = "";
            if (typeof names !== "string") {
                return;
            }

            names = names.split(",");
            for (i = 0; i < names.length; i++) {
                name = names[i];
                if (data_store_change_listener[name]) {
                    data_store_change_listener[name] = undefined;
                }
            }
        },
        /**
         * 触发已添加数据变化监听事件
         * ps：被触发的事件不会立即执行，会等待16ms后执行，如果在此期间一个dataChangeCallback被触发了多次，则最后只会触发一次
         * 等待16ms的由来：当发生一个http请求导致多个dataStore的数据源发生改变，而某个对象可能同时监听了这多个数据源，这时事件回调函数就被重复执行了多次
         * 等待就是为了防止某个回调函数被重复调用多次（重复多次操作dom等耗时操作），16ms来源于浏览器的刷新频率60hz（每秒60次），1000 / 60 ≈ 16 
         * @method fireChangeCallbacks
         * @public
         * @for HiWiFi.dataStore
         * @param {string} names         需要监听的对象的名称
         */
        fireChangeCallbacks: function (names) {
            var i = 0;
            var j = 0;
            var name = "";
            if (typeof names !== "string") {
                return;
            }

            names = names.split(",");
            for (i = 0; i < names.length; i++) {
                name = names[i];
                if (HiWiFi.isArray(data_store_change_listener[name])) {
                    for (j in data_store_change_listener[name]) {
                        if (!HiWiFi.inArray(data_store_change_listener[name][j], event_waiting_list)) {
                            event_waiting_list.push(data_store_change_listener[name][j]);
                        }
                    }
                }
            }
            if (!fire_event_timer) {
                fire_event_timer = setTimeout(function () {
                    fire_event_timer = null;
                    var i = 0;
                    for (i in event_waiting_list) {
                        if (typeof event_waiting_list[i] === "function") {
                            event_waiting_list[i]();
                        }
                    }
                    event_waiting_list = [];
                }, 16);
            }
        },
        /**
         * 在controller_view对象中获取使用HiWiFi.dataStore.getData方法的函数（通过字符串匹配），并为其自动添加dataChange事件
         * @method addChangeListenerFromCaller
         * @public
         * @for HiWiFi.dataStore
         * @param {object} obj         controller_view
         */
        addChangeListenerFromCaller: function (obj) {
            var _self = HiWiFi.dataStore;
            if (typeof obj !== "object") {
                return;
            }
            var name = "";
            var i = 0;
            var caller_name_array = [];
            var caller_name = "";
            for (name in obj) {
                if (typeof obj[name] !== "function") {
                    continue;
                }
                caller_name_array = obj[name].toString().match(/HiWiFi.dataStore.getData\((.*?)\)/ig);
                if (HiWiFi.isArray(caller_name_array)) {
                    for (i in caller_name_array) {
                        caller_name = (caller_name_array[i] || "").replace(/HiWiFi.dataStore.getData|\'|\"|\(|\)/ig, "");
                        if (caller_name && data_store_cache[caller_name]) {
                            _self.addChangeListener(caller_name, obj[name]);
                        }
                    }
                }
            }
        }
    });


    //初始化操作：
    //1、通过获得的UA设置默认的客户端类型
    if (HiWiFi.getCookie('is_mobile') === null) {
        if (HiWiFi.isMobile()) {
            HiWiFi.setCookie('is_mobile', 1);
        } else {
            HiWiFi.setCookie('is_mobile', 0);
        }
    }


    return (window.HiWiFi = $.extend(false, window.HiWiFi, HiWiFi, network_tools));
} (window));