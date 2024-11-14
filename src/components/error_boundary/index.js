import React from "react";
import { connect } from "react-redux";
import { withRouter } from "next/router";
import Button from "components/button";
import styles from "./index.module.scss";
import LogRocket from "logrocket";
import SRContent from "../accessibility/srcontent";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  componentDidCatch(error, errorInfo) {
    // Catch errors in any components below and re-render with error message

    LogRocket.captureException(error);

    this.setState({
      error,
      errorInfo,
    });
    // You can also log error messages to an error reporting service here
  }

  returnToHomePage() {
    window.location.href = "/";
  }

  render() {
    if (this.state.errorInfo || this.props.hasError) {
      // Error path
      return (
        <div className={styles["error-page-wrapper"]}>
          <h2 className={styles["title"]} role={"alert"} aria-live={"assertive"}>
            {this.props.translations.errorPage_title}
          </h2>
          <Button
            text={this.props.translations.errorPage_btn_text}
            onClick={this.returnToHomePage}
            animated={false}
          />
        </div>
      );
    }
    // Normally, just render children
    return this.props.children;
  }
}

const mapStateToProps = (store) => {
  return {
    translations: store.translations,
    hasError: store.hasError,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps, null, { pure: false })(
    ErrorBoundary
  )
);
