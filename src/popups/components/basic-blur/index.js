import React, { Component } from "react";
import { connect } from "react-redux";
import Actions from "redux/actions";
import styles from "./index.module.scss";

import BlurPopup from "../../Presets/BlurPopup";

class BasicBlurPopup extends Component {
	constructor(props) {
		super(props);
		this.ref = React.createRef();
	}

	render() {
		const text =
			this.props.payload && this.props.payload.text
				? this.props.payload.text
				: "Undefined General Message Text";

		return (
			<BlurPopup
				id={props.id}
				ref={this.ref}
				className={"general-blur"}
				showCloseIcon>
				{text}
			</BlurPopup>
		);
	}
}

// add GD categories and deviceState to props
const mapStateToProps = (store) => {
	return {
		deviceState: store.deviceState,
	};
};
// map a doLgin function to props
const mapDispatchToProps = (dispatch) => {
	return {
		addPopup: (payload) => dispatch(Actions.addPopup(payload)),
		removePopup: () => dispatch(Actions.removePopup()),
	};
};

// connect to redux store - maps dispatch and redux state to props
export default connect(mapStateToProps, mapDispatchToProps, null, {
	pure: false,
})(BasicBlurPopup);
