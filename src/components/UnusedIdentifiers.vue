<template>
  <el-container class="custom-height" >
    <el-main>
      <vue-good-table
        ref="unusedIdentifierTable"
        class="elucidation-vue-good-table"
        :fixed-header="true"
        style="height:180px"
        max-height="180px"
        :columns="columns"
        :rows="rows"
      >
        <div class="empty-slot" slot="emptystate">There are no Unused Identifiers for the selected service</div>
      </vue-good-table>
    </el-main>
  </el-container>
</template>

<script>

import VueGoodTableSpacer from '@/mixins/VueGoodTableSpacer';

export default {
  name: 'UnusedIdentifiers',
  mixins: [VueGoodTableSpacer],
  data() {
    return {
      columns: [{
        label: 'Connection Identifier',
        field: 'connectionIdentifier',
        width: '50%'
      }, {
        label: 'Communication Type',
        field: 'communicationType',
        width: '50%'
      }],
      rows: [],
      staticIdentifiers: []
    };
  },

  methods: {
    getUnusedIdentifiers() {
      return this.rows;
    },
    loadUnusedIdentifiers(service) {
      return fetch(`${process.env.VUE_APP_BASE_URL}/elucidate/connectionIdentifier/${service}/unused`)
        .then((response) => {
          const json = response.json();
          return response.ok ? json : Promise.reject(new Error('Error loading Unused Identifiers'));
        })
        .catch((error) => { this.$emit('load-unused-identifiers-error', error); });
    },
    setService(service) {
      const mask = this.$loading({ target: this.$el });
      return this.loadUnusedIdentifiers(service)
        .then((data) => {
          const identifiers = data && data.identifiers ? data.identifiers : [];
          this.setUnusedIdentifiers(identifiers);
        })
        .finally(() => mask.close());
    },
    setUnusedIdentifiers(identifiers) {
      this.rows = identifiers;
    }
  }
};
</script>
