<template>
  <div id="app" class="elucidation">
    <el-container>
      <el-main class="elucidation-center">
        <el-tabs type="border-card" class="elucidation-center-tabs">
          <el-tab-pane label="System Dependencies" class="elucidation-system-dependencies" :lazy="true">
            <el-container>
              <el-main>
                <system-dependencies-view
                  ref="systemDependencies"
                  @service-selected="onLoadRelationships">
                </system-dependencies-view>
              </el-main>
            </el-container>
          </el-tab-pane>
          <el-tab-pane label="Relationships" class="elucidation-relationships">
            <el-container>
              <el-aside class="elucidation-left">
                <service-list-view
                  @service-selected="onServiceSelected"
                  @service-selection-cleared="onSelectionCleared"
                  @load-services-error="onLoadServicesError">
                </service-list-view>
              </el-aside>
              <el-main>
                <relationships-view
                  ref="relationships"
                  @service-selected="onLoadRelationships">
                </relationships-view>
              </el-main>
            </el-container>
          </el-tab-pane>
        </el-tabs>
      </el-main>
      <el-footer height="400">
        <el-collapse ref="collapseContainer" class="identifier-details" height="400px">
          <el-collapse-item>
            <template slot="title">{{dependenciesTitle}}</template>
            <dependencies-view ref="dependencies"></dependencies-view>
          </el-collapse-item>
          <el-collapse-item>
            <template slot="title">{{unusedIdentifiersTitle}}</template>
            <unused-identifiers-view ref="unusedIdentifiers"></unused-identifiers-view>
          </el-collapse-item>
        </el-collapse>
      </el-footer>
    </el-container>
  </div>
</template>

<script>
import Vue from 'vue';
import VueLodash from 'vue-lodash';
import _ from 'lodash';
import { MessageBox } from 'element-ui';
import DependenciesView from './components/DependenciesView.vue';
import RelationshipsView from './components/RelationshipsView.vue';
import ServiceListView from './components/ServiceListView.vue';
import SystemDependenciesView from './components/SystemDependenciesView.vue';
import UnusedIdentifiersView from './components/UnusedIdentifiersView.vue';

export default {
  name: 'app',
  components: {
    DependenciesView,
    RelationshipsView,
    ServiceListView,
    SystemDependenciesView,
    UnusedIdentifiersView
  },
  data() {
    return {
      dependenciesTitle: 'Dependencies',
      unusedIdentifiersTitle: 'Unused Identifiers'
    };
  },
  mounted() {
    // Ok, a bit of a hack. Here's what is going on:
    // The 'expand/collapse' callback for el-collapse is made BEFORE the actual expanding/collapsing. Element-UI does this through
    // 'transitions', and as best as I can tell, there doesn't seem to be an easy way to hook into the 'after' callback of a transition
    // (short of writing my own classes, which is waaayyy more complicated than it should be).
    // For now, the best way is to put a ResizeObserver on the el-collapse component and refresh the SystemDependencies view whenever the
    // el-collapse resizes.
    const observer = new ResizeObserver(() => {
      // This method may get called multiple times during a single expand/collapse, to set a short timeout so we reduce the number of calls
      // down to (possibly) 1.
      window.clearTimeout(this.resizeTimeout);
      this.resizeTimeout = window.setTimeout(() => this.$refs.systemDependencies && this.$refs.systemDependencies.refresh(), 50);
    });
    observer.observe(this.$refs.collapseContainer.$el);
  },
  methods: {
    onLoadServicesError(error) {
      this.$alert(error.message, 'Error', { type: 'error', confirmButtonText: 'Ok' });
      this.dependenciesTitle = 'Dependencies';
      this.unusedIdentifiersTitle = 'Unused Identifiers';
    },
    onLoadRelationships(child, parent) {
      this.$refs.dependencies.setServices(child, parent);
      this.dependenciesTitle = parent ? `Dependencies between ${_.startCase(parent)} and ${_.startCase(child)}` : 'Dependencies';
      this.$refs.unusedIdentifiers.setService(child);
      this.unusedIdentifiersTitle = `Unused Identifiers for ${_.startCase(child)}`;
    },
    onSelectionCleared() {
      this.$refs.relationships.setService();
      this.$refs.dependencies.setServices();
      this.$refs.unusedIdentifiers.setService();
    },
    onServiceSelected(selection) {
      this.$refs.relationships.setService(selection);
      this.$refs.dependencies.setServices();
    }
  }
};
</script>
