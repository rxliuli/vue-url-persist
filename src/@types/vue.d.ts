//vue-class 没生效
import Vue, { CreateElement, VNode } from 'vue'
import { NavigationGuard } from 'vue-router'
import { VueRouter } from 'vue-router/types/router'

declare module 'vue/types/vue' {
  interface Vue {
    data?(): object
    beforeCreate?(): void
    created?(): void
    beforeMount?(): void
    mounted?(): void
    beforeDestroy?(): void
    destroyed?(): void
    beforeUpdate?(): void
    updated?(): void
    activated?(): void
    deactivated?(): void
    render?(createElement: CreateElement): VNode
    errorCaptured?(err: Error, vm: Vue, info: string): boolean | undefined
    serverPrefetch?(): Promise<unknown>
  }
  interface ComponentOptions<V extends Vue> {
    router?: VueRouter
    beforeRouteEnter?: NavigationGuard<V>
    beforeRouteLeave?: NavigationGuard<V>
    beforeRouteUpdate?: NavigationGuard<V>
  }
}
