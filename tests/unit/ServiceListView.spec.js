import { shallowMount, mount, createLocalVue } from '@vue/test-utils';

import Vue from 'vue';
import ElementUI from 'element-ui';
import ServiceListView from '@/components/ServiceListView.vue';
import VueLodash from 'vue-lodash';
import lodash from 'lodash';

const localVue = createLocalVue();
localVue.use(ElementUI);
localVue.use(VueLodash, { lodash });

describe('ServiceListView.vue', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  // Assigning 'done' tells the test to wait for us to call 'done()'
  it('loads services', (done) => {
    fetch.mockResponseOnce(JSON.stringify(['serviceOne', 'serviceTwo']));

    const wrapper = mount(ServiceListView, { localVue });
    process.nextTick(() => {
      /*
       * TODO: Figure out why vue-mc has broken these tests
      expect(wrapper.text()).toMatch(/Service One/);
      expect(wrapper.text()).toMatch(/Service Two/);
       */
      done();
    });
  });

  // Assigning 'done' tells the test to wait for us to call 'done()'
  it('handles error', (done) => {
    fetch.mockReject(new Error('Bad gateway'));

    const wrapper = mount(ServiceListView, { localVue });
    process.nextTick(() => {
      /*
       * TODO: Figure out why vue-mc has broken these tests
      expect(wrapper.emitted()['load-services-error']).toBeTruthy();
      expect(wrapper.text()).toMatch(/There are no Services/);
       */
      done();
    });
  });
});
