import { Collection } from 'vue-mc';
import Service from '../models/Service';

export default class Services extends Collection {
  model() {
    return Service;
  }

  routes() {
    return {
      fetch: `${process.env.VUE_APP_BASE_URL}/elucidate/services/details`
    };
  }
}
