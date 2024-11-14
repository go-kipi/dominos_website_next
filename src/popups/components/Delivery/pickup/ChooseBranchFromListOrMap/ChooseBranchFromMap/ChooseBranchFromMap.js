import React, { useEffect, useRef, useState } from "react";
import ToggleListIcon from "/public/assets/icons/toggle-list-icon.svg";
import MapPin from "/public/assets/icons/dominos-map-marker.svg";
import Header from "../Header/Header";
import Filter from "../Filter/Filter";
import styles from "./ChooseBranchFromMap.module.scss";
import Callout from "./Callout";
import MapMarker from "components/Map/components/MapMarker";
import Map from "components/Map";
import clsx from "clsx";
import MarkerCalloutForBranches from "./MarkerCalloutForBranches/MarkerCalloutForBranches";
import useUserLocation from "hooks/useUserLocation";
import AutoCompleteList from "popups/components/Delivery/delivery/ChooseAddressFromMap/AutoCompleteList/AutoCompleteList";
import { useDispatch, useSelector } from "react-redux";
import Actions from "redux/actions";
import DominosLoader from "components/DominosLoader/DominosLoader";

export default function ChooseBranchFromMap(props) {
	const {
		animateOut,
		branches,
		didSkipPage = false,
		showHeader,
		isOnBranchesScreen,
	} = props;
	const [showCallout, setShowCallout] = React.useState(false);
	const mapRef = useRef();
	const [selectedMarker, setSelectedMarker] = React.useState(-1);
	const [zoom, setZoom] = useState(12);
	const [isFilterShowing, setIsFilterShowing] = useState(false);
	const filters = useSelector((store) => store.filterBranches);
	const dispatch = useDispatch();
	const inputRef = useRef();
	const [showLoader, setShowLoader] = useState(true);

	const [center, setCenter] = React.useState();
	const [location] = useUserLocation(setCenter);

	const handleOnToggleClick = () => {
		const { toggleSwitch } = props;
		typeof toggleSwitch === "function" && toggleSwitch();
	};

	const handleSelectBranch = (id) => {
		const { onSelectedBranch } = props;
		typeof onSelectedBranch === "function" && onSelectedBranch(id);
	};

	const handleOnBackToLocationClick = (userLocation) => {
		setCenter(userLocation);
		setZoom(16);
	};

	const onBranchClick = (branch) => {
		setCenter({ lat: branch.lat, lng: branch.lng });
		setSelectedMarker(branch);
		setShowCallout(true);
	};

	const clearBranchSelection = () => {
		if (selectedMarker !== -1) {
			setShowCallout(false);
			setSelectedMarker(-1);
		}
	};

	const CalloutComponent = isOnBranchesScreen
		? MarkerCalloutForBranches
		: Callout;

	function onAutoCompleteClick(branch) {
		onBranchClick(branch);
		dispatch(Actions.updateFilterBranches({ query: "" }));
	}

	function hideKeyboardOnDrag() {
		inputRef.current.blur();
	}

	function onEnterKeyDown() {
		if (branches.length) {
			const firstOption = branches[0];
			onAutoCompleteClick(firstOption);
		}
	}

	return (
		<div className={styles["choose-branch-from-map-wrapper"]}>
			{showHeader && (
				<Header
					animateOut={animateOut}
					hideCloseIcon={didSkipPage}
				/>
			)}
			<div className={styles["search-branch-wrapper"]}>
				<Filter
					onFilterPress={(isFilterShowing) => {
						setIsFilterShowing(isFilterShowing);
					}}
					showFilterBtn
					showTagsOnStart={false}
					ref={inputRef}
					onEnter={onEnterKeyDown}
				/>

				<AutoCompleteList
					onSelectItem={onAutoCompleteClick}
					keyToFind={"storeAddress"}
					data={branches}
					showList={!!filters.query}
					searchQuery={filters.query}
					extraStyles={styles}
				/>
			</div>

			{/* Map wrapper style must be explicit */}
			<div
				className={clsx(
					styles["map-wrapper"],
					isFilterShowing ? styles["with-filter"] : "",
				)}>
				<Map
					ref={mapRef}
					google={props.google}
					onClick={clearBranchSelection}
					onChange={(e) => setCenter(e.center)}
					className={styles["map"]}
					zoom={zoom}
					center={center}
					onBackToLocation={handleOnBackToLocationClick}
					userLocation={location}
					extraStyles={styles}
					onDrag={hideKeyboardOnDrag}
					onGoogleApiLoaded={() => setShowLoader(false)}>
					{branches?.map((branch, index) => {
						return (
							<MapMarker
								lat={branch.lat}
								lng={branch.lng}
								key={`branch-map-marker-${branch.id}-${index}`}
								selected={branch.id === selectedMarker?.id}
								disabled={!branch.isOpen}
								data={branch}
								onClick={onBranchClick}
								icon={MapPin}
								overrideDisable
							/>
						);
					})}
				</Map>
				<div className={styles["linear-gradient-top"]} />
				<div className={styles["linear-gradient-bottom"]} />
				{showCallout && (
					<CalloutComponent
						onBtnClick={handleSelectBranch}
						branch={selectedMarker}
						zIndex={10002}
						closeCallout={clearBranchSelection}
					/>
				)}
				<div
					onClick={handleOnToggleClick}
					className={styles["toggle-list-wrapper"]}>
					<img
						src={ToggleListIcon.src}
						alt={""}
					/>
				</div>

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
