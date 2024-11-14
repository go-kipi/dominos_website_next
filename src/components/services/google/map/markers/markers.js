import {Component} from 'react';

/*
props required:
data:{location: {lat: ,lng: }}

props (optional):
data:{ mapPin: {url: ,scaleSize: }}
constantlyUpdate: true || false default-->true
 */

import cluster from '/public/assets/icons/cluster.png';

// TODO: Refactor this to functional component.
class Markers extends Component {

    constructor(props) {
        super(props);

        this.allMarkers = [];
        this.my_map = window.my_map;
        this.setMarkers = this.setMarkers.bind(this);
        this.clusters = null;
    }

    UNSAFE_componentWillMount() {
        if(this.props.data.length > 0) {
            this.setMarkers();
        }
        else{
            this.my_map.setCenter({lat: 32.062510,lng: 34.778832});
            this.my_map.setZoom(15);
        }

        this.my_map.addListener('click',()=>{
            this.props.handleMapOnClick();
        })
    }

    componentDidUpdate(prevProps){

        if(this.props.constantlyUpdate || (prevProps.data.length !== this.props.data.length)) {
            this.clearMarkers();
            this.setMarkers();
        }
    }

    componentWillUnmount(){
        this.clearMarkers();
    }

    setMarkers() {
        const {selected = false} = this.props;
        let bounds = new window.google.maps.LatLngBounds();

        this.props.data.forEach(item => {
            let marker = new window.google.maps.Marker();

            //check for custom pin image
            if (item.hasOwnProperty('mapPin'))
                marker.setIcon(item.mapPin);

            // marker initialization
            marker.setPosition(item.location);
            marker.setMap(this.my_map);

            marker.addListener('click', () => {
                this.handleMarkerOnClick(marker);
                item.handlePinOnClick(marker);
            });


            //if no selected marker so the Bounds will center all the markers
            if (this.props.data.length > 1 && (selected === false)) {
                bounds.extend(marker.getPosition());
            }

            //in case of selected marker only he will be Bounded
            else if (selected!== false  && selected > -1){
                if (selected === item.id){
                    bounds.extend(marker.getPosition());
                }
            }

            //in case of only one marker, he will be in the center and a bit zoomed out
            else {
                this.my_map.setCenter(marker.getPosition());
                this.my_map.setZoom(18);
            }

            //save markers reference
            this.allMarkers.push(marker);
        });

        //in case of more the one marker, add bounds to map
        if (this.props.data.length > 1){
            this.my_map.fitBounds(bounds);
            this.my_map.getZoom() > 16 ? this.my_map.setZoom(16) : this.my_map.getZoom();
        }

        //clusters initialization
        if(window.MarkerClusterer){
            this.clusters = new window.MarkerClusterer(this.my_map, this.allMarkers, {styles: [{url:cluster, height:63, width:63}], maxZoom:18});
        }
    }

    //first clears clusters than markers
    clearMarkers(){
        if(this.clusters !== null) {
            this.clusters.setMap(null);
        }
        this.allMarkers.forEach(item =>{
            item.setMap(null);
        });
        this.allMarkers = [];
    }


    handleMarkerOnClick(marker) {
        this.my_map.panTo(marker.getPosition());
        setTimeout(() => {
            this.my_map.setZoom(18);
        }, 1000);
    }


    render() {
        return false;
    }
}

export default Markers;