import React, { useRef, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import BackgroundImage from "../../components/BackgroundImage/BackgroundImage";
import styles from "./index.module.scss";
import Header from "../header";
import Map from "../../components/Map";
import MapMarker from "../../components/Map/components/MapMarker";
import useKosher from "../../hooks/useKosher";
import { sortedBranches } from "../../redux/selectors/sortedBranches";
import { filterBranches } from "../../redux/selectors/filterBranches";
import MapPin from "/public/assets/icons/dominos-map-marker.svg";
import { useRouter } from "next/router";
import BreadCrumbs from "../../components/breadcrumbs";
import * as Routes from "constants/routes";
import useUserLocation from "hooks/useUserLocation";
import useCityBranches from "hooks/useCityBranches";
import useTranslate from "hooks/useTranslate";
import HiddenContent from "../../components/accessibility/hiddenContent/hiddenContent";
import { skipToContent } from "../../utils/functions";

export default function BranchesContainer({ children, isCityPage = false }) {
	const router = useRouter();

	useEffect(() => {
		const timeoutId = setTimeout(() => {
		  document.body.style.overflow = "hidden";
		  document.body.style.WebkitOverflowScrolling = "none";
		}, 500); 
	  
		return () => {
		  clearTimeout(timeoutId);
		  document.body.style.overflow = "";
		  document.body.style.WebkitOverflowScrolling = "";
		};
	  }, []);  

	const { isCity, isBranch } = useCityBranches(
		router.query.city,
		router.query?.branch,
	);

	const isBranchOnCity = !isCity && isCityPage;

	const deviceState = useSelector((store) => store.deviceState);

	return deviceState.isDesktop ? (
		<RenderDesktopContainer
			isBranchScreen={isBranch}
			cityName={router.query.city}
			branchName={router.query?.branch}
			isBranchOnCity={isBranchOnCity}>
			{children}
		</RenderDesktopContainer>
	) : (
		<RenderMobileContainer>{children}</RenderMobileContainer>
	);
}

const RenderDesktopContainer = ({
	children,
	isBranchScreen,
	cityName = "",
	branchName = "",
	isBranchOnCity,
}) => {
	const router = useRouter();
	const filters = useSelector((store) => store.filterBranches);
	const [zoom, setZoom] = useState(12);
	const translate = useTranslate();

	const [center, setCenter] = useState();
	const notSortedBranches = useSelector((store) => store.branches);
	const { branchFound, cityFound } = useCityBranches(cityName, branchName);

	const [location, setLocation, haveLocationPermission] =
		useUserLocation(setCenter);

	let branchesToInclude = [];
	if (cityFound) {
		branchesToInclude = cityFound.stores;
	}

	const mapRef = useRef();
	const kosher = useKosher();

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

	const handleOnGoogleMapsApiLoaded = (maps) => {
		const { map } = maps;
		mapRef.current = map;
	};
	const handleOnCenterChanged = (event) => {
		const { center } = event;
		setCenter(center);
	};

	const onBranchClick = (data) => {
		const cityUrl = data.cityUrl;
		const branchUrl = data.url;
		if (cityUrl) {
			router.push(`${Routes.branches}/${cityUrl}/${branchUrl}`);
		} else {
			router.push(`${Routes.branches}/${branchUrl}`);
		}
	};

	const getCrumbs = () => {
		const paths = router.pathname.split("/").filter((crumb) => crumb !== "");

		const pathsName = router.pathname
			.split("/")
			.filter((crumb) => crumb !== "")
			.map((crumb) => {
				if (!isBranchOnCity) {
					return getBasicCrumbName(crumb);
				} else {
					if (crumb === "[city]") {
						return translate("breadcrumbs_" + "[branch]").replace(
							"{branch}",
							branchFound?.name,
						);
					} else {
						return getBasicCrumbName(crumb);
					}
				}
			});
		const pathURL = paths.map((crumb, index) => {
			return `/${paths
				.slice(0, index + 1)
				.join("/")
				.replace("[city]", cityName)
				.replace("[branch]", branchName)}`;
		});

		return { routes: pathURL, names: pathsName };
	};

	function getBasicCrumbName(crumb) {
		return translate("breadcrumbs_" + crumb)
			.replace("{city}", cityFound?.name)
			.replace("{branch}", branchFound?.name);
	}

	const isOnBranchesScreen = !cityName && !branchName;

	return (
		<div className={styles["container"]}>
			<HiddenContent
				elements={[
					{
						onClick: () => skipToContent("target"),
						text: translate("accessibility_skipToMainContent"),
					},
				]}
			/>
			<Header
				title={translate("branchesScreen_header_title")}
				gradient={true}
				useH1Title={isOnBranchesScreen}
			/>

			<div className={styles["wrapper"]}>
				<BreadCrumbs
					id={"target"}
					root={{ route: "/", name: translate("breadcrumbs_root") }}
					crumbs={getCrumbs()}
					className={styles["custom-breadcrumbs"]}
				/>
				<div className={styles["map-wrapper"]}>
					<Map
						onChange={(e) => handleOnCenterChanged(e)}
						showBackToLocation={false}
						zoom={zoom}
						center={center}
						isDark={true}
						onGoogleApiLoaded={(maps) => handleOnGoogleMapsApiLoaded(maps)}
						userLocation={location}>
						{branches &&
							branches?.map((branch, index) => {
								const note = translate(branch?.statusMessage?.message)?.replace(
									"{time}",
									branch?.statusMessage?.values?.time,
								);

								return (
									<MapMarker
										lat={branch.lat}
										lng={branch.lng}
										key={`branch-map-marker-${branch.id}-${index}`}
										selected={branch.id === branchFound?.id}
										data={branch}
										onClick={onBranchClick}
										icon={MapPin}
										overrideDisable
										branchName={branch.name}
										note={note}
										disabled={!branch.isOpen}
										allowCursorOnDisable={true}
									/>
								);
							})}
					</Map>
				</div>
				<div className={styles["top-gradient"]} />
				<div
					className={`${styles["branches-wrapper"]} ${
						isBranchScreen ? styles["big"] : ""
					}`}>
					{children}
				</div>
			</div>
		</div>
	);
};

const RenderMobileContainer = ({ children }) => {
	return (
		<>
			{children}
			<BackgroundImage className={styles["background-image"]} />
		</>
	);
};
