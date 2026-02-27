'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { ContributorGraphData } from '@/lib/types';

interface ContributorGraphProps {
    data: ContributorGraphData;
}

export default function ContributorGraph({ data }: ContributorGraphProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current || !data || data.nodes.length === 0) return;

        const width = containerRef.current.clientWidth;
        const height = 400;

        d3.select(containerRef.current).selectAll('*').remove();

        const svg = d3.select(containerRef.current)
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .style('background', 'transparent');

        const simulation = d3.forceSimulation(data.nodes as any)
            .force('link', d3.forceLink(data.links).id((d: any) => d.id).distance(100))
            .force('charge', d3.forceManyBody().strength(-300))
            .force('center', d3.forceCenter(width / 2, height / 2));

        const link = svg.append('g')
            .attr('stroke', '#4B5563')
            .attr('stroke-opacity', 0.6)
            .selectAll('line')
            .data(data.links)
            .join('line')
            .attr('stroke-width', (d: any) => Math.max(0.5, Math.sqrt(d.weight)));

        const node = svg.append('g')
            .attr('stroke', '#1F2937')
            .attr('stroke-width', 1.5)
            .selectAll('circle')
            .data(data.nodes)
            .join('circle')
            .attr('r', (d: any) => Math.max(5, Math.min(30, Math.sqrt(d.commitCount) * 2)))
            .attr('fill', '#06b6d4') // Cyan
            .call(drag(simulation) as any);

        node.append('title')
            .text((d: any) => `${d.id} (${d.commitCount} commits)`);

        simulation.on('tick', () => {
            link
                .attr('x1', (d: any) => d.source.x)
                .attr('y1', (d: any) => d.source.y)
                .attr('x2', (d: any) => d.target.x)
                .attr('y2', (d: any) => d.target.y);

            node
                .attr('cx', (d: any) => Math.max(10, Math.min(width - 10, d.x)))
                .attr('cy', (d: any) => Math.max(10, Math.min(height - 10, d.y)));
        });

        function drag(simulation: any) {
            function dragstarted(event: any) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                event.subject.fx = event.subject.x;
                event.subject.fy = event.subject.y;
            }

            function dragged(event: any) {
                event.subject.fx = event.x;
                event.subject.fy = event.y;
            }

            function dragended(event: any) {
                if (!event.active) simulation.alphaTarget(0);
                event.subject.fx = null;
                event.subject.fy = null;
            }

            return d3.drag()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended);
        }

    }, [data]);

    return (
        <div className="w-full rounded-2xl overflow-hidden bg-gray-900/40 backdrop-blur-md border border-gray-800 p-2 relative h-[400px]">
            <h3 className="text-gray-300 text-sm tracking-widest uppercase font-semibold absolute top-4 left-4 z-10">Contributor Network</h3>
            <div ref={containerRef} className="w-full h-full absolute top-0 left-0" />
        </div>
    );
}
