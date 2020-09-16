import { Model, ResponseError } from 'vue-mc';
import isEmpty from 'lodash/isEmpty';

export default class UnusedIdentifier extends Model {
  defaults() {
    return {
      connectionIdentifier: null,
      communicationType: null
    };
  }

  mutations() {
    return {
      connectionIdentifier: String,
      communicationType: String
    };
  }
}
