<template>
  <el-container class="custom-height">
    <el-main>
      <vue-good-table
        ref="dependenciesTable"
        class="elucidation-vue-good-table"
        :fixed-header="true"
        style="height:180px"
        max-height="180px"
        :columns="columns"
        :rows="rows"
        :group-options="{
          enabled: true,
          collapsable: true
        }">
        <div class="empty-slot" slot="emptystate">There are no Dependencies for the selected service</div>
      </vue-good-table>
    </el-main>
  </el-container>
</template>

<script>

import moment from 'moment';
import VueGoodTableSpacer from '@/mixins/VueGoodTableSpacer';
import ServiceDependency from '../models/ServiceDependency';
import ServiceDependencies from '../collections/ServiceDependencies';

export default {
  name: 'DependenciesView',
  mixins: [VueGoodTableSpacer],
  data() {
    return {
      columns: [{
        label: 'Connection Identifier',
        field: 'connectionIdentifier',
        width: '40%'
      }, {
        label: 'Communication Type',
        field: 'communicationType',
        width: '20%'
      }, {
        label: 'Last Observed On',
        field: 'lastObserved',
        width: '40%',
        formatFn: this.dateFormatFn
      }],
      rows: [],
      dependencies: new ServiceDependencies()
    };
  },

  methods: {
    clearDependencies() {
      // To clear the dependencies, simply call 'setServices' with no arguments. This keeps our interface consistent as (a) a Promise
      // is returned from the call, and (b) all relevant calls in the chain are called as if a parent & child have been provided.
      return this.setServices();
    },

    getDependencies() {
      return this.rows;
    },

    loadDependencies(childService, parentService) {
      let promise = Promise.resolve([]);
      if (parentService && childService) {
        this.dependencies.set({ parentService, childService });
        promise = this.dependencies.fetch()
          .then() // nothing...
          .catch((error) => { this.$emit('load-dependencies-error', error); });
      } else {
        this.dependencies.clear();
      }
      return promise;
    },

    setServices(child, parent) {
      const mask = this.$loading({ target: this.$el });
      return this.loadDependencies(child, parent)
        .then((data) => this.setDependencies(data || []))
        .finally(() => mask.close());
    },

    setDependencies() {
      const rows = [];
      this.dependencies.each((event) => {
        let row = rows.find((r) => r.label === event.eventDirection);
        if (!row) {
          row = {
            label: event.eventDirection,
            mode: 'span',
            html: false,
            children: []
          };
          rows.push(row);
        }
        row.children.push(event.attributes);
      });
      this.rows = rows;
    },

    dateFormatFn(value) {
      return moment(value).format('MMM Do YYYY HH:mm');
    }
  }
};
</script>
