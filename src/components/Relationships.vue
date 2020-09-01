<template>
  <el-container class="elucidation-relationships">
    <el-header class="elucidation-header">
      <span>Relationships</span>
    </el-header>
    <el-main style="overflow:hidden">
      <div class="elucidation-relationships-container">
        <div class="elucidation-relationships-svg">
          <svg width="100%" viewBox="0 0 1000 1000"> </svg>
        </div>
        <div class="elucidation-relationships-toolbar">
          <el-tooltip content="Reset Display" placement="right">
            <el-button icon="el-icon-s-home" @click="onGoHome" style="position:inherit;font-size:2em;padding:2px"></el-button>
          </el-tooltip>
        </div>
      </div>
    </el-main>
  </el-container>
</template>
<script>

import Vue from 'vue';
import VueLodash from 'vue-lodash';
import * as d3 from 'd3';
import _ from 'lodash';

window.d3 = d3;

export default {
  name: 'Relationships',
  data() {
    return {
      relationships: [],
      nodeIdCtr: 1,
      rectHeight: 50,
      rectOffset: 180,
      rectWidth: 160,
      transitionDuration: 750
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.canvas = d3.select('svg')
        .append('g')
        .classed('canvas', true);

      this.zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on('zoom', () => {
          this.canvas.attr('transform', d3.event.transform);
        });

      d3.select('svg').call(this.zoom);

      const defs = this.canvas.append('defs');

      defs.append('marker')
        .classed('elucidation-inbound-pointer', true)
        .attr('id', 'inbound-pointer')
        .attr('markerWidth', '16')
        .attr('markerHeight', '11')
        .attr('refX', '16')
        .attr('refY', '5')
        .attr('markerUnits', 'userSpaceOnUse');

      defs.select('#inbound-pointer')
        .append('polygon')
        .classed('elucidation-pointer', true)
        .attr('points', '0,5 10,0 10,11');

      defs.append('marker')
        .classed('elucidation-outbound-pointer', true)
        .attr('id', 'outbound-pointer')
        .attr('markerWidth', '16')
        .attr('markerHeight', '11')
        .attr('refX', '16')
        .attr('refY', '5')
        .attr('markerUnits', 'userSpaceOnUse');

      defs.select('#outbound-pointer')
        .append('polygon')
        .classed('elucidation-pointer', true)
        .attr('points', '0,0 0,11, 11,5');
    });
  },

  methods: {
    getRelationships() {
      return this.relationships;
    },

    loadRelationships(service) {
      let promise = Promise.resolve({});
      if (service) {
        promise = fetch(`${process.env.VUE_APP_BASE_URL}/elucidate/service/${service}/relationships`)
          .then((response) => {
            if (!response.ok) {
              throw new Error(`Error loading relationships for ${service}`);
            }
            return response.json();
          })
          .then((relationships) => {
            relationships && relationships.children && relationships.children.sort((a, b) => {
              const nameA = _.startCase(a.serviceName),
                nameB = _.startCase(b.serviceName);

              a.hasInbound = true;
              a.hasOutbound = true;
              return nameA.localeCompare(nameB);
            });
            return relationships;
          })
          .catch((error) => { this.$emit('load-relationships-error', error); });
      }
      return promise;
    },

    onGoHome() {
      d3.select('svg')
        .transition()
        .duration(this.transitionDuration)
        .call(this.zoom.transform, d3.zoomIdentity);
    },

    setService(service) {
      const mask = this.$loading({ target: this.$el });
      return this.loadRelationships(service)
        .then((data) => this.setRelationships(data))
        .finally(() => mask.close());
    },

    setRelationships(relationships = {}) {
      const width = 960,
        height = 500;

      this.relationships = relationships;

      // Remove all existing elements
      this.canvas.selectAll('g.node').remove();
      this.canvas.selectAll('g.link').remove();

      if (!this.relationships.children || this.relationships.children.length === 0) {
        return;
      }
      // declares a tree layout and assigns the size
      this.treemap = d3.tree().size([height, width]);

      // Assigns parent, children, height, depth
      this.root = d3.hierarchy(relationships, (d) => d.children);
      this.root.x0 = height / 2;
      this.root.y0 = 0;

      // Collapse after the second level
      const collapseFn = this.collapse.bind(this);
      this.root.children && this.root.children.forEach(collapseFn);

      this.update(this.root);

      this.$nextTick(() => {
        const rootNode = d3.selectAll('rect.root-node').node();
        rootNode && rootNode.parentElement.dispatchEvent(new Event('click'));
      });
    },

    // Collapse the node and all it's children
    collapse(d) {
      const collapseFn = this.collapse.bind(this);
      if (d.children) {
        d._children = d.children;
        d._children.forEach(collapseFn);
        d.children = null;
      }
    },

    onClick(g, n) {
      const childService = n.data.serviceName,
        parentService = n.parent && n.parent.data.serviceName;

      d3.selectAll('rect.selected-node').classed('selected-node', false);
      d3.select(g).select('rect.rect-node').classed('selected-node', true);
      this.$emit('service-selected', childService, parentService);
    },

    onDoubleClick(g, d) {
      const me = this,
        svg = d3.select('svg'),
        expandedNodeClassName = `expanded-node-${d.depth}`;

      // Suspend the pan/zoom while we add/remove items, else it zooms in multiple times
      svg.on('.zoom', null);
      if (d.children) {
        d.children = null;
        this.update(d);
        // Re-enable the pan/zoom. A bit of a hack, but we need to wait a second or else it zooms in right away.
        d3.timer(() => svg.call(this.zoom));
      } else {
        this.canvas.selectAll(`g.${expandedNodeClassName}`)
          .each(function(expanded) {
            expanded.children = null;
            me.update(expanded);
            d3.select(this).classed(expandedNodeClassName, false);
          });
        d3.select(g).classed(expandedNodeClassName, true);
        this.loadRelationships(d.data.serviceName).then((serviceRelationship) => {
          const newHierarchyChildren = [],
            kids = d.data.children = serviceRelationship.children;

          if (kids.length === 0) {
            this.$alert(`${_.startCase(d.data.serviceName)} has no dependencies.`, 'Notice', {
              confirmButtonText: 'Ok'
            });
            return;
          }
          kids.forEach((kid) => {
            const newNode = d3.hierarchy(kid);
            newNode.depth = d.depth + 1; // update depth depends on parent
            newNode.height = d.height;
            newNode.parent = d; // set parent
            newNode.id = null; // String(++i);
            newHierarchyChildren.push(newNode);
          });
          d.children = newHierarchyChildren;
          d._children = newHierarchyChildren;
          this.update(d);
          // Re-enable the pan/zoom
          svg.call(this.zoom);
        });
      }
    },
    // Creates a curved (diagonal) path from parent to the child nodes
    diagonal(s, d) {
      const path = `M ${s.y + this.rectOffset} ${s.x}
              C ${((s.y + d.y) / 2) + this.rectOffset} ${s.x},
                ${((s.y + d.y) / 2) + this.rectOffset} ${d.x},
                ${d.y + this.rectOffset} ${d.x}`;

      return path;
    },

    update(source) {
      const treeData = this.treemap(this.root),
        // Compute the new tree layout.
        nodes = treeData.descendants(),
        links = treeData.descendants().slice(1);

      this.addNodes(source, nodes);
      this.addLinks(source, links);

      // Store the old positions for transition.
      nodes.forEach((d) => {
        d.x0 = d.x;
        d.y0 = d.y;
      });
      this.$emit('rendered', this, this.canvas);
    },

    // ****************** Nodes section ***************************
    addNodes(source, nodes) {
      // We need 'me' because of node selection issues. See NOTE in click listeners
      const me = this;

      // Normalize for fixed-depth.
      nodes.forEach((d) => {
        const offset = d.parent ? d.depth-1 : 0;
        d.y = d.depth * this.rectOffset + (offset*this.rectWidth);
      });

      // Update the nodes...
      const node = this.canvas.selectAll('g.node')
        .data(nodes, (d) => d.id || (d.id = ++this.nodeIdCtr));

      // Enter any new modes at the parent's previous position.
      const nodeEnter = node.enter().append('g')
        .attr('class', 'node')
        .attr('transform', (d) => `translate(${source.y0+this.rectOffset},${source.x0})`)
        // NOTE: We do the listeners this way because the 'g' element is 'this' in the callback, and we need access to it so we can
        // perform actions on it (e.g., add the 'expanded' class to it).
        // There doesn't seem to be an easy way to get the 'g' element responsible for the click actions any other way.
        .on('click', function _click(n) {
          // 'this' is the 'g' element.
          me.onClick(this, n);
        })
        .on('dblclick', function _doubleClick(d) {
          // 'this' is the 'g' element.
          me.onDoubleClick(this, d);
        });

      // Add Circle for the nodes
      nodeEnter.append('rect')
        .attr('class', 'node')
        .attr('height', 0);

      // Add labels for the nodes
      nodeEnter.append('text')
        .classed('text-node', true)
        .attr('dy', '.35em')
        .attr('y', this.rectHeight/2)
        .attr('x', (d) => (d.children || d._children ? -150 : 10))
        .attr('text-anchor', 'start')
        .text((d) => _.startCase(d.data.serviceName));

      // UPDATE
      const nodeUpdate = nodeEnter.merge(node);

      // Transition to the proper position for the node
      nodeUpdate.transition()
        .duration(this.transitionDuration)
        .attr('transform', (d) => `translate(${d.y+this.rectOffset},${d.x-(this.rectHeight/2)})`);

      // Update the node attributes and style
      nodeUpdate.select('rect.node')
        .attr('width', 160)
        .attr('height', this.rectHeight)
        .attr('rx', 10)
        .attr('ry', 10)
        .attr('class', (n) => (n.parent ? 'rect-node' : 'root-node rect-node'))
        .attr('cursor', 'pointer');

      // Remove any exiting nodes
      this.removeNodes(source, node);
    },

    // ****************** links section ***************************
    addLinks(source, links) {
      // We need 'me' because of link selection issues. See NOTE in node click listeners above
      const me = this;

      const link = this.canvas.selectAll('g.link')
        .data(links, (d) => d.id);

      const g = link.enter().insert('g', 'g.node')
        .attr('class', 'link');

      g.insert('path')
        .classed('inbound-path', true)
        .classed('elucidation-hidden', (d) => !d.data.hasInbound)
        .attr('d', (d) => {
          const offset = d.data.hasInbound ? 10 : 0,
            o = { x: source.x0, y: source.y0 + offset };
          return this.diagonal(o, o);
        })
        .attr('marker-start', 'url(#inbound-pointer)');

      g.insert('path')
        .classed('outbound-path', true)
        .classed('elucidation-hidden', (d) => !d.data.hasOutbound)
        .attr('d', (d) => {
          const offset = d.data.hasInbound ? -10 : 0,
            o = { x: source.x0, y: source.y0 + offset };
          return this.diagonal(o, o);
        })
        .attr('marker-start', 'url(#outbound-pointer)');

      // UPDATE
      // Transition back to the parent element position
      const linkUpdate = this.canvas.selectAll('path').merge(link);
      linkUpdate.transition()
        .duration(this.transitionDuration)
        .attr('d', function _transitionLink(d) {
          const begin = { x: d.x, y: d.y },
            end = { x: d.parent.x, y: d.parent.y + (d.depth === 1 ? 0 : me.rectWidth) },
            offset = 10 * (this.getAttribute('class').match(/inbound/) ? 1 : -1);

          d.data.hasInbound && d.data.hasOutbound && (begin.x += offset);
          return me.diagonal(begin, end);
        });

      // Remove any exiting links
      const linkExit = link.exit();
      linkExit.selectAll('path').transition()
        .duration(this.transitionDuration)
        .attr('d', (d) => {
          const o = { x: source.x, y: source.y };
          return this.diagonal(o, o);
        });
      linkExit.remove();
    },

    removeNodes(source, node) {
      // Remove any exiting nodes
      const nodeExit = node.exit().transition()
        .duration(this.transitionDuration)
        .attr('transform', (d) => `translate(${source.y+this.rectOffset},${source.x})`)
        .remove();

      // On exit reduce the node rects size to 0
      nodeExit.select('rect')
        .attr('width', 0)
        .attr('height', 0);

      // On exit reduce the opacity of text labels
      nodeExit.select('text')
        .style('fill-opacity', 1e-6);
    }
  }
};
</script>
