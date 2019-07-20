
import React from "react";

import "../css/TagList.css";

export default class extends React.Component {
	render() {
		if (typeof this.props.tags === "undefined") {
			return null;
		}
		return (
			<div className="tag-list">
				<div className="list-container">
					{this.props.tags && this.props.tags.length === 0 &&
						<div>No results found</div>
					}
					{this.props.tags && this.props.tags.length > 0 &&
						this.props.tags.map((tag, i) => {
							return (
								<div className="ui horizontal list" key={i}>
									<p
										className={
											"item tag-item" +
											(this.props.selected == tag.text ? " selected" : "")
										}
										onClick={() => {
											this.props.onSubmit && this.props.onSubmit(tag.text);
										}}
									>{tag.text} &nbsp; {tag.count}</p>
								</div>
							);
						})
					}
				</div>
			</div>
		);
	}
}
