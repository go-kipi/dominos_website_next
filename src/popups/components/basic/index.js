import React         from 'react';
import { Component } from 'react';
import { connect }   from 'react-redux';
import Actions       from 'redux/actions';
import styles from './index.module.scss';

class BasicPopup extends Component {

    constructor(props) {
        super(props);
        this.state = {
            animation_class: '',
        }
    }

    /* add class for animation after it is inserted into the DOM */
    componentDidMount() {
        this.animateIn();
    }

    animateIn = () => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                this.setState({animation_class: 'active'});
            })
        })
    }

    completeAnimation = () => {
        if(this.state.animation_class !== 'exit' && this.state.animation_class !== 'done') {
            this.setState({animation_class: 'done'});
        }
    }

    /* first remove the active class for exit animation then call the callback and remove the popup */
    animateOut = (callback) => {
        this.setState({animation_class: 'exit'});
        setTimeout(() => {
            if(callback) {
                callback();
            }
            this.props.removePopup();
        }, 200);
    }

    render() {
        let text = (this.props.payload && this.props.payload.text) ? this.props.payload.text : 'Undefined General Message Text';
        return (
            <div className = { `${styles['backdrop']} ${styles['general-msg']} ${styles[this.state.animation_class]}`}
                 onClick = { () => this.animateOut() }
                 onTransitionEnd = { this.completeAnimation }>
                <div className = {`${styles["popup_wrapper"]} ${styles[this.state.animation_class]}`} onClick = { (e) => e.stopPropagation() }>
                    <button className = {styles["x_close_icon"]} onClick = { () => this.animateOut() }></button>
                    <div className = {styles["popup_content"]} tabIndex={0}>
                        { text }
                    </div>
                    <button className={`${styles["button"]} ${styles['accept-btn']} ${styles["teal-button"]}`}
                            onClick = { () => this.animateOut() }>אישור</button>
                </div>
            </div>
        )
    }
}

//add GD categories and deviceState to props
const mapStateToProps = store => {
    return {
        deviceState: store.deviceState,
    }
}
//map a doLgin function to props
const mapDispatchToProps = dispatch => {
    return {
        addPopup: (payload) => dispatch(Actions.addPopup(payload)),
        removePopup: () => dispatch(Actions.removePopup()),
    }
}

//connect to redux store - maps dispatch and redux state to props
export default connect(mapStateToProps, mapDispatchToProps, null, { pure: false })(BasicPopup);
