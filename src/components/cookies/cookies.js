import React, {Component} from 'react';
import { connect }        from 'react-redux';

//css
import './cookies.scss';

class Cookies extends Component {


    setCookie(cname, cvalue) {
        var d = new Date();
        d.setTime(d.getTime() + (365*24*60*60*1000));
        var expires = "expires="+d.toUTCString();
        document.cookie = cname + "=" + cvalue + ';' + expires +";domain=" + window.location.hostname + ";path=/;";
        this.forceUpdate();
    }


    getCookie(cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for(var i = 0; i <ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    render() {

        let cookie = this.getCookie("ten_cookies_accepted");
        let show_msg = false;

        if (cookie !== 'true') {
            show_msg = true;
        }

        return (
            <div className="cookies_container">
                { show_msg &&
                    <div className="cookies_layer">
                        <div className="msg">{ this.props.text.web_cookies_msg }</div>
                        <button className="accept"
                                onClick={ () => this.setCookie('ten_cookies_accepted', true)}>
                            { this.props.text.web_cookies_btn }
                        </button>
                    </div>
                }
            </div>
        );
    }
}
//get required state from redux store and map them to the components props
const mapStateToProps = store => {
    return {
        text: store.config.Translations,
    }
}

export default connect(mapStateToProps, null, null, { pure: false })(Cookies);