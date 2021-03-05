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
        <template slot="table-row" slot-scope="props">
          <span style="text-align:center" v-if="props.column.field == 'actions'">
            <el-tooltip effect="dark" content="View Connection Events">
              <el-button
                 size="mini"
                 icon="el-icon-connection"
                 type="primary"
                 @click="onViewConnectionEvents(props)" circle/>
            </el-tooltip>
          </span>
          <span v-else>
            {{props.formattedRow[props.column.field]}}
          </span>
        </template>
      </vue-good-table>
    </el-main>
    <el-dialog ref="connectionEventsDialog" :visible.sync="showConnectionEventsDialog" :modal="false" class="elucidation-dialog">
      <span class="el-dialog__title" slot="title">
        {{ connectionEventsDialogTitle }}
      </span>
      <el-table :data="connectionEventRows" style="width:100%" empty-text="No Connection Events" max-height=300>
        <el-table-column property="serviceName" label="Service"></el-table-column>
        <el-table-column property="eventDirection" label="Event Direction"></el-table-column>
        <el-table-column property="observedAt" label="Last Observed On" :formatter="dialogDateFormatFn"></el-table-column>
      </el-table>
    </el-dialog>
  </el-container>
</template>

<script>

import moment from 'moment';
import VueGoodTableSpacer from '@/mixins/VueGoodTableSpacer';
import ConnectionEvent from '../models/ConnectionEvent';
import ConnectionEvents from '../collections/ConnectionEvents';
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
      }, {
        label: 'Actions',
        field: 'actions',
        tdClass: 'actions-column'
      }],
      rows: [],
      dependencies: new ServiceDependencies(),
      showConnectionEventsDialog: false,
      connectionEventsDialogTitle: null,
      connectionEventRows: []
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

    onViewConnectionEvents(evt) {
      const connectionEvents = new ConnectionEvents();

      connectionEvents.set('connectionIdentifier', window.encodeURIComponent(evt.row.connectionIdentifier));
      this.connectionEventsDialogTitle = `Connection Events for ${evt.row.connectionIdentifier}`;
      this.showConnectionEventsDialog = true;
      connectionEvents.fetch()
        .then(() => {
          this.connectionEventRows = connectionEvents.models;
        })
        .catch((error) => { this.$emit('load-connection-events-error', error); });
    },

    setServices(child, parent) {
      const mask = this.$loading({ target: this.$el });
      this.childService = child;
      this.parentService = parent;
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
    },

    dialogDateFormatFn(row, col, value) {
      return this.dateFormatFn(value);
    }
  }
};
</script>
