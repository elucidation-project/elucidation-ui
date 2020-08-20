<template>
  <el-container class="custom-height">
    <el-main>
      <vue-good-table
        ref="trackedIdentifiersTable"
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

export default {
  name: 'TrackedIdentifiers',
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
        field: 'observedAt',
        width: '40%',
        formatFn: this.dateFormatFn
      }],
      rows: []
    };
  },

  methods: {
    getConnectionEvents() {
      return this.rows;
    },
    loadConnectionEvents(service) {
      return fetch(`${process.env.VUE_APP_BASE_URL}/elucidate/service/${service}/events`)
        .then((response) => {
          const json = response.json();
          return response.ok ? json : Promise.reject(new Error('Error loading Tracked Identifiers'));
        })
        .catch((error) => { this.$emit('load-events-error', error); });
    },
    setService(service) {
      const mask = this.$loading({ target: this.$el });
      return this.loadConnectionEvents(service)
        .then((data) => this.setConnectionEvents(data || []))
        .finally(() => mask.close());
    },
    setConnectionEvents(events) {
      const rows = [];
      events.forEach((event) => {
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
        row.children.push(event);
      });
      this.rows = rows;
    },
    dateFormatFn(value) {
      return moment(value).format('MMM Do YYYY HH:mm');
    }
  }
};
</script>
