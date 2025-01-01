import { useSelector } from "react-redux";
import { useEffect } from "react";
import { LocationService } from "services/LocationService";

export default function useUserLocation(setCenter) {
	const defaultLocation = useSelector((store) => store.defaultLocation);
	const location = { lat: defaultLocation?.lat, lng: defaultLocation?.lng };

	useEffect(() => {
		LocationService.getUserGeoLocation(onDecline, onDecline);
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

		// dispatch(Actions.setCurrentLocation(currentPositionLocation));
	}

	return [location, setLoaction, false];
}
