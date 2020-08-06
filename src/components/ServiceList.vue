<template>
  <el-container>
    <el-header class="elucidation-header">
      <div class="elucidation-header-body">
        <span class="elucidation-header-title">Services</span>
        <el-button icon="el-icon-refresh" @click="onRefreshList" circle></el-button>
      </div>
    </el-header>
    <el-main>
      <el-table
        highlight-current-row
        empty-text="There are no Services"
        :show-header=false
        @current-change="onCurrentChange"
        :data="services" height="100%" style="width: 100%">

        <el-table-column prop="name" :formatter="(row, col, val) => _.startCase(val)">
        </el-table-column>
      </el-table>
    </el-main>
  </el-container>
</template>

<script>

export default {
  name: 'ServiceList',
  data() {
    return { services: [] };
  },
  mounted() {
    this.loadServices();
  },
  methods: {
    onCurrentChange(selection) {
      this.$emit('service-selected', selection.name);
    },
    onRefreshList() {
      this.refreshList();
    },
    loadServices() {
      return fetch(`${process.env.VUE_APP_BASE_URL}/elucidate/services`)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Error loading services');
          }
          return response.json();
        })
        .then((data) => this.setServices(data))
        .catch((error) => {
          this.$emit('load-services-error', error);
          this.setServices([]);
        });
    },
    refreshList() {
      const mask = this.$loading({ target: this.$el });
      return this.loadServices()
        .finally(() => mask.close());
    },
    setServices(services) {
      services.sort();
      this.services.length = 0;
      services.forEach((service) => this.services.push({ name: service }));
    }
  }
};
</script>
