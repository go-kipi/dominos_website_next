import React, { Component } from 'react';

/* define map on window object for global access */
window.my_map = null;

class Map extends Component {
    constructor(props) {
        super(props);
        this.onScriptLoad = this.onScriptLoad.bind(this)
    }

    onScriptLoad() {
        window.my_map = new window.google.maps.Map(
            document.getElementById(this.props.id),
            {
                ...this.props.options,
                zoomControlOptions: {
                    position: window.google.maps.ControlPosition.LEFT_TOP
                },
                mapTypeId: window.google.maps.MapTypeId.ROADMAP,
                navigationControlOptions: {
                    style: window.google.maps.NavigationControlStyle.ZOOM_PAN
                }
            });
        this.props.onMapLoad(true);
    }

    componentDidMount() {
        if (!window.google) {
            var s = document.createElement('script');
            s.type = 'text/javascript';
            s.src = 'https://maps.google.com/maps/api/js?key=' + this.props.apiKey + '&libraries=geometry&language=he&region=IL';
            var x = document.getElementsByTagName('script')[0];
            x.parentNode.insertBefore(s, x);

            /* listen for google map script load event */
            s.addEventListener('load', e => {
                this.onScriptLoad();
            });
        }
    }

    render() {
        return (
            <div id={this.props.id} className={this.props.className}/>
        );
    }
}

export default Map
