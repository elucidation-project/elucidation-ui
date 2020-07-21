<template>
  <el-container style="height:150px">
    <el-main>
      <el-table :data="identifiers" height="100%" style="width: 100%">
        <el-table-column prop="connectionIdentifier" label="Identifier"></el-table-column>
      </el-table>
    </el-main>
  </el-container>
</template>

<script>
export default {
  name: 'UnusedIdentifiers',
  data() {
    return { identifiers: [{ connectionIdentifier: 'Select a Service to see Unused Identifiers' }] };
  },
  methods: {
    setUnusedIdentifiers(identifiers) {
      this.identifiers = identifiers;
    }
  }
};
</script>
