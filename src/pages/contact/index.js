import React from "react";
import { Component } from "react";
import { connect } from "react-redux";
import Validate from "utils/validation";

//components
import AnimatedInput from "components/forms/animated_input";
import AnimatedTextArea from "components/forms/animated_textarea";
import AutoComplete from "components/forms/autocomplete/new";

//actions
import Actions from "redux/actions";

//assets
import styles from "./index.module.scss";

class Contact extends Component {
	constructor(props) {
		super(props);

		this.state = {
			first_try: true,
			form: {
				full_name: {
					valid: false,
					rules: ["full_name", "not_empty"],
					errMsg: "",
				},
				phone: {
					valid: false,
					rules: ["phone", "not_empty"],
					errMsg: "",
				},
				email: {
					valid: false,
					rules: ["email", "not_empty"],
					errMsg: "",
				},
				message: {
					valid: false,
					rules: ["not_empty"],
					errMsg: "",
				},
				cities: {
					id: "",
					valid: false,
					rules: [this.validateAutocomplete],
					errMsg: "",
				},
			},
		};
	}

	handleInputChange = (e) => {
		let name = e.target.name;
		let val = e.target.value;
		let validationObj = Validate(val, this.state.form[name].rules);

		let new_state = { ...this.state };
		new_state.form[name].valid = validationObj.valid;
		new_state.form[name].errMsg = validationObj.msg;

		this.setState(new_state);
		this.props.updateForm({ [name]: val });
	};

	handleAutocompleteSelection = (payload) => {
		this.props.updateForm({ cities: payload });
	};

	validateAutocomplete = (val) => {
		return { valid: false, msg: "sdfsdf" };
	};

	handleSubmit = (e) => {
		e.preventDefault();

		let form_valid = true;
		let new_state = { ...this.state.form };
		let validationObj;

		for (let field in this.state.form) {
			validationObj = Validate(
				this.props.Form[field],
				this.state.form[field].rules,
			);

			new_state[field].valid = validationObj.valid;
			new_state[field].errMsg = validationObj.msg;

			if (!validationObj.valid) {
				form_valid = false;
			}
		}

		this.setState({ form: new_state, first_try: false });

		if (form_valid) {
		}
	};

	showError = (field) => {
		return !this.state.first_try && !this.state.form[field].valid;
	};

	render() {
		const Form = this.props.Form;

		return (
			<section className={styles["contact-page-wrapper"]}>
				<div className={styles["form-wrapper"]}>
					<form name={styles["contact-form"]}>
						<AnimatedInput
							className={styles["field"]}
							value={Form.full_name}
							name={"full_name"}
							placeholder={"שם"}
							disable_autocomplete={true}
							onChange={this.handleInputChange}
							showError={this.showError("full_name")}
							errorMessage={this.state.form.full_name.errMsg}
						/>
						<AnimatedInput
							className={styles["field"]}
							value={Form.phone}
							name={"phone"}
							placeholder={"טלפון נייד"}
							disable_autocomplete={false}
							onChange={this.handleInputChange}
							showError={this.showError("phone")}
							errorMessage={this.state.form.phone.errMsg}
						/>
						<AnimatedTextArea
							className={styles["field"]}
							name="message"
							value={Form.message}
							placeholder={"סיבת הפנייה"}
							onChange={this.handleInputChange}
							showError={this.showError("message")}
							errorMessage={this.state.form.message.errMsg}
						/>
						<AutoComplete
							className={styles["field"]}
							name="cities"
							placeholder={"בחר עיר"}
							onChange={this.handleInputChange}
							onSelect={this.handleAutocompleteSelection}
							options={CityOptions}
						/>
						<button
							type="submit"
							onClick={this.handleSubmit}
							className="submit-btn teal-button">
							שלח
						</button>
					</form>
				</div>
			</section>
		);
	}
}

//connect to redux store
const mapStateToProps = (store) => {
	return {
		deviceState: store.deviceState,
		Form: store.contactForm,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		updateForm: (payload) => dispatch(Actions.updateContactForm(payload)),
	};
};

export default connect(mapStateToProps, mapDispatchToProps, null, {
	pure: false,
})(Contact);

const CityOptions = [
	{ text: "תל אביב", id: 0, payload: { id: 41 } },
	{ text: "הרצליה", id: 1, payload: { id: 47 } },
	{ text: "יבנה", id: 2, payload: { id: 23 } },
	{ text: "כפר סבא", id: 3, payload: { id: 12 } },
];
