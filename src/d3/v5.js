
import React from "react";
import * as d3 from "d3";

import "./v5.css";

export default class extends React.Component {
	componentDidMount() {
		let id = 0;
		const height = 400;
		const width = 600;
		const root = d3.hierarchy(this.props.data);

		let graph = d3.tree()
			.size([360, 120])
			.separation(function (a, b) {
				return (a.parent == b.parent ? 1 : 2) / a.depth;
			});

		// Close all nodes other than root
		root.children.map((item, i) => {
			item._children = item.children;
			item.children = null
			return item;
		});

		let links = root.links();
		let nodes = root.descendants();

		d3.select("body")
			.append("div")
			.attr("class", "d3-tooltip")
			.style("opacity", 0);

		const zoom = d3.zoom()
			.on("zoom", function () {
				container.attr("transform", d3.event.transform);

				d3.select(".d3-tooltip")
					.transition()
					.duration(200)
					.style("opacity", 0)
					.attr("data-id", "");
			});

		const svg = d3.select(this.refs.canvas).append("svg")
			.attr("viewBox", [-width / 2, -height / 2, width, height])
			.attr("height", "100%")
			.call(zoom);

		const container = svg.append("g")
			.attr("class", "container");

		let s_links = container.select(".links");
		if (s_links.empty()) {
			s_links = container.append("g").attr("class", "links");
		}

		let s_nodes = container.select(".nodes");
		if (s_nodes.empty()) {
			s_nodes = container.append("g").attr("class", "nodes");
		}

		let update = (position) => {
			graph(root);

			links = root.links();
			nodes = root.descendants();

			nodes.forEach((n) => {
				let pos = this.getChildPosition(n);
				n.y = 180 * n.depth + pos;
				n.pos = this.toRadial(n.x, n.y);
			});

			let link = s_links.selectAll(".link")
				.data(links, d => d.target.id);

			let linkEnter = link.enter();
			let linkExit = link.exit();

			linkEnter
				.append("path")
				.attr("class", "link")
				.attr("fill", "none")
				.attr("stroke", "rgba(20,20,20,0.2)")
				.attr("stroke-width", 1)
				.attr("opacity", 0)
				.attr("d", function (e) {
					var pos = {
						x: position[0],
						y: position[1]
					};
					let createPathD = (source, target) => {
						return "M" + source.x + "," + source.y +
							"C" + (source.x + target.x) / 2 + "," + source.y + " " +
							(source.x + target.x) / 2 + "," + target.y + " " +
							target.x + "," + target.y;
					}
					return createPathD(pos, pos);
				}).merge(link)
				.transition().duration(600)
				.attr("opacity", 1)
				.attr("d", function (t) {
					var source = {
						x: t.source.pos[0],
						y: t.source.pos[1]
					},
						target = {
							x: t.target.pos[0],
							y: t.target.pos[1]
						};
					return "M" + source.x + "," + source.y + "L" + target.x + "," + target.y
				});

			linkExit.transition().duration(600)
				.attr("opacity", 0)
				.attr("d", function (e) {
					var source = {
						x: position[0],
						y: position[1]
					},
						target = {
							x: position[0],
							y: position[1]
						};
					return "M" + source.x + "," + source.y + "L" + target.x + "," + target.y
				})
				.remove();

			let nodeIds = s_nodes.selectAll(".node")
				.data(nodes, d => d.id = d.id || id++);

			let nodeExit = nodeIds.exit();
			let nodeEnter = nodeIds.enter();

			let node = nodeEnter
				.append("g")
				.attr("id", d => "node_" + d.id)
				.attr("class", "node")
				.style("cursor", "pointer")
				.attr("transform", function () {
					return "translate(" + position[0] + "," + position[1] + ")";
				})
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
						update(d.prevPos);
					}
				});

			node
				.append("circle")
				.attr("id", d => (d.leafUid = "leaf_" + Math.random().toString(36).substr(2, 9)))
				.attr("class", "node_circle")
				.attr("fill", this.color)
				.attr("stroke", "rgba(0,0,0,.5)")
				.attr("stroke-width", 1.5)
				.attr("r", d => (d.r = d.children || d._children ? 20 : 15));

			node
				.append("clipPath")
				.attr("id", d => (d.clipUid = "clip_" + Math.random().toString(36).substr(2, 9)))
				.append("use")
				.attr("xlink:href", d => window.location.href + "#" + d.leafUid);

			node
				.append("text")
				.attr("clip-path", d => "url(" + window.location.href + "#" + d.clipUid + ")")
				.attr("font-size", (d) => {
					let data = d.data && d.data.text ? d.data.text : null;
					if (data) {
						data = data.split(" ");
						if (data.length == 1) {
							let length = data[0].length;
							return length < 5 ? "10" : (d.length < 8 ? "8" : "5");
						}
					}
					return "5";
				})
				.selectAll("tspan")
				.data(function (d) {
					let data = d.data && d.data.text ? d.data.text : "";
					if (data) {
						data = data.split(" ");
						if (data.length > 5) {
							data = data.splice(0, 5);
							data[4] = data[4] + "…";
						}
					}
					return data;
				})
				.join("tspan")
				.attr("text-anchor", "middle")
				.attr("x", 0)
				.attr("y", (d, i, nodes) => `${i - nodes.length / 2 + 0.8}em`)
				.text(d => d);

			let animation = node.merge(nodeIds).transition().duration(600).attr("transform", function (d) {
				return "translate(" + d.pos[0] + "," + d.pos[1] + ")";
			});
			animation.select("circle").style("opacity", 1).attr("r", 20);
			let animationExit = nodeExit.transition().duration(600).attr("transform", (node) => {
				return "translate(" + position[0] + "," + position[1] + ")"
			});
			animationExit.select("circle").style("opacity", 0).attr("r", 0);

			nodes.forEach(function (d) {
				d.prevPos = [d.pos[0], d.pos[1]]
			});
		}

		update([0, 0]);
	}

	getChildPosition(child) {
		if (!child.parent) {
			return 0;
		}

		let childPos = 0;
		let children = child.parent.children;

		for (let i in children) {
			if (children[i] == child) {
				childPos = i;
				break;
			}
		}

		return childPos / children.length * 25;
	}

	toRadial(x, y) {
		const angle = (x - 90) / 180 * Math.PI;
		return [y * Math.cos(angle), y * Math.sin(angle)];
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

	mouseover(d) {
		d3.select(this).select("circle")
			.transition()
			.attr("r", d.r + 2)
			.attr("stroke", "#000");

		let tooltip = d3.select(".d3-tooltip");
		if (d && d.data.tooltip) {
			if (tooltip.attr("data-id") == d.id) {
				return;
			}
			tooltip
				.transition()
				.duration(200)
				.style("opacity", .9)
				.attr("data-id", d.id);

			tooltip
				.html(d.data.tooltip)
				.style("left", (d3.event.pageX + 10) + "px")
				.style("top", (d3.event.pageY - 28) + "px");
		} else {
			tooltip
				.transition()
				.duration(200)
				.style("opacity", 0)
				.attr("data-id", "");
		}
	}

	mouseout(d) {
		d3.select(this).select("circle")
			.transition()
			.attr("r", d.r)
			.attr("stroke", "rgba(0,0,0,.5)");

		let tooltip = d3.select(".d3-tooltip");
		if (d && d.data.tooltip && tooltip.attr("data-id") == d.id) {
			return;
		}
		tooltip
			.transition()
			.duration(200)
			.style("opacity", 0)
			.attr("data-id", "");
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
