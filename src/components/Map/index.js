import React, { useEffect, useRef, useState } from "react";
import basic from "./index.module.scss";
import GoogleMap from "google-map-react";
import CurrentLocation from "/public/assets/icons/back-to-current-location.svg";
import UserIndicator from "./components/UserIndicator";
import { useSelector } from "react-redux";
import LanguageDirectionService from "services/LanguageDirectionService";
import { LANGUAGES } from "constants/Languages";
import useTranslate from "../../hooks/useTranslate";

const mapStyle = [
	{
		featureType: "administrative",
		elementType: "geometry",
		stylers: [
			{
				visibility: "off",
			},
		],
	},
	{
		featureType: "poi",
		stylers: [
			{
				visibility: "off",
			},
		],
	},
	{
		featureType: "road",
		elementType: "labels.icon",
		stylers: [
			{
				visibility: "off",
			},
		],
	},
	{
		featureType: "transit",
		stylers: [
			{
				visibility: "off",
			},
		],
	},
];

const darkMapStyle = [
	{
		elementType: "geometry",
		stylers: [
			{
				color: "#212121",
			},
		],
	},
	{
		elementType: "labels.icon",
		stylers: [
			{
				visibility: "off",
			},
		],
	},
	{
		elementType: "labels.text.fill",
		stylers: [
			{
				color: "#757575",
			},
		],
	},
	{
		elementType: "labels.text.stroke",
		stylers: [
			{
				color: "#212121",
			},
		],
	},
	{
		featureType: "administrative",
		elementType: "geometry",
		stylers: [
			{
				color: "#757575",
			},
			{
				visibility: "off",
			},
		],
	},
	{
		featureType: "administrative.country",
		elementType: "labels.text.fill",
		stylers: [
			{
				color: "#9e9e9e",
			},
		],
	},
	{
		featureType: "administrative.land_parcel",
		elementType: "labels",
		stylers: [
			{
				visibility: "off",
			},
		],
	},
	{
		featureType: "administrative.locality",
		elementType: "labels.text.fill",
		stylers: [
			{
				color: "#bdbdbd",
			},
		],
	},
	{
		featureType: "poi",
		stylers: [
			{
				visibility: "off",
			},
		],
	},
	{
		featureType: "poi",
		elementType: "labels.text",
		stylers: [
			{
				visibility: "off",
			},
		],
	},
	{
		featureType: "poi",
		elementType: "labels.text.fill",
		stylers: [
			{
				color: "#757575",
			},
		],
	},
	{
		featureType: "poi.park",
		elementType: "geometry",
		stylers: [
			{
				color: "#181818",
			},
		],
	},
	{
		featureType: "poi.park",
		elementType: "labels.text.fill",
		stylers: [
			{
				color: "#616161",
			},
		],
	},
	{
		featureType: "poi.park",
		elementType: "labels.text.stroke",
		stylers: [
			{
				color: "#1b1b1b",
			},
		],
	},
	{
		featureType: "road",
		elementType: "geometry.fill",
		stylers: [
			{
				color: "#2c2c2c",
			},
		],
	},
	{
		featureType: "road",
		elementType: "labels.icon",
		stylers: [
			{
				visibility: "off",
			},
		],
	},
	{
		featureType: "road",
		elementType: "labels.text.fill",
		stylers: [
			{
				color: "#8a8a8a",
			},
		],
	},
	{
		featureType: "road.arterial",
		elementType: "geometry",
		stylers: [
			{
				color: "#373737",
			},
		],
	},
	{
		featureType: "road.highway",
		elementType: "geometry",
		stylers: [
			{
				color: "#3c3c3c",
			},
		],
	},
	{
		featureType: "road.highway.controlled_access",
		elementType: "geometry",
		stylers: [
			{
				color: "#4e4e4e",
			},
		],
	},
	{
		featureType: "road.local",
		elementType: "labels",
		stylers: [
			{
				visibility: "off",
			},
		],
	},
	{
		featureType: "road.local",
		elementType: "labels.text.fill",
		stylers: [
			{
				color: "#616161",
			},
		],
	},
	{
		featureType: "transit",
		stylers: [
			{
				visibility: "off",
			},
		],
	},
	{
		featureType: "transit",
		elementType: "labels.text.fill",
		stylers: [
			{
				color: "#757575",
			},
		],
	},
	{
		featureType: "water",
		elementType: "geometry",
		stylers: [
			{
				color: "#000000",
			},
		],
	},
	{
		featureType: "water",
		elementType: "labels.text.fill",
		stylers: [
			{
				color: "#3d3d3d",
			},
		],
	},
];

const MapRef = (props, ref) => {
	const {
		children,
		google,
		zoom,
		userLocation,
		defaultZoom,
		center = {},
		options = {},
		onClick = () => {},
		onChange = () => {},
		onGoogleApiLoaded = (maps) => {},
		onBackToLocation = () => {},
		className = "",
		showBackToLocation = true,
		hideOnCenter = false,
		isDark = false,
		elementToAvoid,
		avoidingCondition = false,
		extraStyles = {},
		onDrag = () => {},
	} = props;
	const buttonRef = useRef();
	const buttonInitialOffset = useRef(0);
	const [offsetBottom, setOffsetBottom] = useState();
	const deviceState = useSelector((store) => store.deviceState);
	const gpsStatus = useSelector((store) => store.generalData.gpsstatus);
	const lang = useSelector((store) => store.generalData.lang);
	const translate = useTranslate();
	const styles = (className) => {
		return (basic[className] ?? "") + " " + (extraStyles[className] ?? "");
	};

	useEffect(() => {
		if (deviceState.notDesktop) {
			if (buttonRef.current) {
				let elementOffsetBottom = window
					.getComputedStyle(buttonRef.current)
					.getPropertyValue("bottom")
					?.replace("px", "");
				elementOffsetBottom =
					elementOffsetBottom !== undefined ? parseInt(elementOffsetBottom) : 0;
				buttonInitialOffset.current = elementOffsetBottom;
				setOffsetBottom(elementOffsetBottom);
			}
		}
	}, [buttonRef.current]);

	useEffect(() => {
		if (deviceState.notDesktop) {
			if (buttonInitialOffset.current) {
				const buttonOffset = buttonInitialOffset.current;
				if (elementToAvoid?.current) {
					let elementHeight = window
						.getComputedStyle(elementToAvoid.current)
						.getPropertyValue("height")
						?.replace("px", "");
					elementHeight = elementHeight !== undefined ? parseInt(elementHeight) : 0;
					setOffsetBottom(buttonOffset + elementHeight);
				} else {
					setOffsetBottom(buttonInitialOffset.current);
				}
			}
		}
	}, [elementToAvoid?.current, buttonInitialOffset.current, avoidingCondition]);

	const mapOptions = (maps) => {
		return {
			styles: !isDark ? mapStyle : darkMapStyle,
			mapTypeControl: false,
			zoomControl: false,
			scaleControl: true,
			streetViewControl: false,
			rotateControl: false,
			fullscreenControl: false,
			clickableIcons: false,
			gestureHandling: "greedy",
			...options,
		};
	};

	const backToLocation = (callback) => {
		onBackToLocation(userLocation);
		typeof callback === "function" && callback();
	};

	const handleChildClick = (_, child) => {
		typeof child?.onClick === "function" && child?.onClick(child.data);
	};

	// eslint-disable-next-line
	const buttonOffsetBottom = offsetBottom ? { bottom: offsetBottom } : {};
	const hideUserLocation =
		hideOnCenter &&
		center?.lat === userLocation?.lat &&
		center?.lng === userLocation?.lng;

	return (
		<div
			className={styles("map-wrapper")}
			style={{ width: "100%", height: "100%" }}>
			<GoogleMap
				ref={ref}
				google={google}
				yesIWantToUseGoogleMapApiInternals
				bootstrapURLKeys={{
					key:
						process.env.NODE_ENV === "development"
							? "AIzaSyCiBxfqCbNMPCer3o3w1xhd6x9QLAs4d9Q"
							: process.env.NEXT_PUBLIC_APP_MAP_API_KEY,
					language:
						lang === LANGUAGES.ENGLISH.name ? LANGUAGES.ENGLISH.mapName : lang,
					region: "IL",
					libraries: ["geometry"],
				}}
				onClick={onClick}
				onChildClick={handleChildClick}
				options={mapOptions}
				className={className}
				defaultZoom={defaultZoom}
				zoom={zoom}
				onGoogleApiLoaded={(maps) => onGoogleApiLoaded(maps)}
				center={center}
				defaultCenter={{ lat: 31.2165164, lng: 32.2989481 }}
				onChange={onChange}
				onDrag={onDrag}>
				{children}
				{userLocation && !hideUserLocation && (
					<UserIndicator
						extraStyles={styles}
						lat={userLocation.lat}
						lng={userLocation.lng}
					/>
				)}
			</GoogleMap>
			{gpsStatus === "off" && (
				<div className={styles("gps-no-active-wrapper")}>
					<span className={styles("gps-no-active-message")}>
						{translate("map_no_gps_active")}
					</span>
				</div>
			)}
			{showBackToLocation && (
				<button
					ref={buttonRef}
					onClick={backToLocation}
					className={styles("back-to-location")}>
					<img
						src={CurrentLocation.src}
						alt={translate("accessibility_alt_backToLocation")}
						className={styles("back-to-location-img")}
					/>
				</button>
			)}
		</div>
	);
};

const Map = React.forwardRef(MapRef);

export default Map;
