<template>
  <div id="app">
    <el-container class="elucidation-app">
      <el-aside class="elucidation-app-left">
        <service-list v-on:service-selected="onServiceSelected"></service-list>
      </el-aside>
      <el-container class="elucidation-app-center">
        <el-main>
          <relationships></relationships>
        </el-main>
        <el-footer height="400">
          <el-collapse class="identifier-details" height="400px">
            <el-collapse-item title="Dependencies">
              <tracked-identifiers></tracked-identifiers>
            </el-collapse-item>
            <el-collapse-item title="Unused Identifiers">
              <unused-identifiers></unused-identifiers>
            </el-collapse-item>
          </el-collapse>
        </el-footer>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import Relationships from './components/Relationships.vue';
import ServiceList from './components/ServiceList.vue';
import TrackedIdentifiers from './components/TrackedIdentifiers.vue';
import UnusedIdentifiers from './components/UnusedIdentifiers.vue';

export default {
  name: 'app',
  components: {
    Relationships,
    ServiceList,
    TrackedIdentifiers,
    UnusedIdentifiers
  },
  methods: {
    onServiceSelected(selection) {
      console.log(`selection: ${selection}`);
    }
  }
};
</script>
