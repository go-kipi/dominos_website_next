import React, { Component } from "react";

class Recaptcha extends Component {
	constructor(props) {
		super(props);
		this.onScriptLoad = this.onScriptLoad.bind(this);
	}

	onScriptLoad() {
		window.grecaptcha.ready(() => {
			this.props.onReady();
		});
	}

	componentDidMount() {
		var s = document.createElement("script");
		s.type = "text/javascript";
		s.id = "recaptcha_script";
		s.src =
			"https://www.google.com/recaptcha/api.js?render=" + this.props.sitekey;
		s.setAttribute("crossorigin", "anonymous");
		var x = document.getElementById(this.props.div_id);
		x.appendChild(s);

		/* listen for google recaptcha script load event */
		s.addEventListener("load", (e) => {
			this.onScriptLoad();
		});
	}

	render() {
		return <div id={this.props.id} />;
	}
}

export default Recaptcha;
