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
export default {
  name: 'UnusedIdentifiers',
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
  mounted() {
    window.$(this.$refs.unusedIdentifierTable.$el).find('.vgt-fixed-header thead tr').append('<tr class="elucidation-header-spacer"/>');
  },
  methods: {
    setService(service) {
      const mask = this.$loading({ target: this.$el });
      fetch(`${process.env.VUE_APP_BASE_URL}/elucidate/connectionIdentifier/${service}/unused`)
        .then((response) => response.json())
        .then((data) => this.setUnusedIdentifiers(data.identifiers))
        .finally(() => mask.close());
    },
    getUnusedIdentifiers() {
      return this.rows;
    },
    setUnusedIdentifiers(identifiers) {
      this.rows = identifiers;
    }
  }
};
</script>
