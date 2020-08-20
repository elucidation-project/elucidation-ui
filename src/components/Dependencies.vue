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

export default {
  name: 'Dependencies',
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
      rows: []
    };
  },
  mounted() {
    const header = this.$refs.dependenciesTable.$el.getElementsByClassName('vgt-fixed-header')[0],
      tHead = header && header.getElementsByTagName('thead')[0],
      tr = tHead && tHead.getElementsByTagName('tr')[0],
      spacer = tr && document.createElement('tr');

    if (spacer) {
      spacer.classList.add('elucidation-header-spacer');
      tr.appendChild(spacer);
    }
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
        promise = fetch(`${process.env.VUE_APP_BASE_URL}/elucidate/service/${parentService}/relationship/${childService}`)
          .then((response) => {
            const json = response.json();
            return response.ok ? json : Promise.reject(new Error('Error loading Dependencies'));
          })
          .catch((error) => { this.$emit('load-dependencies-error', error); });
      }
      return promise;
    },

    setServices(child, parent) {
      const mask = this.$loading({ target: this.$el });
      return this.loadDependencies(child, parent)
        .then((data) => this.setDependencies(data || []))
        .finally(() => mask.close());
    },

    setDependencies(events) {
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
