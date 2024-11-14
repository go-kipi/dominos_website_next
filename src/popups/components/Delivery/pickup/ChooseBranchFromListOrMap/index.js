import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import * as deliveryScreensTypes from "constants/delivery-popup-screen-types";

import ChooseBranchFromListWithGeoLocation from "./ChooseBranchFromListWithGeoLocation/ChooseBranchFromListWithGeoLocation";
import ChooseBranchFromMap from "./ChooseBranchFromMap/ChooseBranchFromMap";
import { sortedBranches } from "redux/selectors/sortedBranches";
import useStack from "hooks/useStack";
import STACK_TYPES from "constants/stack-types";
import { filterBranches } from "redux/selectors/filterBranches";
import useKosher from "hooks/useKosher";
import useUserLocation from "hooks/useUserLocation";

import Api from "api/requests";

export default function ChooseBranchWithLocation(props) {
	const {
		animateOut,
		params = {},
		showHeader = true,
		customOnBranchClick,
		isOnBranchesScreen = false,
		showFilter = true,
		branchesToInclude = [],
		extraDataFunc = () => {},
		useLink = false,
		setChosenBranchId,
	} = props;

	const { didSkipPage = false, selectedTags } = params;
	const lang = useSelector((store) => store.generalData.lang);

	const [_, setStack] = useStack(STACK_TYPES.DELIVERY);
	const filters = useSelector((store) => store.filterBranches);
	const [isShowMap, setIsShowMap] = useState(false);
	const notSortedBranches = useSelector((store) => store.branches);
	const kosher = useKosher();
	const [location, setLoaction, haveLocationPermission] = useUserLocation(
		() => {},
	);

	useEffect(() => {
		if (!isOnBranchesScreen || !notSortedBranches) {
			const payload = { lang, onlyvisited: false };

			Api.getStoreList({
				payload,
			});
		}
	}, []);

	const allBranches = sortedBranches({
		branches: notSortedBranches,
		currentLocation: haveLocationPermission ? location : undefined,
	});

	const branches = filterBranches({
		branches: allBranches,
		filters,
		isKosher: kosher,
		branchesToInclude: branchesToInclude,
	});

	function onSelectedBranch(id) {
		const selectedBranch = getBranchById(id);
		if (customOnBranchClick) {
			customOnBranchClick(id);
		}

		setStack({
			type: deliveryScreensTypes.PICKUP,
			showHeader: true,
			params: { branch: selectedBranch },
		});
	}

	function getBranchById(id) {
		for (const key in allBranches) {
			const branch = allBranches[key];

			if (branch.id === id) {
				return branch;
			}
		}
	}

	return isShowMap ? (
		<ChooseBranchFromMap
			toggleSwitch={() => setIsShowMap(false)}
			branches={branches}
			animateOut={animateOut}
			onSelectedBranch={onSelectedBranch}
			didSkipPage={didSkipPage}
			showHeader={showHeader}
			isOnBranchesScreen={isOnBranchesScreen}
		/>
	) : (
		<ChooseBranchFromListWithGeoLocation
			toggleSwitch={() => setIsShowMap(true)}
			branches={branches}
			animateOut={animateOut}
			onSelectedBranch={onSelectedBranch}
			didSkipPage={didSkipPage}
			showHeader={showHeader}
			isOnBranchesScreen={isOnBranchesScreen}
			showFilter={showFilter}
			extraDataFunc={extraDataFunc}
			addCustomScrollbar={true}
			useLink={useLink}
			selectedTags={selectedTags}
		/>
	);
}
