# vue-url-persist

## 简介

这是一个将 vue data 中的响应式数据序列化到 URL 上的库，并能根据 URL 上的数据解析到 data 数据中。

## 使用

```vue
<template>
  <div class="form1">
    <div>
      <label for="keyword">搜索名:</label>
      <input type="text" v-model="form.keyword" id="keyword" />
    </div>
    <div>
      <input
        type="checkbox"
        v-model="form.hobbyList"
        id="anime"
        value="anime"
      />
      <label for="anime">动画</label>
      <input type="checkbox" v-model="form.hobbyList" id="game" value="game" />
      <label for="game">游戏</label>
      <input
        type="checkbox"
        v-model="form.hobbyList"
        id="movie"
        value="movie"
      />
      <label for="movie">电影</label>
    </div>
    <p>
      {{ form }}
    </p>
  </div>
</template>

<script>
import { generateInitUrlData } from 'vue-url-persist'

export default {
  name: 'Form1',
  mixins: [generateInitUrlData('form')],
  data() {
    return {
      form: {
        keyword: '',
        hobbyList: []
      }
    }
  }
}
</script>
```

注意：如果使用子路由，请务必设置 `:key="$route.path"`

```vue
<template>
  <div class="form2">
    <header>
      <RouterLink to="/form2/1">第一个 Tab</RouterLink>
      <RouterLink to="/form2/2">第二个 Tab</RouterLink>
    </header>
    <!--如果有子路由则必须设置该属性-->
    <RouterView :key="$route.path" />
  </div>
</template>
```

## 依赖

依赖于 `vue/vue-router`，请自行在项目中添加这两个依赖。
