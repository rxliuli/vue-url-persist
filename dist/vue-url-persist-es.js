/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function parseFieldStr(str) {
    return str
        .split(/[\\.\\[]/)
        .map(function (k) { return (/\]$/.test(k) ? k.slice(0, k.length - 1) : k); });
}
/**
 * 安全的深度获取对象的字段
 * 注: 只要获取字段的值为 {@type null|undefined}，就会直接返回 {@param defVal}
 * 类似于 ES2019 的可选调用链特性: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/%E5%8F%AF%E9%80%89%E9%93%BE
 * @param obj 获取的对象
 * @param fields 字段字符串或数组
 * @param [defVal] 取不到值时的默认值，默认为 null
 */
function get(obj, fields, defVal) {
    if (defVal === void 0) { defVal = null; }
    if (typeof fields === 'string') {
        fields = parseFieldStr(fields);
    }
    var res = obj;
    for (var _i = 0, _a = fields; _i < _a.length; _i++) {
        var field = _a[_i];
        try {
            res = Reflect.get(res, field);
            if (res === undefined || res === null) {
                return defVal;
            }
        }
        catch (e) {
            return defVal;
        }
    }
    return res;
}
/**
 * 安全的深度设置对象的字段
 * @param obj 设置的对象
 * @param fields 字段字符串或数组
 * @param [val] 设置字段的值
 */
function set(obj, fields, val) {
    if (typeof fields === 'string') {
        fields = parseFieldStr(fields);
    }
    var res = obj;
    for (var i = 0, len = fields.length; i < len; i++) {
        var field = fields[i];
        if (i === len - 1) {
            res[field] = val;
            return true;
        }
        res = res[field];
        if (typeof res !== 'object') {
            return false;
        }
    }
    return false;
}
/**
 * 函数去抖
 * 去抖 (debounce) 去抖就是对于一定时间段的连续的函数调用，只让其执行一次
 * 注: 包装后的函数如果两次操作间隔小于 delay 则不会被执行, 如果一直在操作就会一直不执行, 直到操作停止的时间大于 delay 最小间隔时间才会执行一次, 不管任何时间调用都需要停止操作等待最小延迟时间
 * 应用场景主要在那些连续的操作, 例如页面滚动监听, 包装后的函数只会执行最后一次
 * 注: 该函数第一次调用一定不会执行，第一次一定拿不到缓存值，后面的连续调用都会拿到上一次的缓存值。如果需要在第一次调用获取到的缓存值，则需要传入第三个参数 {@param init}，默认为 {@code undefined} 的可选参数
 * 注: 返回函数结果的高阶函数需要使用 {@see Proxy} 实现，以避免原函数原型链上的信息丢失
 *
 * @param action 真正需要执行的操作
 * @param delay 最小延迟时间，单位为 ms
 * @param init 初始的缓存值，不填默认为 {@see undefined}
 * @return function(...[*]=): Promise<any> {@see action} 是否异步没有太大关联
 */
/**
 * 函数去抖
 * 去抖 (debounce) 去抖就是对于一定时间段的连续的函数调用，只让其执行一次
 * 注: 包装后的函数如果两次操作间隔小于 delay 则不会被执行, 如果一直在操作就会一直不执行, 直到操作停止的时间大于 delay 最小间隔时间才会执行一次, 不管任何时间调用都需要停止操作等待最小延迟时间
 * 应用场景主要在那些连续的操作, 例如页面滚动监听, 包装后的函数只会执行最后一次
 * 注: 该函数第一次调用一定不会执行，第一次一定拿不到缓存值，后面的连续调用都会拿到上一次的缓存值。如果需要在第一次调用获取到的缓存值，则需要传入第三个参数 {@param init}，默认为 {@code undefined} 的可选参数
 * 注: 返回函数结果的高阶函数需要使用 {@see Proxy} 实现，以避免原函数原型链上的信息丢失
 *
 * @param delay 最小延迟时间，单位为 ms
 * @param action 真正需要执行的操作
 * @param init 初始的缓存值，不填默认为 {@see undefined}
 * @return 包装后有去抖功能的函数。该函数是异步的，与需要包装的函数 {@see action} 是否异步没有太大关联
 */
function debounce(action, delay, init) {
    if (init === void 0) { init = null; }
    var flag;
    var result = init;
    return function () {
        var _this = this;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return new Promise(function (resolve) {
            if (flag)
                clearTimeout(flag);
            flag = setTimeout(
            // @ts-ignore
            function () { return resolve((result = action.apply(_this, args))); }, delay);
            setTimeout(function () { return resolve(result); }, delay);
        });
    };
}

/**
 * Vue Url 持久化的 class
 */
var VueUrlPersist = /** @class */ (function () {
    /**
     * 一些选项
     */
    function VueUrlPersist(options) {
        if (options === void 0) { options = {}; }
        /**
         * 存到 url query param 的名字
         */
        this.key = 'qb';
        Object.assign(this, options);
    }
    /**
     * 为 vue 实例上的字段进行深度赋值
     */
    VueUrlPersist.setInitData = function (vm, exp, urlData) {
        var oldVal = get(vm, exp, null);
        var newVal = urlData[exp];
        //如果原值是对象且新值也是对象，则进行浅合并
        if (oldVal === undefined ||
            oldVal === null ||
            typeof oldVal === 'string' ||
            typeof oldVal === 'number') {
            set(vm, exp, newVal);
        }
        else if (typeof oldVal === 'object' && typeof newVal === 'object') {
            Object.assign(get(vm, exp), newVal);
        }
    };
    /**
     * 初始化一些数据需要序列化/反序列化到 url data 上
     * @param vm vue 实例
     * @param exps 监视的数据的表达式数组
     */
    VueUrlPersist.prototype.initUrlDataByCreated = function (vm, exps) {
        var key = this.key;
        var urlData = JSON.parse(vm.$route.query[key] || '{}');
        exps.forEach(function (exp) {
            VueUrlPersist.setInitData(vm, exp, urlData);
            vm.$watch(exp, debounce(function (val) {
                var _a;
                urlData[exp] = val;
                if (vm.$route.query[key] === JSON.stringify(urlData)) {
                    return;
                }
                vm.$router.replace({
                    query: __assign(__assign({}, vm.$route.query), (_a = {}, _a[key] = JSON.stringify(urlData), _a))
                });
            }, 1000), {
                deep: true
            });
        });
    };
    /**
     * 在组件被 vue-router 路由复用时，单独进行初始化数据
     * @param vm vue 实例
     * @param exps 监视的数据的表达式数组
     * @param route 将要改变的路由对象
     */
    VueUrlPersist.prototype.initUrlDataByRouteUpdate = function (vm, exps, route) {
        var urlData = JSON.parse(route.query[this.key] || '{}');
        exps.forEach(function (exp) { return VueUrlPersist.setInitData(vm, exp, urlData); });
    };
    /**
     * 生成可以 mixin 到 vue 实例的对象
     * @param exps 监视的数据的表达式数组
     * @returns {{created(): void, beforeRouteEnter(*=, *, *): void, beforeRouteUpdate(*=, *, *): void}}
     */
    VueUrlPersist.prototype.generateInitUrlData = function () {
        var exps = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            exps[_i] = arguments[_i];
        }
        var _this = this;
        return {
            created: function () {
                // @ts-ignore
                _this.initUrlDataByCreated(this, exps);
            },
            beforeRouteUpdate: function (to, from, next) {
                // @ts-ignore
                _this.initUrlDataByRouteUpdate(this, exps, to);
                next();
            },
            beforeRouteEnter: function (to, from, next) {
                next(function (vm) { return _this.initUrlDataByRouteUpdate(vm, exps, to); });
            }
        };
    };
    /**
     * 修改一些配置
     * @param options 配置项
     */
    VueUrlPersist.prototype.config = function (options) {
        Object.assign(this, options);
    };
    return VueUrlPersist;
}());
/**
 * 导出一个默认的 VueUrlPersist 实例
 */
var vueUrlPersist = new VueUrlPersist();
/**
 * 导出用于生成可以 mixin 到 vue 实例的对象
 */
var generateInitUrlData = vueUrlPersist.generateInitUrlData.bind(vueUrlPersist);

export default vueUrlPersist;
export { VueUrlPersist, generateInitUrlData, vueUrlPersist };
//# sourceMappingURL=vue-url-persist-es.js.map
