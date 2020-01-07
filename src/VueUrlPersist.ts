import { debounce, get, set } from './common'
import { Vue } from 'vue/types/vue'
import { Route, VueRouter } from 'vue-router/types/router'

type VueUrlPersistConstruct = { key?: string }

type UseRouterVue = Vue & { $route: Route; $router: VueRouter }

/**
 * Vue Url 持久化的 class
 */
export class VueUrlPersist {
  /**
   * 存到 url query param 的名字
   */
  private key = 'qb'
  /**
   * 一些选项
   */
  constructor(options: VueUrlPersistConstruct = {}) {
    Object.assign(this, options)
  }

  /**
   * 为 vue 实例上的字段进行深度赋值
   */
  private static setInitData(vm: Vue, exp: string, urlData: any) {
    const oldVal = get(vm, exp, null)
    const newVal = urlData[exp]
    //如果原值是对象且新值也是对象，则进行浅合并
    if (
      oldVal === undefined ||
      oldVal === null ||
      typeof oldVal === 'string' ||
      typeof oldVal === 'number'
    ) {
      set(vm, exp, newVal)
    } else if (typeof oldVal === 'object' && typeof newVal === 'object') {
      Object.assign(get(vm, exp), newVal)
    }
  }
  /**
   * 初始化一些数据需要序列化/反序列化到 url data 上
   * @param vm vue 实例
   * @param exps 监视的数据的表达式数组
   */
  private initUrlDataByCreated(vm: UseRouterVue, exps: string[]) {
    const key = this.key
    const urlData = JSON.parse((vm.$route.query[key] as any) || '{}')
    exps.forEach(exp => {
      VueUrlPersist.setInitData(vm, exp, urlData)
      vm.$watch(
        exp,
        debounce(function(val) {
          urlData[exp] = val
          if (vm.$route.query[key] === JSON.stringify(urlData)) {
            return
          }
          vm.$router.replace({
            query: {
              ...vm.$route.query,
              [key]: JSON.stringify(urlData)
            }
          })
        }, 1000),
        {
          deep: true
        }
      )
    })
  }

  /**
   * 在组件被 vue-router 路由复用时，单独进行初始化数据
   * @param vm vue 实例
   * @param exps 监视的数据的表达式数组
   * @param route 将要改变的路由对象
   */
  private initUrlDataByRouteUpdate(
    vm: UseRouterVue,
    exps: string[],
    route: Route
  ) {
    const urlData = JSON.parse((route.query[this.key] as any) || '{}')
    exps.forEach(exp => VueUrlPersist.setInitData(vm, exp, urlData))
  }

  /**
   * 生成可以 mixin 到 vue 实例的对象
   * @param exps 监视的数据的表达式数组
   * @returns {{created(): void, beforeRouteEnter(*=, *, *): void, beforeRouteUpdate(*=, *, *): void}}
   */
  generateInitUrlData(...exps: string[]) {
    const _this = this
    return {
      created() {
        // @ts-ignore
        _this.initUrlDataByCreated(this, exps)
      },
      beforeRouteUpdate(to: Route, from: any, next: () => void) {
        // @ts-ignore
        _this.initUrlDataByRouteUpdate(this, exps, to)
        next()
      },
      beforeRouteEnter(
        to: Route,
        from: any,
        next: (callback: (vm: UseRouterVue) => void) => void
      ) {
        next(vm => _this.initUrlDataByRouteUpdate(vm, exps, to))
      }
    }
  }

  /**
   * 修改一些配置
   * @param options 配置项
   */
  config(options: VueUrlPersistConstruct) {
    Object.assign(this, options)
  }
}

/**
 * 导出一个默认的 VueUrlPersist 实例
 */
export const vueUrlPersist = new VueUrlPersist()
/**
 * 导出用于生成可以 mixin 到 vue 实例的对象
 */
export const generateInitUrlData = vueUrlPersist.generateInitUrlData.bind(
  vueUrlPersist
)
/**
 * 将 vueUrlPersist 同样默认导出
 */
export default vueUrlPersist
