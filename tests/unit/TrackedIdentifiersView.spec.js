import { shallowMount, mount, createLocalVue } from '@vue/test-utils';

import Vue from 'vue';
import ElementUI from 'element-ui';
import TrackedIdentifiersView from '@/components/TrackedIdentifiersView.vue';
import VueLodash from 'vue-lodash';
import VueGoodTablePlugin from 'vue-good-table';
import lodash from 'lodash';

const localVue = createLocalVue();
localVue.use(ElementUI);
localVue.use(VueLodash, { lodash });
localVue.use(VueGoodTablePlugin);

describe('TrackedIdentifiersView.vue', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  // Assigning 'done' tells the test to wait for us to call 'done()'
  it('handles no tracked identifiers', (done) => {
    fetch.mockResponseOnce(JSON.stringify([]));

    const wrapper = mount(TrackedIdentifiersView, { localVue });
    wrapper.vm.setService('foo-service');
    process.nextTick(() => {
      expect(wrapper.text()).toMatch(/There are no Dependencies for the selected service/);
      expect(wrapper.vm.getConnectionEvents()).toEqual([]);
      done();
    });
  });

  // Assigning 'done' tells the test to wait for us to call 'done()'
  it('loads tracked identifiers', (done) => {
    fetch.mockResponseOnce(JSON.stringify([{
      serviceName: 'foo-service',
      communicationType: 'HTTP',
      connectionIdentifier: 'POST /foo',
      eventDirection: 'INBOUND'
    }, {
      serviceName: 'bar-service',
      communicationType: 'HTTP',
      connectionIdentifier: 'GET /bar/id',
      eventDirection: 'OUTBOUND'
    }]));

    const wrapper = mount(TrackedIdentifiersView, { localVue });
    wrapper.vm.setService('foo-service');
    process.nextTick(() => {
      expect(wrapper.vm.getConnectionEvents().length).toEqual(2);
      expect(wrapper.text()).toMatch(/INBOUND/);
      expect(wrapper.text()).toMatch(/OUTBOUND/);
      done();
    });
  });

  // Assigning 'done' tells the test to wait for us to call 'done()'
  it('handles error', (done) => {
    fetch.mockReject(new Error('Bad gateway'));

    const wrapper = mount(TrackedIdentifiersView, { localVue });
    wrapper.vm.setService('foo-service');
    process.nextTick(() => {
      expect(wrapper.emitted()['load-events-error']).toBeTruthy();
      expect(wrapper.text()).toMatch(/There are no Dependencies for the selected service/);
      done();
    });
  });
});
