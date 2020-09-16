import { Model } from 'vue-mc';
import moment from 'moment';

export default class ServiceDependency extends Model {
  defaults() {
    return {
      id: null,
      communicationType: null,
      connectionIdentifier: null,
      eventDirection: null,
      lastObserved: 0
    };
  }

  mutations() {
    return {
      lastObserved: (time) => moment(time)
    };
  }
}
