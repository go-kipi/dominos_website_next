import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import DeliveryHeader from "../DeliveryHeader/DeliveryHeader";
import TextInput from "components/forms/textInput";

import styles from "./ChooseAddressFromMap.module.scss";
import { calcDistance, generateUniqueId } from "utils/functions";
import AutoCompleteService from "services/AutoCompleteService";
import AutoCompleteList from "./AutoCompleteList/AutoCompleteList";
import Button from "components/button";
import Actions from "redux/actions";
import * as deliveryScreensTypes from "constants/delivery-popup-screen-types";
import * as deliveryErrors from "constants/deliverability-errors";
import BranchPin from "/public/assets/icons/dominos-map-marker.svg";
import CurrentLocationMarker from "/public/assets/icons/current-location-marker.svg";
import Api from "api/requests";
import { STATUS } from "constants/response-status-types";
import useStack from "hooks/useStack";
import STACK_TYPES from "constants/stack-types";
import MapMarker from "components/Map/components/MapMarker";
import Map from "components/Map";
import { GPS_STATUS } from "constants/gps-status";
import useKosher from "hooks/useKosher";
import ReverseGeocodeService from "services/reverseGeocodeService";
import useUserLocation from "hooks/useUserLocation";
import useTranslate from "hooks/useTranslate";
import { handleArrowUpAndDown } from "../../../../../components/accessibility/keyboardsEvents";
import { onArrows } from "../../../../../components/accessibility/acfunctions";
import DominosLoader from "components/DominosLoader/DominosLoader";

const INPUT_NAME = "search-input";
export default function ChooseAddressFromMap(props) {
	const { animateOut, params, kosherCheckbox } = props;
	const deviceState = useSelector((store) => store.deviceState);
	const globalParams = useSelector((store) => store.globalParams);
	const isKosher = useKosher();
	const searchInputRef = React.useRef();
	const [searchAddress, setSearchAddress] = useState("");
	const [selectedAddress, setSelectedAddress] = useState("");
	const [selectedPoint, setSelectedPoint] = useState(-1);
	const [pointsOfInterest, setPointsOfInterest] = useState([]);
	const [autoCompleteResults, setAutoCompleteResults] = useState([]);
	const isMobile = deviceState.isMobile;
	const [showList, setShowList] = useState(true);
	const isRequestingGeoLocation = useRef(false);
	const dispatch = useDispatch();
	const mapRef = React.useRef();
	const lastBounds = React.useRef();
	const [zoom, setZoom] = useState(12);
	const [_, setStack] = useStack(STACK_TYPES.DELIVERY);
	const { didSkipPage = false } = params;
	const buttonRef = React.useRef();
	const [showLoader, setShowLoader] = useState(true);

	const timer = useRef();

	const maxKM =
		globalParams?.pointsOfInteresetOption?.result?.maxMapDiagonalKm ?? 10;
	const translate = useTranslate();

	const [center, setCenter] = React.useState();

	const [location] = useUserLocation(setCenter);

	function selectAddressWithGeolocation(center) {
		if (!isRequestingGeoLocation.current) {
			isRequestingGeoLocation.current = true;

			ReverseGeocodeService.getNearestAddress(center.lat, center.lng)
				.then((res) => {
					if (res.status === 200) {
						const { location_name, info, delivery_area } = res.data;
						const outOfIsraelBounds = !location_name && !info;
						if (outOfIsraelBounds) {
							isRequestingGeoLocation.current = false;
							return;
						}
						const newSearchAddress = !location_name ? info : location_name;
						AutoCompleteService.getAutocompleteResults(newSearchAddress)
							.then((response) => {
								if (response.status === 200) {
									if (response.data.Locations && response.data.Locations.length > 0) {
										const { Locations } = response.data;
										const firstLocationFound = Locations[0];
										handleSelectAddress(firstLocationFound);
									}
									isRequestingGeoLocation.current = false;
								}
							})
							.catch((error) => {
								isRequestingGeoLocation.current = false;
							});
					}
				})
				.catch((err) => {
					isRequestingGeoLocation.current = false;
				});
		}
	}

	function debounce(callback, time) {
		clearTimeout(timer.current);
		timer.current = setTimeout(callback, time);
	}

	const handleOnContinueBtn = (_, temporarilyNotKosher = false) => {
		if (selectedPoint !== -1 || selectedAddress !== "") {
			const payload = {};
			if (selectedAddress !== "" && selectedAddress.src != "2") {
				payload.address = selectedAddress.location;
				payload.city = selectedAddress.city;
				payload.Street = selectedAddress.street;
				payload.houseNo = selectedAddress.hnum;
				payload.addressType = "address";
			} else {
				payload.addressType = "pointOfInterest";
				payload.street = selectedPoint.description || selectedAddress.location;
				payload.city = selectedPoint.city;
			}

			payload.storetypes = temporarilyNotKosher
				? []
				: isKosher || kosherCheckbox
				? ["Kosher"]
				: [];

			function onSuccessCB(res) {
				const payload = {
					address:
						selectedAddress !== ""
							? selectedAddress
							: selectedPoint !== -1
							? selectedPoint
							: {},
					...res.data,
				};
				payload.id = generateUniqueId(6);
				payload.isPoi = selectedPoint !== -1 || selectedAddress.src == "2";
				dispatch(Actions.updateAddAddressForm(payload));
				setStack({
					type: deliveryScreensTypes.ADDRESSTYPE,
					showHeader: false,
					params: {
						...payload,
					},
				});
			}

			function onRejectionCB(data) {
				if (data.message.id === deliveryErrors.NO_KOSHER_BRANCH_FOUND) {
					setStack({
						type: deliveryScreensTypes.NOBRANCH,
						showHeader: false,
						params: {
							isKosher: true,
							handleSpecialDelivery: () => handleOnContinueBtn(null, true),
						},
					});
				} else if (
					data.message.id === deliveryErrors.NO_ADDRESS_FOUND ||
					data.message.id === deliveryErrors.NO_STORE_DELIVER_NOW ||
					data.message.id === deliveryErrors.NO_STORE_DELIVER
				) {
					setStack({
						type: deliveryScreensTypes.NOBRANCH,
						showHeader: false,
						params: { isKosher: false },
					});
				} else {
					Api.onFailure(data);
				}
			}

			Api.getAddressDeliverability({
				payload,
				onSuccessCB,
				onRejectionCB,
			});
		}
	};

	function getAutocompleteResults(value) {
		AutoCompleteService.getAutocompleteResults(value)
			.then((response) => {
				if (response.status === 200) {
					if (response.data.Locations && response.data.Locations.length > 0) {
						const { Locations } = response.data;
						setAutoCompleteResults(Locations);
						setShowList(true);
					}
				}
			})
			.catch((err) => {});
	}

	const handleOnChange = (evt) => {
		setSelectedAddress("");
		setSelectedPoint(-1);
		const { value } = evt.target;
		setSearchAddress(value);
		if (value && value.length > 1) {
			debounce(() => getAutocompleteResults(value), 300);
		}
	};

	const handleSelectAddress = (address) => {
		if (address.lat === 0 || address.lon === 0) {
			const { lat, lng } = defaultLocation;
			setCenter({
				latitude: lat,
				longitude: lng,
			});
		} else {
			const nextRegion = {
				lng: parseFloat(address?.lon),
				lat: parseFloat(address?.lat),
			};
			setSelectedAddress(address);
			setSearchAddress(address?.location);
			setCenter(nextRegion);
		}
		setShowList(false);
		setZoom(18);
	};

	const didZoomIn = (NW, NE) => {
		if (!lastBounds.current) return false;
		else {
			// get last bounds.
			const { nw, ne } = lastBounds.current;
			// check if NorthWest longitude is larger than the old one
			// and if NorthEast longitude is smaller than the last one
			const zoomedIn = NW.lng > nw.lng && NE.lng < ne.lng;
			return zoomedIn;
		}
	};

	const resetTextSelection = () => {
		setSelectedAddress("");
		setShowList(true);
	};

	const handleOnBackToLocationClick = (userLocation) => {
		setCenter(userLocation);
		setZoom(18);
	};

	const handleOnCenterChanged = (event) => {
		const { bounds, center } = event;
		setCenter(center);
		const { ne, nw, sw } = bounds;
		const payload = {
			maxLng: ne.lng,
			maxLat: ne.lat,
			minLng: sw.lng,
			minLat: sw.lat,
		};

		const p1 = ne;
		const p2 = sw;
		const distanceInKm = Math.round(calcDistance(p1, p2));
		if (
			(!lastBounds.current && distanceInKm < maxKM) ||
			(!didZoomIn(nw, ne) && distanceInKm < maxKM)
		) {
			lastBounds.current = bounds;
			function onSuccess(data) {
				setPointsOfInterest(data.data.list);
			}
			Api.getPointsOfIntereset({ payload, onSuccess });
		}
		debounce(() => {
			selectAddressWithGeolocation(center);
		}, 300);
	};

	const resetPoiSelection = () => {
		if (selectedPoint !== -1) {
			setSelectedPoint(-1);
		}
		searchInputRef.current?.blur();
	};

	const onSelectPoint = (point) => {
		setSelectedPoint(point);
		setSearchAddress(point.description);
		setSelectedAddress("");

		const nextRegion = {
			lng: parseFloat(point.lng),
			lat: parseFloat(point.lat),
		};
		setCenter(nextRegion);
	};

	const inRange = (range = 0) => {
		if (center && location) {
			const distance = calcDistance(center, location, "float");
			const rangeInKilos = range / 1000;
			return distance <= rangeInKilos;
		}
	};

	const renderButtons = selectedAddress !== "" || selectedPoint !== -1;

	const handleFocusList = () => {
		const currentFocus = document.activeElement;
		if (currentFocus.name === INPUT_NAME) {
			const autoCompleteList = document.getElementById("auto-complete-list");
			autoCompleteList?.children[0]?.focus();
		}
	};

	function handleKeyDown(e) {
		if (e.key === "Enter") {
			if (autoCompleteResults.length) {
				const firstOption = autoCompleteResults[0];
				handleSelectAddress(firstOption);
			}
		}
	}

	return (
		<div className={styles["choose-address-from-map-wrapper"]}>
			<DeliveryHeader
				animateOut={animateOut}
				hideCloseIcon={didSkipPage}
			/>
			<div
				className={styles["search-address-wrapper"]}
				onKeyDown={(event) => handleArrowUpAndDown(event, handleFocusList)}>
				<TextInput
					ref={searchInputRef}
					name={INPUT_NAME}
					type={"text"}
					showClearIcon={selectedAddress !== "" || searchAddress !== ""}
					onChange={handleOnChange}
					value={searchAddress}
					onClearText={resetTextSelection}
					autoComplete={false}
					ariaLabel={translate("accessibility_EnterAddress")}
					role={"searchbox"}
					ariaAutoComplete={"list"}
					onKeyDown={handleKeyDown}
				/>
				<AutoCompleteList
					id={"auto-complete-list"}
					onSelectItem={handleSelectAddress}
					data={autoCompleteResults}
					showList={showList}
					searchQuery={searchAddress}
				/>
			</div>
			<span
				className={styles["search-address-suggestion"]}
				tabIndex={0}>
				{translate("deliveryPopup_chooseAddressFromMap_inputSuggestion")}
			</span>

			<div className={styles["map-wrapper"]}>
				<Map
					ref={mapRef}
					google={props.google}
					onClick={resetPoiSelection}
					onChange={(e) => handleOnCenterChanged(e)}
					onBackToLocation={(location) => handleOnBackToLocationClick(location)}
					className={styles["map"]}
					zoom={zoom}
					center={center}
					userLocation={location}
					hideOnCenter
					elementToAvoid={buttonRef}
					avoidingCondition={renderButtons}
					onGoogleApiLoaded={() => setShowLoader(false)}
					extraStyles={styles}>
					{pointsOfInterest?.map((poi, idx) => (
						<MapMarker
							key={`poi-${idx}`}
							lat={poi.lat}
							lng={poi.lng}
							text={poi.description}
							icon={BranchPin}
							selected={selectedPoint.lat === poi.lat && selectedPoint.lng === poi.lng}
							onClick={onSelectPoint.bind(this, poi)}
							className={styles["branch-marker-wrapper"]}
							labelClassName={styles["branch-marker-label"]}
						/>
					))}
				</Map>

				<MapMarker
					text={translate("deliveryPopup_chooseAddressFromMap_mapMarker_label")}
					selected={inRange(30)}
					labelClassName={styles["current-location-label"]}
					selectedClassName={styles["remove-glow"]}
					className={styles["center-of-the-screen"]}
					icon={CurrentLocationMarker}
				/>
				<div className={styles["linear-gradient-top"]} />
				<div className={styles["linear-gradient-bottom"]} />
				{renderButtons && (
					<>
						{isMobile && <div className={styles["linear-gradient-bottom"]} />}
						<Button
							ref={buttonRef}
							onClick={handleOnContinueBtn}
							className={styles["continue-btn"]}
							textClassName={styles["continue-btn-text"]}
							text={translate("deliveryPopup_chooseAddressFromMap_buttonLabel")}
						/>
					</>
				)}
				{showLoader && (
					<div className={styles["loader-wrapper"]}>
						<div className={styles["loader"]}>
							<DominosLoader />
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
