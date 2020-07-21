<template>
  <el-table :data="services" height="100%" style="width: 100%">
    <el-table-column prop="name" label="Service"></el-table-column>
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
    setServices(services) {
      this.services = [];
      for (let i = 0; i < services.length; i += 1) {
        this.services.push({ name: services[i] });
      }
    }
  }
};
</script>
