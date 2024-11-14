import React, { useEffect, useRef } from "react";
import Tracker from "containers/Tracker";
import Header from "containers/header";
import { useDispatch, useSelector } from "react-redux";

import styles from "./tracker.module.scss";
import TrackerListItem from "containers/Tracker/TrackerListItem";
import { ASSETS_ENUM } from "constants/AssetsEnum";
import { getSimpleMediaUrl, skipToContent, stopVideo } from "utils/functions";
import useTranslate from "hooks/useTranslate";
import Api from "api/requests";
import Actions from "redux/actions";
import * as Routes from "constants/routes";
import { useRouter } from "next/router";

import TrackerMap from "/public/assets/bg-images/trackermap.png";
import HiddenContent from "../../components/accessibility/hiddenContent/hiddenContent";
import { reduxWrapper } from "redux/store";
import ISR from "utils/ISR";
import { GPS_STATUS } from "constants/gps-status";

function TrackerPage() {
	const deviceState = useSelector((store) => store.deviceState);
	const userData = useSelector((store) => store.userData);
	const usersOrders = userData.submittedOrders ?? [];
	const translate = useTranslate();
	const videoRef = useRef();
	const generalData = useSelector((store) => store.generalData);
	const dispatch = useDispatch();
	const router = useRouter();
	const isSingleOrder = usersOrders.length === 1;

	useEffect(() => {
		if (generalData?.tokenData?.accessToken) {
			// Prevent sending api call without accessToken  when user refresh browser

			const payload = { gpsstatus: generalData?.gpsstatus ?? GPS_STATUS.OFF };

			Api.getCustomerDetails({ payload, onSuccessCB });

			function onSuccessCB(res) {
				dispatch(Actions.setUser(res.data));
			}

			dispatch(Actions.hideFooter());
		}
	}, [generalData?.tokenData?.accessToken]);

	useEffect(() => {
		if (isSingleOrder) {
			const order = usersOrders[0];
			const hash = order.saleIdHash;
			setTimeout(() => {
				router.push(`${Routes.tracker}/[orderHash]`, `${Routes.tracker}/${hash}`, {
					shallow: true,
				});
			}, 100);
		}
	}, [isSingleOrder]);

	const hasAssets =
		typeof userData?.assets === "object" && userData.assets?.length > 0;
	const videoObject = hasAssets
		? userData.assets.find((asset) => asset.id === ASSETS_ENUM.LANDING_PAGE)
		: null;
	const videoName = videoObject?.value ?? "test_background_video.mp4";
	const videoUrl = getSimpleMediaUrl(`Marketing/${videoName}`);

	const renderMultipleOrdersTopSection = () => {
		const text = translate("trackerScreen_multipleOrders_title").replace(
			"{number}",
			usersOrders.length,
		);
		return (
			<h1
				className={styles["multiple-orders-title"]}
				aria-live={"polite"}>
				{text}
			</h1>
		);
	};

	const renderMultipleOrders = () => {
		return (
			<div className={styles["orders-wrapper"]}>
				<div
					className={styles["orders-list"]}
					role={"list"}>
					{usersOrders.map((order) => (
						<TrackerListItem
							key={`tracker-item${order.saleIdHash}`}
							acceptedAt={order.submittedAt}
							saleHash={order.saleIdHash}
							total={order?.total}
							details={order?.details}
							onClick={(hash) => {
								router.push(
									`${Routes.tracker}/[orderHash]`,
									`${Routes.tracker}/${hash}`,
									{ shallow: true },
								);
							}}
						/>
					))}
				</div>
			</div>
		);
	};
	const handleOnVideoClick = () => {
		if (videoRef?.current?.paused) {
			videoRef.current?.play();
		} else {
			videoRef.current?.pause();
		}
	};

	return (
		<div className={styles["tracker-wrapper"]}>
			<HiddenContent
				elements={[
					{
						onClick: () => skipToContent("target"),
						text: translate("accessibility_skipToMainContent"),
					},
					{
						onClick: () => stopVideo("tracker-video"),
						text: translate("accessibility_stopVideo"),
					},
				]}
			/>
			<Header
				title={
					deviceState.isMobile ? translate("trackerScreen_header_title") : null
				}
			/>
			<video
				id={"tracker-video"}
				ref={videoRef}
				onClick={() => handleOnVideoClick()}
				className={styles["video-background"]}
				src={videoUrl}
				controls={false}
				muted
				loop
				playsInline
				autoPlay
			/>
			<div className={styles["tracker-modal"]}>
				<div className={styles["wrapper"]}>
					<div className={styles["filler"]} />
					{deviceState.isMobile && (
						<div className={styles["bg-image"]}>
							<img src={TrackerMap.src} />
						</div>
					)}
					<div className={styles["content"]}>
						<div
							id={"target"}
							className={styles["tracker-top-section"]}>
							{renderMultipleOrdersTopSection()}
						</div>
						{renderMultipleOrders()}
					</div>
				</div>
			</div>
		</div>
	);
}

export default TrackerPage;

export const getStaticProps = reduxWrapper.getStaticProps(
	(store) =>
		async ({ params, locale }) => {
			ISR.setGlobalStore(store);
			const isrRevalidate = parseInt(process.env.NEXT_PUBLIC_ISR_REVALIDATE);
			const isrEnabled = parseInt(process.env.NEXT_PUBLIC_ISR_ENABLED);

			if (isrEnabled) {
				try {
					await ISR.sharedRequests(locale);

					await ISR.getGeneralMetaTags(locale, "/tracker");

					return {
						props: { ...params },
						revalidate: isrRevalidate,
					};
				} catch {
					return {
						props: null,
						revalidate: isrRevalidate,
					};
				}
			} else {
				return {
					props: { ...params },
				};
			}
		},
);
