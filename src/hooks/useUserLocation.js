import Actions from "redux/actions";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { GPS_STATUS } from "constants/gps-status";
import { LocationService } from "services/LocationService";

export default function useUserLocation(setCenter) {
	const currentLocation = useSelector((store) => store.userData.currentLocation);
	const defaultLocation = useSelector((store) => store.defaultLocation);
	const dispatch = useDispatch();
	const [haveLocationPermission, setHaveLocationPermission] = useState(false);
	const location = currentLocation
		? { lat: currentLocation?.lat, lng: currentLocation?.lng }
		: { lat: defaultLocation?.lat, lng: defaultLocation?.lng };

	useEffect(() => {
		const onSuccessHandler = (response) => {
			setHaveLocationPermission(true);
			setLoaction(response?.coords?.latitude, response?.coords?.longitude);
			LocationService.setGpsStatus(GPS_STATUS.ON);
		};
		LocationService.getUserGeoLocation(onSuccessHandler, onDecline);
	}, []);

	function onDecline(err) {
		setLoaction(defaultLocation.lat, defaultLocation.lng);
	}

	function setLoaction(latitude, longitude) {
		const currentPositionLocation = {
			lat: latitude,
			lng: longitude,
		};
		setCenter(currentPositionLocation);

		dispatch(Actions.setCurrentLocation(currentPositionLocation));
	}

	return [location, setLoaction, haveLocationPermission];
}
