<template>
  <el-container class="custom-height">
    <el-main>
      <vue-good-table
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
      </vue-good-table>
    </el-main>
  </el-container>
</template>

<script>
export default {
  name: 'TrackedIdentifiers',
  data() {
    return {
      columns: [{
        label: 'Connection Identifier',
        field: 'connectionIdentifier'
      }, {
        label: 'Communication Type',
        field: 'communicationType'
      }, {
        label: 'Last Observed On',
        field: 'observedAt'
      }],
      rows: []
    };
  },
  methods: {
    setService(service) {
      const mask = this.$loading({ target: this.$el });
      return fetch(`${process.env.VUE_APP_BASE_URL}/elucidate/service/${service}/events`)
        .then((response) => response.json())
        .then((data) => this.setConnectionEvents(data))
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
    }
  }
};
</script>
