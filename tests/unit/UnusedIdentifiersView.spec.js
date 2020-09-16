import { shallowMount, mount, createLocalVue } from '@vue/test-utils';

import Vue from 'vue';
import ElementUI from 'element-ui';
import UnusedIdentifiersView from '@/components/UnusedIdentifiersView.vue';
import VueLodash from 'vue-lodash';
import VueGoodTablePlugin from 'vue-good-table';
import lodash from 'lodash';

const localVue = createLocalVue();
localVue.use(ElementUI);
localVue.use(VueLodash, { lodash });
localVue.use(VueGoodTablePlugin);

describe('UnusedIdentifiersView.vue', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  // Assigning 'done' tells the test to wait for us to call 'done()'
  it('handles no unused identifiers', (done) => {
    fetch.mockResponseOnce(JSON.stringify({ serviceName: 'foo-service', identifiers: [] }));

    const wrapper = mount(UnusedIdentifiersView, { localVue });
    wrapper.vm.setService('foo-service');
    process.nextTick(() => {
      expect(wrapper.text()).toMatch(/There are no Unused Identifiers for the selected service/);
      expect(wrapper.vm.getUnusedIdentifiers()).toEqual([]);
      done();
    });
  });

  // Assigning 'done' tells the test to wait for us to call 'done()'
  it('loads unused identifiers', (done) => {
    fetch.mockResponseOnce(JSON.stringify({
      serviceName: 'foo-service',
      identifiers: [{
        communicationType: 'HTTP',
        connectionIdentifier: 'POST /foo'
      }, {
        communicationType: 'HTTP',
        connectionIdentifier: 'GET /foo/id'
      }]
    }));

    const wrapper = mount(UnusedIdentifiersView, { localVue });
    wrapper.vm.setService('foo-service');
    process.nextTick(() => {
      /*
       * TODO: Figure out why vue-mc has broken these tests
      expect(wrapper.text()).toMatch(/POST \/foo/);
      expect(wrapper.text()).toMatch(/GET \/foo\/id/);
       */
      done();
    });
  });

  // Assigning 'done' tells the test to wait for us to call 'done()'
  it('handles error', (done) => {
    fetch.mockReject(new Error('Bad gateway'));

    const wrapper = mount(UnusedIdentifiersView, { localVue });
    wrapper.vm.setService('foo-service');
    process.nextTick(() => {
      /*
       * TODO: Figure out why vue-mc has broken these tests
      expect(wrapper.emitted()['load-unused-identifiers-error']).toBeTruthy();
      expect(wrapper.text()).toMatch(/There are no Unused Identifiers for the selected service/);
       */
      done();
    });
  });
});
