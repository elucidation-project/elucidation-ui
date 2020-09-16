import { Collection } from 'vue-mc';
import ServiceDependency from '../models/ServiceDependency';

export default class ServiceDependencies extends Collection {
  model() {
    return ServiceDependency;
  }

  defaults() {
    return {
      parentService: null,
      childService: null
    };
  }

  routes() {
    return {
      fetch: `${process.env.VUE_APP_BASE_URL}/elucidate/service/{parentService}/relationship/{childService}`
    };
  }
}
