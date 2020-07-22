import Vue from 'vue';
import ElementUI from 'element-ui';
import VueLodash from 'vue-lodash';
import lodash from 'lodash';
import App from './App.vue';
import router from './router';
import store from './store';
import 'element-theme-chalk';

Vue.config.productionTip = false;

Vue.use(ElementUI);
Vue.use(VueLodash, { lodash });

new Vue({
  router,
  store,
  render: (h) => h(App)
}).$mount('#app');
