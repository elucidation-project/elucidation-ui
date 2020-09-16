import { Model } from 'vue-mc';

export default class SystemDependency extends Model {
  defaults() {
    return {
      serviceName: null,
      dependencies: null
    };
  }

  mutations() {
    return {
      serviceName: String
    };
  }
}
