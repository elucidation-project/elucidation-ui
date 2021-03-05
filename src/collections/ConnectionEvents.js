import { Collection } from 'vue-mc';
import ConnectionEvent from '../models/ConnectionEvent';

export default class ConnectionEvents extends Collection {
  model() {
    return ConnectionEvent;
  }

  defaults() {
    return {
      connectionIdentifier: null
    };
  }

  routes() {
    return {
      fetch: `${process.env.VUE_APP_BASE_URL}/elucidate/connectionIdentifier/{connectionIdentifier}/events`
    };
  }
}
