import { Vue } from 'vue/types/vue';
import { Route, VueRouter } from 'vue-router/types/router';
declare type VueUrlPersistConstruct = {
    key?: string;
};
declare type UseRouterVue = Vue & {
    $route: Route;
    $router: VueRouter;
};
/**
 * Vue Url 持久化的 class
 */
export declare class VueUrlPersist {
    /**
     * 存到 url query param 的名字
     */
    private key;
    /**
     * 一些选项
     */
    constructor(options?: VueUrlPersistConstruct);
    /**
     * 为 vue 实例上的字段进行深度赋值
     */
    private static setInitData;
    /**
     * 初始化一些数据需要序列化/反序列化到 url data 上
     * @param vm vue 实例
     * @param exps 监视的数据的表达式数组
     */
    private initUrlDataByCreated;
    /**
     * 在组件被 vue-router 路由复用时，单独进行初始化数据
     * @param vm vue 实例
     * @param exps 监视的数据的表达式数组
     * @param route 将要改变的路由对象
     */
    private initUrlDataByRouteUpdate;
    /**
     * 生成可以 mixin 到 vue 实例的对象
     * @param exps 监视的数据的表达式数组
     * @returns {{created(): void, beforeRouteEnter(*=, *, *): void, beforeRouteUpdate(*=, *, *): void}}
     */
    generateInitUrlData(...exps: string[]): {
        created(): void;
        beforeRouteUpdate(to: Route, from: any, next: () => void): void;
        beforeRouteEnter(to: Route, from: any, next: (callback: (vm: UseRouterVue) => void) => void): void;
    };
    /**
     * 修改一些配置
     * @param options 配置项
     */
    config(options: VueUrlPersistConstruct): void;
}
/**
 * 导出一个默认的 VueUrlPersist 实例
 */
export declare const vueUrlPersist: VueUrlPersist;
/**
 * 导出用于生成可以 mixin 到 vue 实例的对象
 */
export declare const generateInitUrlData: (...exps: string[]) => {
    created(): void;
    beforeRouteUpdate(to: Route, from: any, next: () => void): void;
    beforeRouteEnter(to: Route, from: any, next: (callback: (vm: UseRouterVue) => void) => void): void;
};
/**
 * 将 vueUrlPersist 同样默认导出
 */
export default vueUrlPersist;
//# sourceMappingURL=VueUrlPersist.d.ts.map