import React, { Component, Fragment } from "react";

import styles from "./index.module.scss";

class AutoComplete extends Component {
	constructor(props) {
		super(props);
		this.state = {
			open: false,
			highlighted_item: -1,
		};

		this.handleClick = this.handleClick.bind(this);
		this.handleClickOutside = this.handleClickOutside.bind(this);
		this.handleKeyUp = this.handleKeyUp.bind(this);
		this.handleOptionClick = this.handleOptionClick.bind(this);
	}

	handleClick(event) {
		//prevent form submission
		event.preventDefault();

		//fix for enter keyup event triggering click events - 0 = Enter key, 1 = click event
		if (!(event.detail === 0)) {
			let newState = !this.state.open;
			this.setState({ open: newState });
		}
	}

	handleClickOutside() {
		this.setState({ open: false });
	}

	handleKeyUp(event) {
		let highlighted_item = this.state.highlighted_item;
		let highlighted_option = document.getElementsByClassName("highlight");
		let selected_option_id = -1;

		if (highlighted_option.length > 0) {
			selected_option_id = highlighted_option[0].getAttribute("id");
		}

		switch (event.key) {
			case "ArrowDown":
				highlighted_item + 1 > this.props.options.length - 1
					? (highlighted_item = 0)
					: highlighted_item++;
				this.setState({ highlighted_item: highlighted_item });
				break;

			case "ArrowUp":
				highlighted_item - 1 < 0
					? (highlighted_item = this.props.options.length - 1)
					: highlighted_item--;
				this.setState({ highlighted_item: highlighted_item });
				break;

			case "Enter":
				if (this.state.open === false) {
					this.setState({ open: true });
				} else {
					let selected_item = this.props.options.find(
						(option) => option.id === parseInt(selected_option_id),
					);
					this.props.onSelect(selected_item.id, selected_item.text);
					this.setState({ open: false });
				}
				break;

			case "Escape":
				this.setState({ highlighted_item: 0, open: false });
				break;
			default:
				break;
		}
	}

	handleOptionClick(event) {
		event.stopPropagation();
		event.preventDefault();

		this.setState({ open: false });
		let selected_item = this.props.options.find((item) => {
			return item.id === parseInt(event.target.id);
		});
		this.props.onSelect(selected_item.id, selected_item.text);
	}

	getPartSpan(text, match, space = false) {
		let key = Math.floor(Math.random() * 1000);
		let component = null;

		if (space) {
			component = (
				<span
					className="part"
					key={key}>
					&nbsp;
				</span>
			);
		} else {
			component = (
				<span
					className={match ? "match" : "part"}
					key={key}>
					{text}
				</span>
			);
		}
		return component;
	}

	replaceSpaces(parts, text, match = false) {
		let space_index = text.indexOf(" ");
		if (space_index !== -1) {
			if (space_index === 0) {
				text = text.replace(/\s/g, "");
				parts.push(this.getPartSpan("", false, true));
				parts.push(this.getPartSpan(text, match));
			} else if (space_index === text.length - 1) {
				text = text.replace(/\s/g, "");
				parts.push(this.getPartSpan(text, match));
				parts.push(this.getPartSpan("", false, true));
			} else {
				parts.push(this.getPartSpan(text, match));
			}
		} else {
			parts.push(this.getPartSpan(text, match));
		}
	}

	render() {
		const {
			options,
			selected_id = -1,
			label = "",
			placeholder = "",
			query = "",
			disabled = false,
			className,
			tabIndex,
			onChange,
		} = this.props;

		let activeClass = this.state.open && options.length > 0 ? "active" : "";

		return (
			<Fragment>
				{label !== "" && <label> {label}:</label>}
				<div
					className={
						"auto_wrapper " +
						className +
						" " +
						activeClass +
						(disabled ? " disable" : "")
					}
					tabIndex={tabIndex}
					onBlur={this.handleClickOutside}
					onKeyUp={this.handleKeyUp}>
					<input
						className="auto_input"
						type="text"
						placeholder={placeholder}
						onClick={(e) => this.handleClick(e)}
						onChange={(e) => onChange(e)}
						value={query}
					/>

					<ul className="auto_menu">
						{options.map((item, index) => {
							let activeOption = "";
							let hightlightedOption = "";

							if (item.id === selected_id) {
								activeOption = "active";
							}

							if (index === this.state.highlighted_item) {
								hightlightedOption = " highlight";
							}

							let parts = item.text;

							if (query.length > 0) {
								let startIndex = item.text.indexOf(query);
								let endIndex = startIndex + query.length;
								let position = startIndex === -1 ? "none" : "middle";
								parts = [];

								if (startIndex === 0) {
									position = "start";
								} else if (endIndex === item.text.length) {
									position = "end";
								}

								switch (position) {
									case "start":
										this.replaceSpaces(parts, query, true);
										this.replaceSpaces(
											parts,
											item.text.substring(endIndex, item.text.length),
										);
										break;

									case "middle":
										this.replaceSpaces(parts, item.text.substring(0, startIndex));
										this.replaceSpaces(parts, query, true);
										this.replaceSpaces(
											parts,
											item.text.substring(endIndex, item.text.length),
										);
										break;

									case "end":
										this.replaceSpaces(parts, item.text.substring(0, startIndex));
										this.replaceSpaces(parts, query, true);
										break;

									default:
										parts.push(item.text);
								}
							}

							return (
								<li
									className={"auto_option " + activeOption + hightlightedOption}
									key={index}
									id={item.id}
									onMouseDown={this.handleOptionClick}>
									{parts}
								</li>
							);
						})}
					</ul>
				</div>
			</Fragment>
		);
	}
}
export default AutoComplete;
