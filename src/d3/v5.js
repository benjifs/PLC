
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

		let link, node;

		const simulation = d3.forceSimulation(nodes)
			.force("link", d3.forceLink(links).id(d => d.id).distance(0).strength(1))
			.force("charge", d3.forceManyBody().strength(-50))
			.force("x", d3.forceX())
			.force("y", d3.forceY())
			.on("tick", () => {
				link
					.attr("x1", d => d.source.x)
					.attr("y1", d => d.source.y)
					.attr("x2", d => d.target.x)
					.attr("y2", d => d.target.y);

				node
					.attr("cx", d => d.x)
					.attr("cy", d => d.y);
			});

		const svg = d3.select(this.refs.canvas).append("svg")
			.attr("viewBox", [-this.width / 2, -this.height / 2, this.width, this.height]);

		let update = () => {
			link = svg.append("g")
				.attr("stroke", "#999")
				.attr("stroke-opacity", 0.6)
				.selectAll("line")
				.data(links)
				.join("line");

			node = svg.append("g")
				.attr("fill", "#fff")
				.attr("stroke", "#000")
				.attr("stroke-width", 1.5)
				.selectAll("circle")
				.data(nodes)
				.join("circle")
				.attr("fill", d => d.children ? null : "#000")
				.attr("stroke", d => d.children ? null : "#fff")
				.attr("r", 3.5)
				.call(this.drag(simulation))
			// .on("click", (d) => {
			// 	// if (!d3.event.defaultPrevented) {
			// 	// 	if (d.children) {
			// 	// 		d._children = d.children;
			// 	// 		d.children = null;
			// 	// 	} else {
			// 	// 		d.children = d._children;
			// 	// 		d._children = null;
			// 	// 	}
			// 	// 	update();
			// 	// }
			// });

			node.append("title")
				.text(d => d.data.name);
		}

		update();
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
