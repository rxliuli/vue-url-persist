(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global['vue-url-persist'] = {}));
}(this, (function (exports) { 'use strict';

  function parseFieldStr(str) {
      return str
          .split(/[\\.\\[]/)
          .map(k => (/\]$/.test(k) ? k.slice(0, k.length - 1) : k));
  }
  /**
   * 安全的深度获取对象的字段
   * 注: 只要获取字段的值为 {@type null|undefined}，就会直接返回 {@param defVal}
   * 类似于 ES2019 的可选调用链特性: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/%E5%8F%AF%E9%80%89%E9%93%BE
   * @param obj 获取的对象
   * @param fields 字段字符串或数组
   * @param [defVal] 取不到值时的默认值，默认为 null
   */
  function get(obj, fields, defVal = null) {
      if (typeof fields === 'string') {
          fields = parseFieldStr(fields);
      }
      let res = obj;
      for (const field of fields) {
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
      let res = obj;
      for (let i = 0, len = fields.length; i < len; i++) {
          const field = fields[i];
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
  function debounce(action, delay, init = null) {
      let flag;
      let result = init;
      return function (...args) {
          return new Promise(resolve => {
              if (flag)
                  clearTimeout(flag);
              flag = setTimeout(
              // @ts-ignore
              () => resolve((result = action.apply(this, args))), delay);
              setTimeout(() => resolve(result), delay);
          });
      };
  }

  /**
   * Vue Url 持久化的 class
   */
  class VueUrlPersist {
      /**
       * 一些选项
       */
      constructor(options = {}) {
          /**
           * 存到 url query param 的名字
           */
          this.key = 'qb';
          Object.assign(this, options);
      }
      /**
       * 为 vue 实例上的字段进行深度赋值
       */
      static setInitData(vm, exp, urlData) {
          const oldVal = get(vm, exp, null);
          const newVal = urlData[exp];
          if (
          //为 undefined 则直接返回，但 null 的话一般是刻意设置
          newVal === undefined ||
              //如果原值与新值相同，则需要直接返回
              JSON.stringify(oldVal) === JSON.stringify(newVal)) {
              return;
          }
          if (oldVal === undefined ||
              oldVal === null ||
              typeof oldVal === 'string' ||
              typeof oldVal === 'number' ||
              Array.isArray(oldVal)) {
              set(vm, exp, newVal);
          }
          else if (typeof oldVal === 'object' && typeof newVal === 'object') {
              //如果原值是对象且新值也是对象，则进行浅合并
              Object.assign(get(vm, exp), newVal);
          }
      }
      /**
       * 初始化一些数据需要序列化/反序列化到 url data 上
       * @param vm vue 实例
       * @param exps 监视的数据的表达式数组
       */
      initUrlDataByCreated(vm, exps) {
          const key = this.key;
          const urlData = JSON.parse(vm.$route.query[key] || '{}');
          exps.forEach(exp => {
              VueUrlPersist.setInitData(vm, exp, urlData);
              vm.$watch(exp, debounce(function (val) {
                  urlData[exp] = val;
                  const qbStr = JSON.stringify(urlData);
                  if (vm.$route.query[key] === qbStr) {
                      return;
                  }
                  vm.$router.replace({
                      query: {
                          ...vm.$route.query,
                          [key]: qbStr
                      }
                  });
              }, 1000), {
                  deep: true
              });
          });
      }
      /**
       * 在组件被 vue-router 路由复用时，单独进行初始化数据
       * @param vm vue 实例
       * @param exps 监视的数据的表达式数组
       * @param route 将要改变的路由对象
       */
      initUrlDataByRouteUpdate(vm, exps, route) {
          const urlData = JSON.parse(route.query[this.key] || '{}');
          exps.forEach(exp => VueUrlPersist.setInitData(vm, exp, urlData));
      }
      /**
       * 生成可以 mixin 到 vue 实例的对象
       * @param exps 监视的数据的表达式数组
       * @returns {{created(): void, beforeRouteEnter(*=, *, *): void, beforeRouteUpdate(*=, *, *): void}}
       */
      generateInitUrlData(...exps) {
          const _this = this;
          return {
              created() {
                  // @ts-ignore
                  _this.initUrlDataByCreated(this, exps);
              },
              beforeRouteUpdate(to, from, next) {
                  // @ts-ignore
                  _this.initUrlDataByRouteUpdate(this, exps, to);
                  next();
              },
              beforeRouteEnter(to, from, next) {
                  next(vm => _this.initUrlDataByRouteUpdate(vm, exps, to));
              }
          };
      }
      /**
       * 修改一些配置
       * @param options 配置项
       */
      config(options) {
          Object.assign(this, options);
      }
  }
  /**
   * 导出一个默认的 VueUrlPersist 实例
   */
  const vueUrlPersist = new VueUrlPersist();
  /**
   * 导出用于生成可以 mixin 到 vue 实例的对象
   */
  const generateInitUrlData = vueUrlPersist.generateInitUrlData.bind(vueUrlPersist);

  exports.VueUrlPersist = VueUrlPersist;
  exports.default = vueUrlPersist;
  exports.generateInitUrlData = generateInitUrlData;
  exports.vueUrlPersist = vueUrlPersist;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=vue-url-persist.js.map
