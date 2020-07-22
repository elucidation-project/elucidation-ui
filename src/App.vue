<template>
  <div id="app">
    <el-container class="elucidation-app">
      <el-aside class="elucidation-app-left">
        <el-container>
          <el-header class="elucidation-app-header">
            <span>Services</span>
          </el-header>
          <el-main>
            <service-list v-on:service-selected="onServiceSelected">
            </service-list>
          </el-main>
        </el-container>
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

<style>
body, html {
  height: 100%;
  margin: 0;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
  background-color: #777;

}

.elucidation-app .el-main,
.elucidation-app .el-footer,
.elucidation-app .el-header {
    padding: 0;
}

.el-container {
  padding: 5px;
}

.el-container.elucidation-app-center {
  padding: 0 0 2px 5px;
}

.el-container:not(.custom-height) {
  height: 100%;
}

.elucidation-app .identifier-details {
  border: 0;
}

.elucidation-app .elucidation-app-header,
.elucidation-app .identifier-details .el-collapse-item__header {
  background-color: #4682B4; /* steel blue */
  color: #fff;
  font-weight: bold;
  font-size: 1em;
  height: 30px !important;
  padding: 2px 10px;
  text-align: left;
  vertical-align: middle;
}

.elucidation-app-center .elucidation-app-relationships,
.elucidation-app-left .el-container {
  padding: 0;
}

</style>
