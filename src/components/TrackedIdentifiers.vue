<template>
  <el-container class="custom-height" style="height:150px">
    <el-main>
      <el-table :data="identifiers" height="100%" style="width: 100%">
        <el-table-column prop="connectionIdentifier" label="Identifier"></el-table-column>
        <el-table-column prop="connectionType" label="Protocol"></el-table-column>
      </el-table>
    </el-main>
  </el-container>
</template>

<script>
export default {
  name: 'TrackedIdentifiers',
  data() {
    return { identifiers: [{ connectionIdentifier: 'Select a Service to see Dependencies' }] };
  },
  methods: {
    setTrackedIdentifiers(identifiers) {
      this.identifiers = identifiers;
    }
  }
};
</script>
