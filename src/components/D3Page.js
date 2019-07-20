import React from "react";
import { connect } from "react-redux";

import SearchedAnnotList from "./SearchAnnots";
import TagList from "./TagList";

import D3v5 from "../d3/v5";
import { fetchAnnots, fetchSearchedAnnots } from "../actions";

import "../css/D3Page.css";

class D3Page extends React.Component {
	constructor(props) {
		super(props);

		let user;
		let topic = "IndieWeb";
		if (this.props.match && this.props.match.params) {
			if (this.props.match.params.topic) {
				user = null;
				topic = this.props.match.params.topic;
			} else if (this.props.match.params.user) {
				user = this.props.match.params.user;
				topic = null;
			}
		}

		this.state = {
			topic: topic,
			user: user,
			max: 50
		}

		this.onSearchSubmit = this.onSearchSubmit.bind(this);
	}

	componentDidMount() {
		if (this.state.topic) {
			this.props.fetchSearchedAnnots(this.state.topic, this.state.max);
		} else if (this.state.user) {
			this.props.fetchAnnots(this.state.user, this.state.max);
		}
	}

	onSearchSubmit(topic) {
		if (topic == this.state.topic) {
			return;
		}
		this.props.fetchSearchedAnnots(topic, this.state.max);
		this.setState({ topic: topic });
	}

	render() {
		return (
			<div className="d3-dashboard">
				<div className="d3-dashboard-container">
					<SearchedAnnotList
						onSubmit={this.onSearchSubmit} />
					<TagList
						selected={this.state.topic}
						tags={this.props.tags || this.state.tags}
						onSubmit={this.onSearchSubmit} />
				</div>
				{this.props.data && this.state.topic &&
					<D3v5
						query={this.state.topic}
						data={{
							"type": "root",
							"text": this.state.topic,
							"children": this.props.data
						}}
					/>
				}
			</div >
		);
	}
}

const extractLink = (arr) => {
	return arr.map((item, i) => {
		item.tooltip = item.text;
		if (item.target && item.target.length === 1) {
			item.children = [
				{
					"text": "www",
					"type": "link",
					"href": item.target[0].source
				}
			]
		}
		return item;
	});
}

const groupBy = (arr, key) => {
	let obj = arr.reduce((data, item) => {
		if (Array.isArray(item[key])) {
			let keys = item[key];
			for (let i in keys) {
				data[keys[i]] = data[keys[i]] || [];
				data[keys[i]].push(item);
			}
		} else {
			data[item[key]] = data[item[key]] || [];
			data[item[key]].push(item);
		}
		return data;
	}, {});

	return Object.keys(obj).map((key) => {
		return {
			"text": formatName(key),
			"type": "user",
			"children": obj[key],
			"count": obj[key].length
		}
	});
}

const formatName = (name) => {
	if (/acct:[a-zA-Z0-9_.]+@[a-zA-Z0-9.]+/.test(name)) {
		return name.substring(name.indexOf(":") + 1, name.indexOf("@"));
	}
	return name;
}

const mapStateToProps = (state) => {
	let props = {};
	if (state.searchedAnnots && state.searchedAnnots.length > 0) {
		props.data = groupBy(extractLink(state.searchedAnnots), "user");
	}
	if (state.annots && state.annots.length > 0) {
		props.tags = groupBy(extractLink(state.annots), "tags");
	}
	return props;
}

export default connect(mapStateToProps,
	{ fetchAnnots, fetchSearchedAnnots }
)(D3Page);
