<template>
  <el-table
    highlight-current-row
    :show-header=false
    @current-change="onCurrentChange"
    :data="services" height="100%" style="width: 100%">

    <el-table-column prop="name" :formatter="(row, col, val) => _.startCase(val)">
    </el-table-column>
  </el-table>
</template>

<script>

export default {
  name: 'ServiceList',
  data() {
    return { services: [] };
  },
  created() {
    fetch(`${process.env.VUE_APP_BASE_URL}/elucidate/services`)
      .then((response) => response.json())
      .then((data) => this.setServices(data));
  },
  methods: {
    onCurrentChange(selection) {
      this.$emit('service-selected', selection.name);
    },
    setServices(services) {
      this.services = [];
      services.forEach((service) => this.services.push({ name: service }));
    }
  }
};
</script>
