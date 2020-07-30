import Vue from 'vue';
import ElementUI from 'element-ui';
import VueLodash from 'vue-lodash';
import VueGoodTablePlugin from 'vue-good-table';
import lodash from 'lodash';
import App from './App.vue';
import router from './router';
import store from './store';
import 'element-theme-chalk';

// import the styles
import 'vue-good-table/dist/vue-good-table.css';
import './assets/css/main.css';

Vue.config.productionTip = false;

Vue.use(ElementUI);
Vue.use(VueLodash, { lodash });
Vue.use(VueGoodTablePlugin);

const $ = require('jquery');

window.$ = $;

new Vue({
  router,
  store,
  render: (h) => h(App)
}).$mount('#app');
