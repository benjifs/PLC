import React from "react";
import { connect } from "react-redux";

import SearchedAnnotList from "./SearchAnnots";
import TagList from "./TagList";

import D3v5 from "../d3/v5";
import { fetchAnnots, fetchSearchedAnnots } from "../actions";

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

	onSearchSubmit(term) {
		this.props.fetchSearchedAnnots(term, this.state.max);
		this.setState({
			topic: term
		});
	}

	render() {
		let data;
		if (this.props.data && this.state.topic) {
			data = {
				"type": "root",
				"text": this.state.topic,
				"children": this.props.data
			}
		}
		return (
			<div className="dashboard">
				<div className="dashboard-container">
					<SearchedAnnotList
						onSubmit={this.onSearchSubmit} />
					<TagList
						tags={this.props.tags}
						onSubmit={this.onSearchSubmit} />
				</div>
				{data &&
					<D3v5
						data={data}
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
	if (state.searchedAnnots && state.searchedAnnots.length > 0) {
		state.searchedAnnots = groupBy(extractLink(state.searchedAnnots), "user");
		return {
			data: state.searchedAnnots
		}
	}
	if (state.annots && state.annots.length > 0) {
		state.annots = groupBy(extractLink(state.annots), "tags");
		return {
			tags: state.annots
		}
	}
	return {};
}

export default connect(mapStateToProps,
	{ fetchAnnots, fetchSearchedAnnots }
)(D3Page);
