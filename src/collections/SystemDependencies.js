import { Collection } from 'vue-mc';
import SystemDependency from '../models/SystemDependency';

export default class SystemDependencies extends Collection {
  model() {
    return SystemDependency;
  }

  defaults() {
    return {
      orderBy: 'serviceName'
    };
  }

  routes() {
    return {
      fetch: `${process.env.VUE_APP_BASE_URL}/elucidate/dependencies/details`
    };
  }
}
