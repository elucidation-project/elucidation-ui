<template>
  <div id="app" class="elucidation">
    <el-container>
      <el-aside class="elucidation-left">
        <service-list
          @service-selected="onServiceSelected"
          @service-selection-cleared="onSelectionCleared"
          @load-services-error="onLoadServicesError">
        </service-list>
      </el-aside>
      <el-container class="elucidation-center">
        <el-main>
          <relationships
            ref="relationships"
            @service-selected="onLoadRelationships">
          </relationships>
        </el-main>
        <el-footer height="400">
          <el-collapse class="identifier-details" height="400px">
            <el-collapse-item>
              <template slot="title">{{dependenciesTitle}}</template>
              <dependencies ref="dependencies"></dependencies>
            </el-collapse-item>
            <el-collapse-item>
              <template slot="title">{{unusedIdentifiersTitle}}</template>
              <unused-identifiers ref="unusedIdentifiers"></unused-identifiers>
            </el-collapse-item>
          </el-collapse>
        </el-footer>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import Vue from 'vue';
import VueLodash from 'vue-lodash';
import _ from 'lodash';
import { MessageBox } from 'element-ui';
import Dependencies from './components/Dependencies.vue';
import Relationships from './components/Relationships.vue';
import ServiceList from './components/ServiceList.vue';
import UnusedIdentifiers from './components/UnusedIdentifiers.vue';

export default {
  name: 'app',
  components: {
    Dependencies,
    Relationships,
    ServiceList,
    UnusedIdentifiers
  },
  data() {
    return {
      dependenciesTitle: 'Dependencies',
      unusedIdentifiersTitle: 'Unused Identifiers'
    };
  },
  methods: {
    onLoadServicesError(error) {
      this.$alert(error.message, 'Error', { type: 'error', confirmButtonText: 'Ok' });
      this.dependenciesTitle = 'Dependencies';
      this.unusedIdentifiersTitle = 'Unused Identifiers';
    },
    onLoadRelationships(child, parent) {
      this.$refs.dependencies.setServices(child, parent);
      this.$refs.unusedIdentifiers.setService(child);
      this.dependenciesTitle = parent ? `Dependencies between ${_.startCase(parent)} and ${_.startCase(child)}` : 'Dependencies';
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
      this.$refs.unusedIdentifiers.setService(selection);
      this.unusedIdentifiersTitle = `Unused Identifiers for ${_.startCase(selection)}`;
    }
  }
};
</script>
