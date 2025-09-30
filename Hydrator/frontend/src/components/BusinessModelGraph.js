import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const BusinessModelGraph = ({ hydrationData }) => {
  const svgRef = useRef();
  const containerRef = useRef();
  const simulationRef = useRef();
  const [selectedNode, setSelectedNode] = React.useState('assessments');

  useEffect(() => {
    if (!hydrationData) return;

    // Extract entity data from hydration
    const entities = extractEntities(hydrationData);

    const renderGraph = () => {

    // Clear previous graph
    d3.select(svgRef.current).selectAll('*').remove();

    // Get container width for responsiveness
    const containerWidth = containerRef.current?.offsetWidth || 1000;
    const width = Math.max(800, containerWidth);
    const height = 700;

    const svg = d3.select(svgRef.current)
      .attr('width', '100%')
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Define nodes (entity types)
    const nodes = [
      { id: 'organizations', label: 'Organizations', color: '#0d6efd', instances: entities.organizations },
      { id: 'facilities', label: 'Facilities', color: '#198754', instances: entities.facilities },
      { id: 'accounts', label: 'Accounts', color: '#0dcaf0', instances: entities.accounts },
      { id: 'securityplans', label: 'Security Plans', color: '#ffc107', instances: entities.securityplans },
      { id: 'catalogues', label: 'Catalogues', color: '#dc3545', instances: entities.catalogues },
      { id: 'securitycontrols', label: 'Security Controls', color: '#6c757d', instances: entities.securitycontrols },
      { id: 'components', label: 'Components', color: '#212529', instances: entities.components },
      { id: 'assets', label: 'Assets', color: '#6f42c1', instances: entities.assets },
      { id: 'risks', label: 'Risks', color: '#fd7e14', instances: entities.risks },
      { id: 'assessments', label: 'Assessments', color: '#20c997', instances: entities.assessments },
      { id: 'supplychain', label: 'Supply Chain', color: '#d63384', instances: entities.supplychain }
    ];

    // Define edges (relationships)
    const edges = [
      // Structural (solid)
      { source: 'organizations', target: 'facilities', type: 'contains' },
      { source: 'organizations', target: 'accounts', type: 'contains' },
      { source: 'organizations', target: 'securityplans', type: 'contains' },
      { source: 'organizations', target: 'catalogues', type: 'contains' },
      { source: 'securityplans', target: 'components', type: 'contains' },
      { source: 'securityplans', target: 'assets', type: 'contains' },
      { source: 'securityplans', target: 'risks', type: 'contains' },
      { source: 'securityplans', target: 'assessments', type: 'contains' },
      { source: 'securityplans', target: 'supplychain', type: 'contains' },
      { source: 'catalogues', target: 'securitycontrols', type: 'contains' },

      // References (dashed)
      { source: 'securitycontrols', target: 'securityplans', type: 'references' },
      { source: 'securitycontrols', target: 'components', type: 'references' },
      { source: 'securitycontrols', target: 'accounts', type: 'references' },
      { source: 'components', target: 'accounts', type: 'references' },
      { source: 'assets', target: 'facilities', type: 'references' },
      { source: 'assets', target: 'accounts', type: 'references' },
      { source: 'risks', target: 'components', type: 'references' },
      { source: 'risks', target: 'securitycontrols', type: 'references' },
      { source: 'risks', target: 'accounts', type: 'references' },
      { source: 'assessments', target: 'components', type: 'references' },
      { source: 'assessments', target: 'facilities', type: 'references' },
      { source: 'assessments', target: 'accounts', type: 'references' },
      { source: 'supplychain', target: 'accounts', type: 'references' }
    ];

    // Define arrow markers
    svg.append('defs').selectAll('marker')
      .data(['contains', 'references'])
      .join('marker')
      .attr('id', d => `arrow-${d}`)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 40)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#999');

    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(edges).id(d => d.id).distance(250))
      .force('charge', d3.forceManyBody().strength(-800))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(80));

    // Store simulation reference for untangle button
    simulationRef.current = simulation;

    // Add links
    const link = svg.append('g')
      .selectAll('line')
      .data(edges)
      .join('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', d => d.type === 'references' ? '5,5' : '0')
      .attr('marker-end', d => `url(#arrow-${d.type})`);

    // Add nodes
    const node = svg.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    // Add circles
    node.append('circle')
      .attr('r', 30)
      .attr('fill', d => d.color)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('class', 'node-circle');

    // Add labels
    node.append('text')
      .text(d => d.label)
      .attr('text-anchor', 'middle')
      .attr('dy', 45)
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .attr('fill', '#333');

    // Add count badges
    node.append('text')
      .text(d => d.instances.length)
      .attr('text-anchor', 'middle')
      .attr('dy', 5)
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('fill', '#fff');

    // Create tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'graph-tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', 'white')
      .style('border', '1px solid #ddd')
      .style('border-radius', '4px')
      .style('padding', '10px')
      .style('box-shadow', '0 2px 4px rgba(0,0,0,0.2)')
      .style('font-size', '12px')
      .style('max-width', '300px')
      .style('z-index', '1000');

    // Function to get connected node IDs
    const getConnectedNodes = (nodeId) => {
      const connected = new Set([nodeId]);
      edges.forEach(edge => {
        if (edge.source.id === nodeId || edge.source === nodeId) {
          connected.add(edge.target.id || edge.target);
        }
        if (edge.target.id === nodeId || edge.target === nodeId) {
          connected.add(edge.source.id || edge.source);
        }
      });
      return connected;
    };

    // Apply dimming based on selected node
    const updateDimming = (selectedId) => {
      if (!selectedId) {
        // No selection - reset all to normal
        node.selectAll('.node-circle').style('opacity', 1);
        node.selectAll('text').style('opacity', 1);
        link.style('opacity', 0.6);
      } else {
        // Dim everything except selected node and its connections
        const connected = getConnectedNodes(selectedId);

        node.selectAll('.node-circle').style('opacity', d =>
          connected.has(d.id) ? 1 : 0.2
        );
        node.selectAll('text').style('opacity', d =>
          connected.has(d.id) ? 1 : 0.2
        );
        link.style('opacity', d => {
          const sourceId = d.source.id || d.source;
          const targetId = d.target.id || d.target;
          return (sourceId === selectedId || targetId === selectedId) ? 0.6 : 0.1;
        });
      }
    };

    // Add click interaction for focus
    node.on('click', function(event, d) {
      event.stopPropagation();
      const newSelection = selectedNode === d.id ? null : d.id;
      setSelectedNode(newSelection);
      updateDimming(newSelection);
    });

    // Click on background to clear selection
    svg.on('click', function() {
      setSelectedNode(null);
      updateDimming(null);
    });

    // Add tooltip interactions
    node
      .on('mouseover', function(event, d) {
        const tooltipContent = formatTooltip(d);
        tooltip
          .style('visibility', 'visible')
          .html(tooltipContent);

        d3.select(this).select('circle')
          .attr('r', 35)
          .attr('stroke-width', 3);
      })
      .on('mousemove', function(event) {
        tooltip
          .style('top', (event.pageY - 10) + 'px')
          .style('left', (event.pageX + 10) + 'px');
      })
      .on('mouseout', function() {
        tooltip.style('visibility', 'hidden');
        d3.select(this).select('circle')
          .attr('r', 30)
          .attr('stroke-width', 2);
      });

    // Apply initial dimming if there's a selected node
    updateDimming(selectedNode);

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Drag functions
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    };

    // Initial render
    renderGraph();

    // Add resize listener for responsiveness
    const handleResize = () => {
      renderGraph();
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      d3.selectAll('.graph-tooltip').remove();
    };
  }, [hydrationData, selectedNode]);

  return (
    <div className="business-model-graph" ref={containerRef}>
      <div className="mb-3 text-center">
        <small className="text-muted">
          <i className="bi bi-info-circle me-1"></i>
          Click on a node to highlight its relationships. Click again or on the background to reset.
        </small>
      </div>
      <svg ref={svgRef}></svg>
      <div className="mt-3 d-flex justify-content-center gap-4">
        <div className="d-flex align-items-center gap-2">
          <svg width="40" height="2">
            <line x1="0" y1="1" x2="40" y2="1" stroke="#999" strokeWidth="2" />
          </svg>
          <small>Contains/Parent</small>
        </div>
        <div className="d-flex align-items-center gap-2">
          <svg width="40" height="2">
            <line x1="0" y1="1" x2="40" y2="1" stroke="#999" strokeWidth="2" strokeDasharray="5,5" />
          </svg>
          <small>References</small>
        </div>
      </div>
    </div>
  );
};

// Extract entities from hydration data
function extractEntities(data) {
  const entities = {
    organizations: [],
    facilities: [],
    accounts: [],
    securityplans: [],
    catalogues: [],
    securitycontrols: [],
    components: [],
    assets: [],
    risks: [],
    assessments: [],
    supplychain: []
  };

  if (!data.calls) return entities;

  data.calls.forEach(call => {
    if (call.method !== 'GET' && call.result && call.statusCode === 200) {
      const url = call.url.toLowerCase();
      const result = call.result;

      if (url.includes('/organizations')) {
        entities.organizations.push({
          name: result.name || 'Unnamed',
          detail: result.status || ''
        });
      }
      if (url.includes('/facilities')) {
        entities.facilities.push({
          name: result.name || 'Unnamed',
          detail: result.facilityType || ''
        });
      }
      if (url.includes('/accounts')) {
        entities.accounts.push({
          name: `${result.firstName || ''} ${result.lastName || ''}`.trim() || 'Unnamed',
          detail: result.title || ''
        });
      }
      if (url.includes('/securityplans')) {
        entities.securityplans.push({
          name: result.name || result.systemName || 'Unnamed',
          detail: result.status || ''
        });
      }
      if (url.includes('/catalogues')) {
        entities.catalogues.push({
          name: result.title || 'Unnamed',
          detail: result.catalogueType || ''
        });
      }
      if (url.includes('/securitycontrols')) {
        entities.securitycontrols.push({
          name: result.controlIdentifier || result.title || 'Unnamed',
          detail: result.title || ''
        });
      }
      if (url.includes('/components')) {
        entities.components.push({
          name: result.componentName || result.title || 'Unnamed',
          detail: result.componentType || ''
        });
      }
      if (url.includes('/assets')) {
        entities.assets.push({
          name: result.name || 'Unnamed',
          detail: result.assetType || ''
        });
      }
      if (url.includes('/risks')) {
        entities.risks.push({
          name: result.riskStatement ? result.riskStatement.substring(0, 30) + '...' : 'Unnamed',
          detail: result.status || ''
        });
      }
      if (url.includes('/assessments')) {
        entities.assessments.push({
          name: result.title || 'Unnamed',
          detail: result.assessmentType || ''
        });
      }
      if (url.includes('/supplychain')) {
        entities.supplychain.push({
          name: result.title || 'Unnamed',
          detail: result.contractType || ''
        });
      }
    }
  });

  return entities;
}

// Format tooltip content
function formatTooltip(node) {
  const instances = node.instances.slice(0, 5); // Show max 5
  const remaining = node.instances.length - 5;

  let html = `<strong>${node.label}</strong> (${node.instances.length})<br/><br/>`;

  instances.forEach(instance => {
    const detail = instance.detail ? ` - ${instance.detail}` : '';
    html += `• ${instance.name}${detail}<br/>`;
  });

  if (remaining > 0) {
    html += `<em>...and ${remaining} more</em>`;
  }

  return html;
}

export default BusinessModelGraph;