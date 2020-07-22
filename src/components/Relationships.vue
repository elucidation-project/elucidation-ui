<template>
  <el-container class="elucidation-app-relationships">
    <el-header class="elucidation-app-header">
      <span>Relationships</span>
    </el-header>
    <el-main>
      <g>
      </g>
    </el-main>
  </el-container>
</template>
<script>

export default {
  name: 'Relationships',
  data() {
    return { relationships: [] };
  },
  methods: {
    setRelationships(relationships) {
      this.relationships = relationships;
    }
  }
};
</script>
