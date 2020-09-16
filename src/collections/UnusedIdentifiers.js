import { Collection } from 'vue-mc';
import UnusedIdentifier from '../models/UnusedIdentifier';

export default class UnusedIdentifiers extends Collection {
  model() {
    return UnusedIdentifier;
  }

  defaults() {
    return {
      serviceName: null
    };
  }

  routes() {
    return {
      fetch: `${process.env.VUE_APP_BASE_URL}/elucidate/connectionIdentifier/{serviceName}/unused`
    };
  }

  getModelsFromResponse(response) {
    /*
     * Because the service returns:
     *  {
     *    serviceName: foo-service,
     *    identifiers: [...]
     *  }
     * We need to pluck out just the 'identifiers' property.
     */
    return response.getData().identifiers;
  }
}
