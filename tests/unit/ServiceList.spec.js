import { shallowMount, mount, createLocalVue } from '@vue/test-utils';

import Vue from 'vue';
import ElementUI from 'element-ui';
import ServiceList from '@/components/ServiceList.vue';
import VueLodash from 'vue-lodash';
import lodash from 'lodash';

const localVue = createLocalVue();
localVue.use(ElementUI);
localVue.use(VueLodash, { lodash });

describe('ServiceList.vue', () => {
  beforeEach(() => {
    fetch.resetMocks()
  });

  // Assigning 'done' tells the test to wait for us to call 'done()'
  it('loads services', done => {
    fetch.mockResponseOnce(JSON.stringify(['serviceOne', 'serviceTwo']));

    const wrapper = mount(ServiceList, { localVue });
    process.nextTick(() => {

      expect(wrapper.text()).toMatch(/Service One/);
      expect(wrapper.text()).toMatch(/Service Two/);
      done();
    });
  });
});
