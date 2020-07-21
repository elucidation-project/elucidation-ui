<template>
  <g>
  </g>
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
