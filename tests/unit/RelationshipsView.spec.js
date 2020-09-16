import { shallowMount, mount, createLocalVue } from '@vue/test-utils';

import Vue from 'vue';
import ElementUI from 'element-ui';
import RelationshipsView from '@/components/RelationshipsView.vue';
import VueLodash from 'vue-lodash';
import lodash from 'lodash';

const localVue = createLocalVue();
localVue.use(ElementUI);
localVue.use(VueLodash, { lodash });

describe('RelationshipsView.vue', () => {
  beforeAll(() => {
    fetch.resetMocks();
  });

  describe('successful tests', () => {
    beforeEach(() => {
      fetch.mockResponse(JSON.stringify({
        serviceName: 'canary-service',
        children: [{
          serviceName: 'appliance-service',
          hasInbound: false,
          hasOutbound: true
        }, {
          serviceName: 'light-service',
          hasInbound: true,
          hasOutbound: false
        }, {
          serviceName: 'doorbell-service',
          hasInbound: true,
          hasOutbound: true
        }]
      }));
    });

    // Assigning 'done' tells the test to wait for us to call 'done()'
    it('loads relationships', (done) => {
      const wrapper = mount(RelationshipsView, { localVue });
      wrapper.vm.setService('canary-service');
      process.nextTick(() => {
        const relationships = wrapper.vm.getRelationships();
        expect(relationships.serviceName).toEqual('canary-service');
        expect(relationships.children.length).toEqual(3);
        done();
      });
    });

    it('generates SVG', (done) => {
      const wrapper = mount(RelationshipsView, { localVue });
      wrapper.vm.$on('rendered', (me, canvas) => {
        // TODO: Figure out how to check the contents of the SVG 'canvas' (which is a 'g'). For some reason, jest isn't fully rendering
        // the SVG elements, so 'canvas.selectAll("g.link").size()' returns 0. I've put breakpoints in the code within a browser session
        // and verified that the point at which the 'rendered' event is emitted the links exist. But...nothing within the test code. I've
        // event wrapped this section in a 'process.nextTick()' to see if giving it another cycle would be enough, but no dice. The JSON
        // matches that of a an actual response from the server.
        done();
      });
      wrapper.vm.setService('canary-service');
    });
  });

  // Assigning 'done' tells the test to wait for us to call 'done()'
  it('handles error', (done) => {
    fetch.mockReject(new Error('Bad gateway'));

    const wrapper = mount(RelationshipsView, { localVue });
    wrapper.vm.setService('canary-service');
    process.nextTick(() => {
      expect(wrapper.emitted()['load-relationships-error']).toBeTruthy();
      done();
    });
  });
});
