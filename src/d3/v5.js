
import React from "react";
import * as d3 from "d3";

export default class extends React.Component {
	constructor(props) {
		super(props);

		this.height = 400;
		this.width = 600;
	}

	componentDidMount() {
		const root = d3.hierarchy(this.props.data);

		const links = root.links();
		const nodes = root.descendants();

		let link, node, nodeEnter;

		const simulation = d3.forceSimulation(nodes)
			.force("link", d3.forceLink(links).id(d => d.id).distance(42).strength(1))
			.force("charge", d3.forceManyBody().strength(-500))
			.force("collide", d3.forceCollide().radius(d => 5))
			.force("x", d3.forceX())
			.force("y", d3.forceY())
			.on("tick", () => {
				link
					.attr("x1", d => d.source.x)
					.attr("y1", d => d.source.y)
					.attr("x2", d => d.target.x)
					.attr("y2", d => d.target.y);

				nodeEnter
					.attr("transform", d => "translate(" + d.x + "," + d.y + ")");
			});


		const zoom = d3.zoom()
			.on("zoom", () => {
				container.attr("transform", d3.event.transform);
			});

		const svg = d3.select(this.refs.canvas).append("svg")
			.attr("viewBox", [-this.width / 2, -this.height / 2, this.width, this.height])
			.call(zoom);

		const container = svg.append("g")
			.attr("class", "container");

		let update = () => {
			link = container.append("g")
				.attr("stroke", "#999")
				.attr("stroke-opacity", 0.6)
				.selectAll("line")
				.data(links)
				.join("line");

			node = container.selectAll("g.node")
				.data(nodes);

			nodeEnter = node.enter()
				.append("g")
				.attr("id", d => "node_" + (d.data.name || Math.floor(Math.random() * 1000)))
				.attr("class", "node");

			nodeEnter
				.append("circle")
				.attr("id", d => (d.leafUid = "leaf_" + Math.random().toString(36).substr(2, 9)))
				.attr("class", "node_circle")
				.attr("fill", d => d.data.root ? "#ed798d" : d.children ? "#99e6c8" : "#65BCF8")
				.attr("stroke", "rgba(0,0,0,.5)")
				.attr("stroke-width", 1.5)
				.attr("r", d => (d.r = d.children ? 20 : 10))
				.style("cursor", "pointer")
				.call(this.drag(simulation))
				.on("mouseover", this.mouseover)
				.on("mouseout", this.mouseout)
				.on("click", (d) => {
					// if (!d3.event.defaultPrevented) {
					// 	if (d.children) {
					// 		d._children = d.children;
					// 		d.children = null;
					// 	} else {
					// 		d.children = d._children;
					// 		d._children = null;
					// 	}
					// 	update();
					// }
				});

			nodeEnter
				.append("clipPath")
				.attr("id", d => (d.clipUid = "clip_" + Math.random().toString(36).substr(2, 9)))
				.append("use")
				.attr("xlink:href", d => window.location.href + "#" + d.leafUid);

			nodeEnter
				.append("text")
				.attr("clip-path", d => "url(" + window.location.href + "#" + d.clipUid + ")")
				.selectAll("tspan")
				.data(d => d.data && d.data.name ? d.data.name.split(/(?=[A-Z][^A-Z])/g) : "0")
				.join("tspan")
				.attr("text-anchor", "middle")
				.attr("font-size", d => d.length < 5 ? "10" : (d.length < 8 ? "8" : "5"))
				.attr("x", 0)
				.attr("y", (d, i, nodes) => `${i - nodes.length / 2 + 0.8}em`)
				.text(d => d);
		}

		update();
	}

	mouseover(d, i) {
		d3.select(this)
			.transition()
			.attr("r", d.r + 2)
			.attr("stroke", "#000");
	}

	mouseout(d, i) {
		d3.select(this)
			.transition()
			.attr("r", d.r)
			.attr("stroke", "rgba(0,0,0,.5)");
	}

	drag(simulation) {
		return d3.drag()
			.on("start", (d) => {
				if (!d3.event.active) simulation.alphaTarget(0.3).restart();
				d.fx = d.x;
				d.fy = d.y;
			})
			.on("drag", (d) => {
				d.fx = d3.event.x;
				d.fy = d3.event.y;
			})
			.on("end", (d) => {
				if (!d3.event.active) simulation.alphaTarget(0);
				d.fx = null;
				d.fy = null;
			});
	}

	render() {
		return (
			<div className="d3-canvas" ref="canvas" />
		);
	}
}
