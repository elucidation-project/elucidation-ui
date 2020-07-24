<template>
  <div id="app" class="elucidation">
    <el-container>
      <el-aside class="elucidation-left">
        <service-list v-on:service-selected="onServiceSelected"></service-list>
      </el-aside>
      <el-container class="elucidation-center">
        <el-main>
          <relationships></relationships>
        </el-main>
        <el-footer height="400">
          <el-collapse class="identifier-details" height="400px">
            <el-collapse-item title="Dependencies">
              <tracked-identifiers ref="trackedIdentifiers"></tracked-identifiers>
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
      this.$refs.trackedIdentifiers.setService(selection);
    }
  }
};
</script>
