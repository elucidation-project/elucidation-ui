<template>
  <el-container class="elucidation-relationships">
    <el-header class="elucidation-header">
      <span>Relationships</span>
    </el-header>
    <el-main>
      <svg width="100%" viewBox="0 0 1000 1000">
      </svg>
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
    return { relationships: [], nodeIdCtr: 1 };
  },
  mounted() {
    this.$nextTick(() => {
      this.canvas = d3.select('svg')
        .append('g')
        .classed('canvas', true)
        .attr('transform', 'translate(180, 20)');
    });
  },
  methods: {
    loadRelationships(service) {
      let promise = Promise.resolve([]);
      if (service) {
        promise = fetch(`${process.env.VUE_APP_BASE_URL}/elucidate/service/${service}/relationships`)
          .then((response) => {
            if (!response.ok) {
              throw new Error(`Error loading relationships for ${service}`);
            }
            return response.json();
          })
          .catch((error) => { this.$emit('load-services-error', error); });
      }
      return promise;
    },
    setService(service) {
      const mask = this.$loading({ target: this.$el });
      return this.loadRelationships(service)
        .then((data) => this.setRelationships(data || []))
        .finally(() => mask.close());
    },
    setRelationships(relationships) {
      const width = 960,
        height = 500;

      this.relationships = relationships;

      // Remove all existing elements
      this.canvas.selectAll('g.node').remove();
      this.canvas.selectAll('path.link').remove();

      if (this.relationships.length === 0) {
        return;
      }

      const defs = this.canvas.append('defs');
      defs.append('marker')
        .classed('elucidation-inbound-pointer', true)
        .attr('id', 'inbound-pointer')
        .attr('markerWidth', '16')
        .attr('markerHeight', '11')
        .attr('refX', '16')
        .attr('refY', '5')
        .attr('markerUunits', 'userSpaceOnUse');

      defs.select('#inbound-pointer')
         .append('polygon')
        .classed('elucidation-pointer', true)
        .attr('points', '0,5,10,0 10,11');

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

    update(source) {
      // Assigns the x and y position for the nodes
      const me = this,
        i = 0,
        rectHeight = 50,
        rectWidth = 160,
        treeData = this.treemap(this.root),
        // Creates a curved (diagonal) path from parent to the child nodes
        diagonal = function(s, d) {
          const path = `M ${s.y} ${s.x}
                  C ${(s.y + d.y) / 2} ${s.x},
                    ${(s.y + d.y) / 2} ${d.x},
                    ${d.y} ${d.x}`;

          return path;
        },
        // Toggle children on click.
        onDoubleClick = function(d) {
          if (d.children) {
            d.children = null;
            this.update(d);
          } else {
            this.loadRelationships(d.data.serviceName).then((serviceRelationship) => {
              const newHierarchyChildren = [];
              const kids = d.data.children = serviceRelationship.children;
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
            });
          }
        };

      // Compute the new tree layout.
      const nodes = treeData.descendants(),
        links = treeData.descendants().slice(1);

      // Normalize for fixed-depth.
      nodes.forEach((d) => {
        const offset = d.parent ? d.depth-1 : 0;
        d.y = d.depth * 180 + (offset*rectWidth);
      });

      // ****************** Nodes section ***************************

      // Update the nodes...
      const node = this.canvas.selectAll('g.node')
        .data(nodes, (d) => d.id || (d.id = ++this.nodeIdCtr));

      // Enter any new modes at the parent's previous position.
      const nodeEnter = node.enter().append('g')
        .attr('class', 'node')
        .attr('transform', (d) => `translate(${source.y0},${source.x0})`)
        .on('click', function onClick(n) {
          const childService = n.data.serviceName,
            parentService = n.parent && n.parent.data.serviceName;

          d3.selectAll('rect.selected-node').classed('selected-node', false);
          d3.select(this).select('rect.rect-node').classed('selected-node', true);
          me.$emit('service-selected', childService, parentService);
        })
        .on('dblclick', onDoubleClick.bind(this));

      // Add Circle for the nodes
      nodeEnter.append('rect')
        .attr('class', 'node')
        .attr('height', 0);
        // .style('fill', (d) => (d._children ? 'lightsteelblue' : '#fff'));

      // Add labels for the nodes
      nodeEnter.append('text')
        .classed('text-node', true)
        .attr('dy', '.35em')
        .attr('y', rectHeight/2)
        .attr('x', (d) => (d.children || d._children ? -150 : 10))
        .attr('text-anchor', 'start')
        .text((d) => _.startCase(d.data.serviceName));

      // UPDATE
      const nodeUpdate = nodeEnter.merge(node);

      const duration = 750;
      // Transition to the proper position for the node
      nodeUpdate.transition()
        .duration(duration)
        .attr('transform', (d) => `translate(${d.y},${d.x-(rectHeight/2)})`);

      // Update the node attributes and style
      nodeUpdate.select('rect.node')
        .attr('width', 160)
        .attr('height', rectHeight)
        .attr('rx', 10)
        .attr('ry', 10)
        .attr('class', (n) => (n.parent ? 'rect-node' : 'root-node rect-node'))
        // .style('fill', 'lightsteelblue')
        .attr('cursor', 'pointer');

      // Remove any exiting nodes
      this.removeNodes(source, node);

      // ****************** links section ***************************

      // Update the links...
      const link = this.canvas.selectAll('path.link')
        .data(links, (d) => d.id);

      // Enter any new links at the parent's previous position.
      const linkEnter = link.enter().insert('path', 'g')
        .attr('class', 'link')
        .attr('d', (d) => {
          const o = { x: source.x0, y: source.y0 };
          return diagonal(o, o);
        });

      // UPDATE
      const linkUpdate = linkEnter.merge(link);

      // Transition back to the parent element position
      linkUpdate.transition()
        .duration(duration)
        .attr('d', (d) => {
          const f = { x: d.parent.x, y: d.parent.y + (d.depth === 1 ? 0 : rectWidth) };
          return diagonal(d, f);
        });

      // Remove any exiting links
      const linkExit = link.exit().transition()
        .duration(duration)
        .attr('d', (d) => {
          const o = { x: source.x, y: source.y };
          return diagonal(o, o);
        })
        .remove();

      // Store the old positions for transition.
      nodes.forEach((d) => {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    },

    removeNodes(source, node) {
      const duration = 750;
      // Remove any exiting nodes
      const nodeExit = node.exit().transition()
        .duration(duration)
        .attr('transform', (d) => `translate(${source.y},${source.x})`)
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
