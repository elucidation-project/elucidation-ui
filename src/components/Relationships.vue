<template>
  <el-container class="elucidation-relationships">
    <el-header class="elucidation-header">
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
