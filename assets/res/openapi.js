"use strict";
/*
 **Openapi js model
 **Author: peng.kang
 **Date: 2015.10.30
 **Rely: JQuery json3
 **Description: Unified handling through Ajax access interface
 **version: 0.0.2
 */
//@todo 异常捕获(需要有一个对象来处理它),提示文字国际化,
//跨域请求
//国际化
//@jquery的.done的实现
(function (window, undefined) {
    //cgi的url权限标识
    var stok = "";
    var prototype = Object.prototype;
    var object_string = prototype.toString;
    //当前xmlHttpRequest的集合对象
    var current_xhr = {};
    //设定默认的xmlHttpRequest请求的超时时间(单位:ms)
    var timeout_num = 20000;
    //最多缓存xmlHttpRequest请求的数量(单位:个)
    //同一接口的xmlhttprequest对象只在数组中最多保存20个(同一个接口不可能20个都在pending,否则那就是问题,所以暂定数组长度为20)
    var request_cache_max_num = 20;
    //默认openApi接口的版本型号
    var default_version = undefined;
    //Openapi代理接口的uri
    function getOpenapiUri() {
        if (stok) {
            return "/cgi-bin/turbo" + stok + "/proxy/call";
        } else {
            //如果不需要登陆认证
            return "/cgi-bin/turbo/proxy/noauth_call";
        }
    }

    //Fromat JSON对象转换单一key,value的json
    //{name:"ssid",value:"HiWiFi-5661"} to {ssid:"HiWiFi-5661"}
    function simplifyJSON(json_object) {
        var object = {};
        var value = "";
        $.each(json_object, function () {
            if (!this || !this.name) {
                object = json_object;
                return false;
            }
            value = this.value || "";
            if (object[this.name]) {
                //判断对象是否为数组的原生方法
                if (object_string.call(object[this.name]) !== "[object Array]") {
                    object[this.name] = [object[this.name]];
                }
                object[this.name].push(value);
            } else {
                object[this.name] = value;
            }
        });
        return object;
    }
    function setCurrentXHR(full_method_name, xhr) {
        if (!full_method_name || !xhr) {
            return;
        }
        //将方法名作为当前请求对象 的属性名，对象={name:方法名,value:[xmlhttprequest...]}
        if (current_xhr[full_method_name]) {
            if (current_xhr[full_method_name].value.length >= request_cache_max_num) {
                current_xhr[full_method_name].value.shift();
            }
            current_xhr[full_method_name].value.push(xhr);
        } else {
            current_xhr[full_method_name] = {
                name: full_method_name,
                value: [xhr]
            };
        }
    }
    //停止当前正在进行的XMLHttpRequest请求
    function stopRequest(full_method_name) {
        var xhr = [];

        function stopXHRList(xhr) {
            var i = 0;
            for (i = 0; i < xhr.length; i++) {
                if (xhr[i]) {
                    if (xhr[i].connection) {
                        try {
                            xhr[i].connection.close();
                        } catch (e) { /* ignore error on closing */ }
                    } else if (xhr[i].abort) {
                        xhr[i].abort();
                    }
                    xhr[i] = undefined;
                }
            }
        }
        if (typeof current_xhr === "object") {
            //如果传值则停止 所传值类的 xmlhttprequest请求
            if (typeof full_method_name === "string" && full_method_name !== "") {
                $.each(current_xhr, function () {
                    xhr = this.value;
                    if (xhr && $.isArray(xhr) && xhr.length > 0 && this.name === full_method_name) {
                        stopXHRList(xhr);
                    }
                });
            } else {
                //如果不传值则停止 所有的正在xmlhttprequest请求
                $.each(current_xhr, function () {
                    xhr = this.value;
                    if (xhr && $.isArray(xhr) && xhr.length > 0) {
                        stopXHRList(xhr);
                    }
                });
            }
        }
    }

    function checkRequestParameter(full_method_name, request_data, callbacks) {
        //对full_method_name进行非string判断
        if (typeof full_method_name !== "string") {
            throw new Error("that full_method_name is not a string!");
            //full_method_name的方法全名称 例:network.wan.get_simple_info
        } else if (full_method_name.split(".").length < 2) {
            throw new Error("that full_method_name is like 'xxx.xxx.xxx'!");
            //对request_data进行非undefined判断
        } else if (typeof request_data === "undefined") {
            throw new Error(full_method_name + "::the request_data is must exist");
            //对request_configs进行非undefined判断
        } else if (typeof callbacks !== "object") {
            throw new Error(full_method_name + "::that callbacks is not a object!");
            //如果没有传入always函数,则对success,responseError,requestError进行判断
        } else if (typeof callbacks.always !== "function") {
            if (typeof callbacks.success !== "function") {
                throw new Error(full_method_name + "::the callbacks.success is must exist");
            } else if (typeof callbacks.responseError !== "function") {
                throw new Error(full_method_name + "::the callbacks.responseError is must exist");
            } else if (typeof callbacks.requestError !== "function") {
                throw new Error(full_method_name + "::the callbacks.requestError is must exist");
            }
        }
        return true;
    }
    //执行ajax请求
    function executeRequest(ajaxData, request_configs, callbacks_context) {
        //将函数本地化,作为上下文传如ajax函数,防止并发时callback函数被覆盖
        //callbacks_的value里不能存放字面量对象,如果是字面量对象会被覆盖
        //对request_configs进行本地化
        request_configs = request_configs || {};
        var timeout = request_configs.timeout || timeout_num;
        var full_method_name = ajaxData.method || (request_configs.alias || "mutiCall");
        var xhr = $.ajax({
            url: getOpenapiUri() + "?_" + full_method_name,
            cache: false,
            type: "POST",
            async: true, //同步会影响页面的渲染--此处选择异步
            dataType: "json",
            data: JSON.stringify(ajaxData),
            timeout: timeout,
            context: callbacks_context
        });
        xhr.done(function (rsp, status, xhr) {
            var callbacks = $(this)[0];
            if (rsp.code === 0 || rsp.code === "0") {
                if (typeof callbacks.success === "function") {
                    callbacks.success(rsp, status, xhr);
                }
            } else {
                if (rsp.code === 99999 || rsp.code === "99999") {
                    if (typeof callbacks.noAuthError === "function") {
                        callbacks.noAuthError(rsp);
                        return false;
                    }
                }
                callbacks.responseError(rsp);
            }
        });
        xhr.fail(function (e) {
            var callbacks = $(this)[0];
            if (e.status === 0) {
                if (e.statusText === "abort") {
                    if (typeof callbacks.canceledError === "function") {
                        callbacks.canceledError(e);
                        return false;
                    }
                } else if (e.statusText === "timeout") {
                    if (typeof callbacks.timeoutError === "function") {
                        callbacks.timeoutError(e);
                        return false;
                    }
                }
            }
            callbacks.requestError(e);
        });
        xhr.always(function (rsp) {
            var callbacks = $(this)[0];
            if (typeof callbacks.always === "function") {
                callbacks.always(rsp);
            }
        });
        setCurrentXHR(full_method_name, xhr);
        return xhr;
    }
    //执行单一接口的http请求的模式的ajax请求
    function ExecuteSingleRequest(full_method_name, request_data, request_configs, callbacks) {
        var ajaxData = {
            method: full_method_name,
            data: request_data,
            version: request_configs ? request_configs.version || default_version : default_version
        };
        if (request_configs && request_configs.repeat_call) {
            ajaxData.repeat_call = request_configs.repeat_call;
        }
        //callbacks本地化
        var callbacks_context = {
            success: callbacks.success,
            noAuthError: callbacks.noAuthError,
            responseError: callbacks.responseError,
            canceledError: callbacks.canceledError,
            timeoutError: callbacks.timeoutError,
            requestError: callbacks.requestError,
            always: callbacks.always
        };
        //执行请求
        var xhr = executeRequest(ajaxData, request_configs, callbacks_context);
        return xhr;
    }
    //执行多个接口一个http请求的模式的ajax请求
    function ExecuteMutiRequest(parameters) {
        var request_configs = parameters.request_configs || {};
        //多接口调用的success函数包含success和responseError
        var response_callback = parameters.response_callback || [];
        //error回调函数与always回调函数依附于全局函数
        var no_auth_error = parameters.no_auth_error || [];
        var response_error = parameters.response_error || [];
        var canceled_error = parameters.canceled_error || [];
        var timeout_error = parameters.timeout_error || [];
        var request_error = parameters.request_error || [];
        var always = parameters.always || [];
        var muti_arguments = parameters.muti_arguments || [];

        var ajaxData = {
            muticall: "1",
            mutiargs: muti_arguments,
            version: request_configs ? request_configs.version || default_version : default_version
        };
        var callbacks_context = {
            success: function (rsp, status, xhr) {
                var data = rsp.data || {};
                var results = data.results || [];
                var index_object = {};
                var array_index = 0;
                var method = "";
                var result = {};
                var method_callback = {};
                $.each(results, function (index, value) {
                    method = value.method || "";
                    result = value.result || {};
                    method_callback = response_callback[method];
                    if (method_callback) {
                        if (typeof method_callback.success === "function") {
                            if (result.code === 0 || result.code === "0") {
                                method_callback.success(result, status, xhr);
                            } else {
                                method_callback.responseError(result);
                            }
                            //针对muticall的同一接口的多次请求处理
                        } else if ($.isArray(method_callback)) {
                            index_object[method] = index_object[method] || {};
                            array_index = index_object[method].index || 0;
                            if (!method_callback[array_index]) {
                                return true;
                            }
                            if (result.code === 0 || result.code === "0") {
                                method_callback[array_index].success(result, status, xhr);
                            } else {
                                method_callback[array_index].responseError(result);
                            }
                            array_index++;
                            index_object[method].index = array_index;
                        }
                    }
                });
            },
            noAuthError: function (rsp) {
                $.each(no_auth_error, function (index, value) {
                    if (typeof value === "function") {
                        value(rsp);
                    }
                });
            },
            responseError: function (rsp) {
                $.each(response_error, function (index, value) {
                    if (typeof value === "function") {
                        value(rsp);
                    }
                });
            },
            canceledError: function (e) {
                $.each(canceled_error, function (index, value) {
                    if (typeof value === "function") {
                        value(e);
                    }
                });
            },
            timeoutError: function (e) {
                $.each(timeout_error, function (index, value) {
                    if (typeof value === "function") {
                        value(e);
                    }
                });
            },
            requestError: function (e) {
                $.each(request_error, function (index, value) {
                    if (typeof value === "function") {
                        value(e);
                    }
                });
            },
            always: function (rsp) {
                $.each(always, function (index, value) {
                    if (typeof value === "function") {
                        value(rsp);
                    }
                });
            }
        };
        //执行请求
        var xhr = executeRequest(ajaxData, request_configs, callbacks_context);
        return xhr;
    }

    //初始化openapi对象
    var Openapi = function (muti_call) {
        var that = {};
        if (muti_call && typeof muti_call === "object" && typeof muti_call.send === "function" && typeof muti_call.push === "function") {
            that.appendCall = function (full_method_name, request_data, request_configs, callbacks) {
                return muti_call.push(full_method_name, request_data, callbacks);
            };
        } else {
            that.appendCall = function (full_method_name, request_data, request_configs, callbacks) {
                return Openapi.call(full_method_name, request_data, request_configs, callbacks);
            };
        }
        return that;
    };

    //扩展openapi对象
    $.extend(true, Openapi, {
        setStok: function (new_stok) {
            stok = new_stok;
        },
        getStok: function () {
            return stok;
        },
        //单一接口一个http请求的模式
        call: function (full_method_name, request_data, request_configs, callbacks) {
            //校验参数
            checkRequestParameter(full_method_name, request_data, callbacks);
            //把request_data处理成与Openapi约定的格式,封装到ajaxData
            if (!request_data) {
                request_data = {};
            } else if (typeof request_data === "object") {
                request_data = simplifyJSON(request_data);
            }
            return new ExecuteSingleRequest(full_method_name, request_data, request_configs, callbacks);
        },
        //多个接口一个http请求的模式
        mutiCall: function (request_configs, global_error_callbacks) {
            var response_callback = {};
            var muti_arguments = [];
            var no_auth_error = [];
            var response_error = [];
            var canceled_error = [];
            var timeout_error = [];
            var request_error = [];
            var always = [];

            function addFunctionToArray(callbacks) {
                if (callbacks) {
                    if (typeof callbacks.noAuthError === "function") {
                        no_auth_error.push(callbacks.noAuthError);
                    }
                    if (typeof callbacks.responseError === "function") {
                        response_error.push(callbacks.responseError);
                    }
                    if (typeof callbacks.canceledError === "function") {
                        canceled_error.push(callbacks.canceledError);
                    }
                    if (typeof callbacks.timeoutError === "function") {
                        timeout_error.push(callbacks.timeoutError);
                    }
                    if (typeof callbacks.requestError === "function") {
                        request_error.push(callbacks.requestError);
                    }
                    if (typeof callbacks.always === "function") {
                        always.push(callbacks.always);
                    }
                }
            }
            addFunctionToArray(global_error_callbacks);
            var that = {
                send: function () {
                    if (!muti_arguments || muti_arguments.length < 1) {
                        throw new Error("::the full_method_name, request_data, request_configs, callbacks is must exist!");
                    }
                    var parameters = {
                        request_configs: request_configs,
                        muti_arguments: muti_arguments,
                        response_callback: response_callback,
                        no_auth_error: no_auth_error,
                        response_error: response_error,
                        canceled_error: canceled_error,
                        timeout_error: timeout_error,
                        request_error: request_error,
                        always: always
                    };
                    //发送请求
                    var xhr = new ExecuteMutiRequest(parameters);
                    //释放内存
                    response_callback = null;
                    muti_arguments = null;
                    no_auth_error = null;
                    response_error = null;
                    canceled_error = null;
                    timeout_error = null;
                    request_error = null;
                    always = null;
                    return xhr;
                },
                push: function (full_method_name, request_data, callbacks) {
                    //校验参数
                    checkRequestParameter(full_method_name, request_data, callbacks);
                    addFunctionToArray(callbacks);
                    if (typeof response_callback[full_method_name] === "undefined") {
                        response_callback[full_method_name] = {
                            success: callbacks.success,
                            responseError: callbacks.responseError
                        };
                        //针对muticall的同一接口的多次请求处理--如果是数组
                    } else if ($.isArray(response_callback[full_method_name])) {
                        response_callback[full_method_name].push({
                            success: callbacks.success,
                            responseError: callbacks.responseError
                        });
                        //针对muticall的同一接口的多次请求处理--如果不是是数组
                    } else {
                        response_callback[full_method_name] = [response_callback[full_method_name]];
                        response_callback[full_method_name].push({
                            success: callbacks.success,
                            responseError: callbacks.responseError
                        });
                    }

                    //把request_data处理成与Openapi约定的格式,封装到ajaxData
                    if (!request_data) {
                        request_data = {};
                    } else if (typeof request_data === "object") {
                        request_data = simplifyJSON(request_data);
                    }
                    muti_arguments.push({
                        method: full_method_name,
                        data: request_data || {}
                    });
                    return that;
                }
            };

            return that;
        },
        repeatCall: function (full_method_name, request_configs, callbacks) {
            request_configs = request_configs || {};
            //此方法需要依赖pushstream.js and 此处添加限制只有无传参读取操作的接口才能使用
            if (!window.PushStream || !window.PushStreamManager) {
                throw new Error("The repeatCall depends on the pushstream.js");
            } else {
                //校验参数
                checkRequestParameter(full_method_name, null, callbacks);
                var channel_id = full_method_name.replace(/\./g, "_");
                var repeat_call = request_configs.repeat_call || {};
                repeat_call.call_id = "call_" + channel_id;
                repeat_call.channel_id = channel_id;
                repeat_call.interval = repeat_call.interval || 1;//默认推送间隔为1s
                repeat_call.count = repeat_call.count || 30;//默认推送30次
                repeat_call.channel_type = repeat_call.channel_type || "local";
                request_configs.repeat_call = repeat_call;
                //向路由器发起repeatCall请求
                new ExecuteSingleRequest(full_method_name, null, request_configs, callbacks);
                var pushstream = null;
                var hostname = "push.openapi.hiwifi.com";
                var port = "80";
                if (current_xhr["pushstream." + full_method_name]) {
                    return;
                }
                //与路由器建立长连接，或长轮询连接
                //@todo缺少相应的请求权限验证
                if (window.WebSocket) {
                    pushstream = new PushStream({
                        host: hostname,
                        port: port,
                        modes: "websocket",
                        onmessage: function (text) {
                            if (!text) {
                                return;
                            }
                            callbacks.success(text);
                        }
                    });
                    pushstream.addChannel(channel_id);
                    pushstream.connect();
                } else {
                    pushstream = new PushStream({
                        host: hostname,
                        port: port,
                        modes: "longpolling",
                        tagArgument: 'tag', //this is the default value, you have to change it to be the same value used on push_stream_last_received_message_tag directive
                        timeArgument: 'time', //this is the default value, you have to change it to be the same value used on push_stream_last_received_message_time directive
                        useJSONP: true, //this is used only to force jsonp usage on example, it is automatic true when the domains are different
                        timeout: 30000, //this is the default value, you have to change it to be the same value used on push_stream_longpolling_connection_ttl directive in miliseconds
                        onmessage: function (text) {
                            if (!text) {
                                return;
                            }
                            callbacks.success(text);
                        }
                    });
                    pushstream.addChannel(channel_id);
                    pushstream.connect();
                }
                setCurrentXHR("pushstream." + full_method_name, pushstream);
            }
        },
        cancelRequest: function (full_method_name) {
            //同一方法名只缓存20个xmlHttpRequest请求
            stopRequest(full_method_name);
        }
    });
    //通过location.pathname尝试获取stok字符串，初始化Openapi私有属性stok
    if (window.location && window.location.pathname) {
        stok = window.location.pathname.match(/\/cgi-bin\/turbo(\/;stok=\w+)/) || "";
        stok = stok[1] || "";
    }

    return (window.Openapi = Openapi);
})(window);
