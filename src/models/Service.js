import { Model } from 'vue-mc';

export default class Service extends Model {
  defaults() {
    return {
      id: null,
      serviceName: null,
      inboundEvents: 0,
      outboundEvents: 0,
      communicationTypes: {}
    };
  }
}
