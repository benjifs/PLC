import React from "react";
import { connect } from "react-redux";

import D3v5 from "../d3/v5";
import { fetchSearchedAnnots } from "../actions";

class D3Page extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			topic: "technology",
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
					{this.props.data && this.props.data.length &&
						<D3v5
							data={{
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

const groupBy = (arr, key) => {
	let obj = arr.reduce((data, item) => {
		data[item[key]] = data[item[key]] || [];
		data[item[key]].push(item);
		return data;
	}, {});

	return Object.keys(obj).map((key) => {
		return {
			"name": key,
			"children": obj[key]
		}
	});
}

const mapStateToProps = (state) => {
	if (state.searchedAnnots) {
		state.searchedAnnots = groupBy(state.searchedAnnots, "user");
		return {
			data: state.searchedAnnots
		}
	}
	return null;
}

export default connect(mapStateToProps,
	{ fetchSearchedAnnots }
)(D3Page);
