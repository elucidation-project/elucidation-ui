<template>
  <el-container class='elucidation-system-dependencies'>
    <el-header class='elucidation-header'>
      <span>System Dependencies</span>
    </el-header>
    <el-main style='overflow:hidden'>
      <div class='elucidation-system-dependencies-container'>
        <div ref='systemDependenciesSvgDiv' class='elucidation-system-dependencies-svg'>
          <svg id='system_dependencies_svg' width='100%' viewBox='0 0 1000 1000'> </svg>
        </div>
        <div class='elucidation-system-dependencies-toolbar'>
          <el-tooltip content='Reload Dependencies' placement='right'>
            <el-button icon='el-icon-refresh' @click='onReload' style='position:inherit;font-size:2em;padding:2px'></el-button>
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
import * as d3Chord from 'd3-chord';
import _ from 'lodash';
import { Library } from '@observablehq/stdlib/';
import SystemDependency from '../models/SystemDependency';
import SystemDependencies from '../collections/SystemDependencies';

window.d3 = d3;
window.d3Chord = d3Chord;

export default {
  name: 'SystemDependenciesView',
  data() {
    return {
      library: new Library(),
      dependencies: null,
      systemDependencies: new SystemDependencies(),
      mousePosition: {},
      calculateDistanceTimer: null,
      parentService: null,
      childService: null
    };
  },
  mounted() {
    this.svg = d3.select('svg#system_dependencies_svg');
    this.$nextTick(() => {
      this.loadSystemDependencies();
    });
    this.$refs.systemDependenciesSvgDiv.addEventListener('mousemove', (evt) => {
      this.mousePosition = {
        x: evt.clientX,
        y: evt.clientY
      };
    });
  },

  methods: {
    getSystemDependencies() {
      return this.systemDependencies;
    },

    loadSystemDependencies() {
      return this.systemDependencies.fetch()
        .then(this._buildSystemDependencies.bind(this))
        .catch((error) => { this.$emit('load-systemdependencies-error', error); });
    },

    onReload() {
      const mask = this.$loading({ target: this.$el });
      this.loadSystemDependencies()
        .finally(() => mask.close());
    },

    refresh() {
      this.dependencies && this._buildChordDiagram();
    },

    _buildChordDiagram() {
      const me = this,
        { names, matrix } = this.dependencies,
        { clientWidth, clientHeight } = this.$refs.systemDependenciesSvgDiv,
        color = d3.scaleOrdinal(names, d3.schemeCategory10),
        textId = this.library.DOM.uid('text'),
        innerRadius = Math.min(clientWidth, clientHeight) * 0.5 - 25,
        outerRadius = innerRadius + 10,
        formatValue = (x) => `${x.toFixed(0)}B`;

      this.svg.selectAll('*').remove();

      this.svg.attr('viewBox', [-clientWidth / 2, -clientHeight / 2, clientWidth, clientHeight]);

      const chords = d3Chord.chordDirected()
        .padAngle(10 / innerRadius)
        .sortSubgroups(d3.descending)
        .sortChords(d3.descending)(matrix);

      const arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);

      const ribbon = d3Chord.ribbon() //Arrow()
        .radius(innerRadius - 1)
        .padAngle(1 / innerRadius);

      this.svg.append('path')
        .attr('id', textId.id)
        .attr('fill', 'none')
        .attr('d', d3.arc()({ outerRadius, startAngle: 0, endAngle: 2 * Math.PI }));

      this.svg.append('g')
        .attr('fill-opacity', 0.75)
        .selectAll('g')
        .data(chords)
        .join('path')
        .attr('d', ribbon)
        .attr('fill', (d) => color(names[d.target.index]))
        .style('mix-blend-mode', 'multiply')
        // NOTE: Need to do it this way so we have the path element ('this') available to us.
        .on('mousemove', function mouseMoved(d) { me._onMouseMove(this, d); })
        .on('click', () => this.$emit('service-selected', me.childService, me.parentService))
        .append('title');

      this.svg.append('g')
        .attr('font-family', 'sans-serif')
        .attr('font-size', 10)
        .classed('elucidation-system-dependencies-arc', true)
        .selectAll('g')
        .data(chords.groups)
        .join('g')
        .call((g) => g.append('path')
          .attr('d', arc)
          .attr('fill', (d) => color(names[d.index]))
          .attr('stroke', '#fff'))
        .call((g) => g.append('text')
          .attr('dy', -3)
          .append('textPath')
          .classed('chord-title', true)
          .attr('xlink:href', textId.href)
          .attr('startOffset', (d) => d.startAngle * outerRadius)
          .text((d) => _.startCase(names[d.index].split('-')[0])))
        .call((g) => g.append('title')
          .text((d) => `Select to view Unused Identifiers for the ${_.startCase(names[d.index])}`));
    },

    _buildSystemDependencies() {
      const { systemDependencies, systemDependencies: { length } } = this;

      this.dependencies = { };
      if (length > 0) {
        const names = systemDependencies.map((dependency) => dependency.serviceName),
          matrix = new Array(length);

        names.forEach((rowName, rowIndex) => {
          matrix[rowIndex] = new Array(length).fill(0);
          names.forEach((colName, colIndex) => {
            const row = systemDependencies.find((systemDependency) => systemDependency.serviceName === rowName),
              dependentService = row && row.dependencies.find((dependency) => dependency.serviceName === colName),
              count = (dependentService && dependentService.details) ? dependentService.details.length : 0;
            matrix[rowIndex][colIndex] = count;
          });
        });
        this.dependencies.names = names;
        this.dependencies.matrix = matrix;
      }
      this._buildChordDiagram();
    },

    _onMouseMove(el, d) {
      const { names } = this.dependencies,
        title = d3.select(el).select('title');
      window.clearTimeout(el.calculateDistanceTimer);
      el.calculateDistanceTimer = window.setTimeout(() => {
        const arcs = this.svg.select('g.elucidation-system-dependencies-arc').selectAll('path').nodes(),
          svgPoint = this.svg.node().createSVGPoint(),
          bBoxSource = arcs[d.source.index].getBBox(),
          bBoxTarget = arcs[d.target.index].getBBox();

        svgPoint.x = (bBoxSource.x+bBoxSource.width)/2;
        svgPoint.y = (bBoxSource.y+bBoxSource.height)/2;
        const centerSource = svgPoint.matrixTransform(arcs[d.source.index].getCTM()),
          distToSource = Math.hypot(centerSource.x-this.mousePosition.x, centerSource.y-this.mousePosition.y);

        svgPoint.x = (bBoxTarget.x+bBoxTarget.width)/2;
        svgPoint.y = (bBoxTarget.y+bBoxTarget.height)/2;
        const centerTarget = svgPoint.matrixTransform(arcs[d.target.index].getCTM()),
          distToTarget = Math.hypot(centerTarget.x-this.mousePosition.x, centerTarget.y-this.mousePosition.y);
        if (distToSource > distToTarget) {
          this.childService = names[d.source.index];
          this.parentService = names[d.target.index];
        } else {
          this.parentService = names[d.source.index];
          this.childService = names[d.target.index];
        }
        title.text(`Select to view dependencies between ${_.startCase(this.parentService)} and ${_.startCase(this.childService)}`);
      }, 10);
    }
  }
};
</script>
