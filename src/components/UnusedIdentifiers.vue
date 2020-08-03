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
    fetch(`${process.env.VUE_APP_BASE_URL}/elucidate/connectionIdentifier/unused`)
      .then((response) => response.json())
      .then((data) => {
        this.staticIdentifiers = data;
      });

    window.$(this.$refs.unusedIdentifierTable.$el).find('.vgt-fixed-header thead tr').append('<tr class="elucidation-header-spacer"/>');
  },
  methods: {
    setService(service) {
      // TODO: Remove 'true' case when service endpoint is in place
      if (true) {
        const entry = this.staticIdentifiers.find((si) => si.serviceName === service),
          msg = `There are no unused identifiers for the ${this.lodash.startCase(service)}`,
          unused = entry ? entry.identifiers : [{ connectionIdentifier: msg }];
        this.setUnusedIdentifiers(unused);
      } else {
        const mask = this.$loading({ target: this.$el });
        fetch(`${process.env.VUE_APP_BASE_URL}/elucidate/connectionIdentifiers/${service}/unused`)
          .then((response) => response.json())
          .then((data) => this.setUnusedIdentifiers(data))
          .finally(() => mask.close());
      }
    },
    setUnusedIdentifiers(identifiers) {
      this.rows = identifiers;
    }
  }
};
</script>
