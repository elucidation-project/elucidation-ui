<template>
  <div id="app">
    <el-container class="elucidation-app">
      <el-aside>
      <service-list></service-list>
      </el-aside>
      <el-container>
        <el-main>
          <relationships></relationships>
        </el-main>
        <el-footer height="310">
              <tracked-identifiers></tracked-identifiers>
              <unused-identifiers></unused-identifiers>
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

.el-container:not(.default-height) {
  height: 100%;
}

</style>
