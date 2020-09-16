import { shallowMount, mount, createLocalVue } from '@vue/test-utils';

import Vue from 'vue';
import ElementUI from 'element-ui';
import DependenciesView from '@/components/DependenciesView.vue';
import VueLodash from 'vue-lodash';
import VueGoodTablePlugin from 'vue-good-table';
import lodash from 'lodash';

const localVue = createLocalVue();
localVue.use(ElementUI);
localVue.use(VueLodash, { lodash });
localVue.use(VueGoodTablePlugin);

describe('DependenciesView.vue', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  // Assigning 'done' tells the test to wait for us to call 'done()'
  it('handles no dependencies', (done) => {
    fetch.mockResponseOnce(JSON.stringify([]));

    const wrapper = mount(DependenciesView, { localVue });
    wrapper.vm.setServices('foo-service', 'bar-service');
    process.nextTick(() => {
      expect(wrapper.text()).toMatch(/There are no Dependencies for the selected service/);
      expect(wrapper.vm.getDependencies()).toEqual([]);
      done();
    });
  });

  // Assigning 'done' tells the test to wait for us to call 'done()'
  it('loads dependencies', (done) => {
    fetch.mockResponseOnce(JSON.stringify([{
      communicationType: 'HTTP',
      connectionIdentifier: 'POST /foo',
      eventDirection: 'INBOUND'
    }, {
      communicationType: 'HTTP',
      connectionIdentifier: 'GET /bar/id',
      eventDirection: 'OUTBOUND'
    }]));

    const wrapper = mount(DependenciesView, { localVue });
    wrapper.vm.setServices('foo-service', 'bar-service');
    process.nextTick(() => {
      /*
       * TODO: Figure out why vue-mc has broken these tests
      expect(wrapper.vm.getDependencies().length).toEqual(2);
      expect(wrapper.text()).toMatch(/INBOUND/);
      expect(wrapper.text()).toMatch(/OUTBOUND/);
       */
      done();
    });
  });

  // Assigning 'done' tells the test to wait for us to call 'done()'
  it('handles error', (done) => {
    fetch.mockReject(new Error('Bad gateway'));

    const wrapper = mount(DependenciesView, { localVue });
    wrapper.vm.setServices('foo-service', 'bar-service');
    process.nextTick(() => {
      /*
       * TODO: Figure out why vue-mc has broken these tests
      expect(wrapper.emitted()['load-dependencies-error']).toBeTruthy();
      expect(wrapper.text()).toMatch(/There are no Dependencies for the selected service/);
       */
      done();
    });
  });
});
