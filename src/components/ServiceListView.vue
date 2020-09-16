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
        :data="rows" height="100%" style="width: 100%">

        <el-table-column prop="serviceName" :formatter="(row, col, val) => _.startCase(val)">
        </el-table-column>
      </el-table>
    </el-main>
  </el-container>
</template>

<script>

import Service from '../models/Service';
import Services from '../collections/Services';

export default {
  name: 'ServiceListView',
  data() {
    return {
      rows: [],
      services: new Services()
    };
  },
  mounted() {
    this.loadServices();
  },
  methods: {
    onCurrentChange(selection) {
      selection ? this.$emit('service-selected', selection.serviceName) : this.$emit('service-selection-cleared');
    },
    onRefreshList() {
      this.refreshList();
    },
    loadServices() {
      return this.services.fetch()
        .then(this._refreshView.bind(this))
        .catch((error) => { this.$emit('load-services-error', error); });
    },
    refreshList() {
      const mask = this.$loading({ target: this.$el });
      return this.loadServices().finally(() => mask.close());
    },
    _refreshView() {
      this.rows.length = 0;
      this.services.each((service) => this.rows.push(service.attributes));
    }
  }
};
</script>
