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
import UnusedIdentifier from '../models/UnusedIdentifier';
import UnusedIdentifiers from '../collections/UnusedIdentifiers';

export default {
  name: 'UnusedIdentifiersView',
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
      staticIdentifiers: [],
      unusedIdentifiers: new UnusedIdentifiers()
    };
  },

  methods: {
    getUnusedIdentifiers() {
      return this.rows;
    },
    loadUnusedIdentifiers(service) {
      this.unusedIdentifiers.clear();
      this.unusedIdentifiers.set('serviceName', service);
      return this.unusedIdentifiers.fetch()
        .then() // nothing...
        .catch((error) => { this.$emit('load-unused-identifiers-error', error); });
    },
    setService(service) {
      const mask = this.$loading({ target: this.$el });
      return this.loadUnusedIdentifiers(service)
        .then(() => {
          // const identifiers = data && data.identifiers ? data.identifiers : [];
          this.setUnusedIdentifiers(this.unusedIdentifiers);//.attributes);
        })
        .finally(() => mask.close());
    },
    setUnusedIdentifiers(identifiers) {
      const rows = [];
      identifiers.each((identifier) => rows.push(identifier.attributes));
      this.rows = rows;
    }
  }
};
</script>
