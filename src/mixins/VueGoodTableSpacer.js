export default {
  name: 'VueGoodTableSpacer',
  mounted() {
    const header = this.$el.getElementsByClassName('vgt-fixed-header')[0],
      tHead = header && header.getElementsByTagName('thead')[0],
      tr = tHead && tHead.getElementsByTagName('tr')[0],
      spacer = tr && document.createElement('tr');

    if (spacer) {
      spacer.classList.add('elucidation-header-spacer');
      tr.appendChild(spacer);
    }
  }
};
