import React from "react";
import { connect } from "react-redux";

import D3v5 from "../d3/v5";
import { fetchSearchedAnnots } from "../actions";

class D3Page extends React.Component {
	constructor(props) {
		super(props);

		let topic = "IndieWeb";
		if (this.props.match && this.props.match.params && this.props.match.params.topic) {
			topic = this.props.match.params.topic;
		}

		this.state = {
			topic: topic,
			max: 50
		}
	}

	componentDidMount() {
		this.props.fetchSearchedAnnots(this.state.topic, this.state.max);
	}

	render() {
		return (
			<div className="ui container">
				<div className="root-text">
					<h3 className="content-container content">Made it!</h3>
					{this.props.data && this.props.data.length > 0 &&
						<D3v5
							data={{
								"type": "root",
								"name": this.state.topic,
								"children": this.props.data
							}}
						/>
					}
				</div>
			</div>
		);
	}
}

const extractLink = (arr) => {
	return arr.map((item, i) => {
		if (item.target && item.target.length == 1) {
			item.children = [
				{
					"name": "www",
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
		data[item[key]] = data[item[key]] || [];
		data[item[key]].push(item);
		return data;
	}, {});

	return Object.keys(obj).map((key) => {
		return {
			"name": formatName(key),
			"type": "user",
			"children": obj[key]
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
	if (state.searchedAnnots) {
		state.searchedAnnots = groupBy(extractLink(state.searchedAnnots), "user");
		return {
			data: state.searchedAnnots
		}
	}
	return null;
}

export default connect(mapStateToProps,
	{ fetchSearchedAnnots }
)(D3Page);
