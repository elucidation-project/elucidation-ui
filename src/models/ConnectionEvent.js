import { Model } from 'vue-mc';
import moment from 'moment';

export default class ConnectionEvent extends Model {
  defaults() {
    return {
      id: null,
      communicationType: null,
      connectionIdentifier: 0,
      eventDirection: 0,
      observedAt: 0,
      serviceName: null
    };
  }

  mutations() {
    return {
      observedAt: (time) => moment(time)
    };
  }
}
