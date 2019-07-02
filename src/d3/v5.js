
import React from "react";
import * as d3 from "d3";

export default class extends React.Component {
	componentDidMount() {
		let id = 0;
		const height = 400;
		const width = 600;
		const root = d3.hierarchy(this.props.data);

		// Close all nodes other than root
		// root.children.map((item, i) => {
		// 	item._children = item.children;
		// 	item.children = null
		// 	return item;
		// });

		let links = root.links();
		let nodes = root.descendants();

		const simulation = d3.forceSimulation(nodes)
			.force("link", d3.forceLink(links).id(d => d.id).distance(42).strength(1))
			.force("charge", d3.forceManyBody().strength(-500))
			.force("collide", d3.forceCollide().radius(d => 5))
			.force("x", d3.forceX())
			.force("y", d3.forceY());

		const zoom = d3.zoom()
			.on("zoom", () => {
				container.attr("transform", d3.event.transform);
			});

		const svg = d3.select(this.refs.canvas).append("svg")
			.attr("viewBox", [-width / 2, -height / 2, width, height])
			.call(zoom);

		const container = svg.append("g")
			.attr("class", "container");

		let update = () => {
			links = root.links();
			nodes = root.descendants();

			let link = container.selectAll("line")
				.data(links, d => id++);

			link
				.exit()
				.remove();

			let linkEnter = link
				.enter()
				.append("line")
				.attr("class", "link")
				.attr("stroke", "#999")
				.attr("stroke-opacity", 0.6);

			link = linkEnter.merge(link);

			let node = container.selectAll(".node")
				.data(nodes, d => id++);

			node
				.exit()
				.remove();

			let nodeEnter = node.enter()
				.append("g")
				.attr("id", d => "node_" + (d.data.name || Math.floor(Math.random() * 1000)))
				.attr("class", "node")
				.style("cursor", "pointer")
				.on("mouseover", this.mouseover)
				.on("mouseout", this.mouseout)
				.on("click", (d) => {
					if (!d3.event.defaultPrevented) {
						if (d.data.type == "link") {
							return window.open(d.data.href, "_blank");
						}
						if (d.children) {
							d._children = d.children;
							d.children = null;
						} else {
							d.children = d._children;
							d._children = null;
						}
						update();
					}
				});

			nodeEnter
				.append("circle")
				.attr("id", d => (d.leafUid = "leaf_" + Math.random().toString(36).substr(2, 9)))
				.attr("class", "node_circle")
				.attr("fill", this.color)
				.attr("stroke", "rgba(0,0,0,.5)")
				.attr("stroke-width", 1.5)
				.attr("r", d => (d.r = d.children || d._children ? 20 : 15))
				.call(this.drag(simulation))

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

			node = nodeEnter.merge(node);

			simulation
				.on("tick", () => {
					link
						.attr("x1", d => d.source.x)
						.attr("y1", d => d.source.y)
						.attr("x2", d => d.target.x)
						.attr("y2", d => d.target.y);

					nodeEnter
						.attr("transform", d => "translate(" + d.x + "," + d.y + ")");
				});
		}

		update();
	}

	color(d) {
		if (d.data.type == "root") {
			return d.children ? "#f3a6b3" : "#ed798d";
		} else if (d.data.type == "user") {
			return d.children ? "#b1ddfa" : "#69BDF6";
		} else if (d.children) {
			return "#99e6c8";
		} else if (d._children) {
			return "#5cd7a7";
		} else {
			return "#FED776";
		}
	}

	mouseover(d, i) {
		d3.select(this).select("circle")
			.transition()
			.attr("r", d.r + 2)
			.attr("stroke", "#000");
	}

	mouseout(d, i) {
		d3.select(this).select("circle")
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
