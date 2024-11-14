import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./index.module.scss";
import * as popups from "constants/popup-types";
import * as popupsTypes from "constants/popup-types";
import Actions from "../../redux/actions";
import {
	getBTHNLang,
	getSimpleMediaUrl,
	resumeVideo,
	skipToContent,
	stopVideo,
} from "../../utils/functions";
import { AnimatedCapsule } from "components/AnimatedCapsule/AnimatedCapsule";
import WhiteLogo from "/public/assets/logos/home-dominos-logo.svg";
import Header from "containers/header";
import { ASSETS_ENUM } from "constants/AssetsEnum";
import Footer from "../footer";
import useKosher from "hooks/useKosher";
import Head from "next/head";
import { useRouter } from "next/router";
import OrderStatusService from "services/OrderStatusService";
import ORDER_STATUS, { NO_ORDER_STATUS } from "constants/OrderStatus";
import * as Routes from "constants/routes";
import useTranslate from "hooks/useTranslate";
import HiddenContent from "../../components/accessibility/hiddenContent/hiddenContent";
import * as popupTypes from "../../constants/popup-types";
import clsx from "clsx";
import Api from "api/requests";
import BackgroundImage from "components/BackgroundImage/BackgroundImage";
import AnalyticsService from "utils/analyticsService/AnalyticsService";
import LanguageDirectionService from "services/LanguageDirectionService";
import usePromotionalAndOperationalPopups from "hooks/usePromotionalAndOperationalPopups";
import { PROMO_HOME_SCREEN } from "constants/operational-promo-popups-state";
import { TAB_INDEX_FOCUS } from "../../constants/accessibility-types";
import SRContent from "../../components/accessibility/srcontent";
import { createAccessibilityText } from "../../components/accessibility/acfunctions";
import MARKETING_TYPES from "constants/Marketing-types";

export default function HomePage() {
	const translate = useTranslate();
	const isKosher = useKosher();
	const [videoStopped, setVideoStopped] = useState(false);
	const generalData = useSelector((store) => store.generalData);
	const userBranches = useSelector((store) => store.userData.branches);
	const userData = useSelector((store) => store.userData);
	const user = useSelector((store) => store.userData);
	const isFlowStopper = useSelector((store) => store.isFlowStopper);
	const deviceState = useSelector((store) => store.deviceState);
	const dispatch = useDispatch();
	const selectedBenefit = useSelector((store) => store.selectedBenefit);
	const opeOrderPopup = useSelector((store) => store.opeOrderPopup);
	const promotionalAndOperationalPopups = useSelector(
		(store) => store.promoPopups,
	);

	const showOnboarding = !user.verifiedOTP;

	const bthnLang = getBTHNLang(generalData.lang);
	const isBlockedDeliveryPopup = useRef(false);
	usePromotionalAndOperationalPopups(
		PROMO_HOME_SCREEN,
		isBlockedDeliveryPopup.current ? openDeliveryPopup : null,
	);
	const router = useRouter();
	const isChekcedForOrderStatus = useRef(false);

	const isMobile = deviceState.isMobile || deviceState.isTablet;
	const [isTitleActive, setIsTitleActive] = useState(false);
	const [isBtnActive, setIsBtnActive] = useState(false);
	const [isPageActive, setIsPageActive] = useState(false);
	const orderFromLastBranch =
		Array.isArray(userBranches) && userBranches[0]?.orderFromBranch;

	useEffect(() => {
		let timer = setTimeout(() => {
			setIsPageActive(true);
			timer = setTimeout(() => {
				setIsTitleActive(true);
				timer = setTimeout(() => {
					setIsBtnActive(true);
				}, 300);
			}, 300);
		}, 700);
		return () => {
			clearTimeout(timer);
		};
	}, []);

	useEffect(() => {
		if (opeOrderPopup !== null && !selectedBenefit) {
			onOrderButtonsClick(!!opeOrderPopup);
			dispatch(Actions.setOrderPpoupState(null));
		}
	}, [opeOrderPopup]);

	useEffect(() => {
		if (
			opeOrderPopup === null &&
			!selectedBenefit &&
			!orderFromLastBranch &&
			userData &&
			!isChekcedForOrderStatus.current &&
			promotionalAndOperationalPopups.length === 0 &&
			!isFlowStopper
		) {
			OrderStatusService.getStatus(NO_ORDER_STATUS, null, onDisallowed);
			isChekcedForOrderStatus.current = true;

			function onDisallowed() {
				// Settimeout for more intuitive modal
				const timeout = setTimeout(() => {
					dispatch(
						Actions.addPopup({
							type: popupsTypes.CONTINUE_ACTIVE_ORDER,
							payload: {},
						}),
					);
					clearTimeout(timeout);
				}, 150);
			}
		}
	}, [userData, promotionalAndOperationalPopups]);

	useEffect(() => {
		if (!isMobile) {
			const glassixScript = document.createElement("script");
			const glassixWidgetOptions = {
				numbers: [
					{
						number: "972732487007",
						name: "",
						subtitle: translate("whatsappBubble_number_subtitle"),
					},
				],
				left: LanguageDirectionService.isRTL(),
				ltr: !LanguageDirectionService.isRTL(),
				popupText: translate("whatsappBubble_popupText"),
				title: translate("whatsappBubble_title"),
				subTitle: "",
			};
			glassixScript.type = "text/javascript";
			glassixScript.id = "glassix-whatsapp-widget-script";
			glassixScript.crossOrigin = "anonymous";
			glassixScript.src = `https://cdn.glassix.net/clients/whatsapp.widget.1.2.min.js`;
			glassixScript.onload = () => {
				if (window.GlassixWhatsAppWidgetClient) {
					const client = new GlassixWhatsAppWidgetClient(glassixWidgetOptions);
					client.attach();
					const glassixElement = document.getElementById(
						"glassix-whatsapp-widget-container",
					);
					glassixElement.tabIndex = TAB_INDEX_FOCUS;
				}
			};
			document.body.appendChild(glassixScript);

			return () => {
				document.body.removeChild(glassixScript);
				const gs = document.getElementById("glassix-whatsapp-widget-container");
				if (gs) {
					gs.parentElement.removeChild(gs);
				}
			};
		}
	}, []);

	useEffect(() => {
		if (selectedBenefit) {
			onOrderButtonsClick(false);
		}
		if (orderFromLastBranch) {
			onOrderButtonsClick(true);
		}
	}, []);

	const renderMiddleSection = () => {
		return (
			<div className={styles["middle-section"]}>
				<div
					className={styles["logo-wrapper"]}
					aria-hidden={true}>
					<img
						alt={""}
						className={styles["logo"]}
						src={WhiteLogo.src}
					/>
				</div>
				{isKosher && (
					<span className={styles["kosher-title"]}>
						{translate("home_kosher_title")}
					</span>
				)}
			</div>
		);
	};

	const openOnBoardingPopup = () => {
		dispatch(
			Actions.addPopup({
				type: popups.ONBOARDING,
				payload: {},
			}),
		);
	};

	// const openBranchAboutToClosePopup = () => {
	//   dispatch(
	//     Actions.addPopup({
	//       type: popups.BRANCH_ABOUT_TO_CLOSE,
	//       payload: {},
	//     })
	//   );
	// };

	const openContinueOrderPopup = (onDeclineCallback) => {
		dispatch(
			Actions.addPopup({
				type: popups.CONTINUE_ACTIVE_ORDER,
				payload: { onDeclineCallback: onDeclineCallback },
				// disablePromot: true,
			}),
		);
	};

	function openDeliveryPopup() {
		if (showOnboarding) {
			openOnBoardingPopup();
		} else {
			dispatch(
				Actions.addPopup({
					type: popups.DELIVERY,
					payload: {},
				}),
			);
			isBlockedDeliveryPopup.current = false;
		}
	}

	function onOrderButtonsClick(isPickup) {
		const method = !showOnboarding ? "already_sign_up" : "first_time_on_app";
		AnalyticsService.onBoardingMethod(method);
		AnalyticsService.homepage("order funnel");
		AnalyticsService.chooseShipping(isPickup ? "pickup" : "shipping");

		OrderStatusService.getStatusFromUserData(
			NO_ORDER_STATUS,
			onAllowed,
			onDisallowed,
		);

		function onAllowed(status) {
			callback();
		}

		function onDisallowed(status) {
			if (status !== ORDER_STATUS.TRACKER) {
				openContinueOrderPopup(callback);
			} else {
				router.push(Routes.tracker);
			}
		}

		function callback() {
			dispatch(Actions.updateOrder({ isPickup: isPickup }));
			const onSuccess = (res) => {
				if (!Array.isArray(res.popups)) {
					openDeliveryPopup();
				} else isBlockedDeliveryPopup.current = true;
			};
			const payload = { subService: isPickup ? "pu" : "dlv" };
			Api.selectSubService({
				payload,
				onSuccess,
			});
		}
	}

	const renderBottomSection = () => {
		const text = user
			? translate(`${user?.greeting}`) + " " + user?.firstName
			: "";
		const srText = createAccessibilityText(text, translate("home_title_desktop"));
		return (
			<div className={styles["bottom-section"]}>
				{deviceState?.isDesktop && (
					<div id={"target-desktop"}>
						<SRContent
							message={srText}
							role={"alert"}
						/>
						<h1
							className={clsx(
								styles["greeting-title"],
								isPageActive ? styles["active"] : "",
							)}>
							{text}
						</h1>
						<h2
							id={"target"}
							className={clsx(styles["title"], isTitleActive ? styles["active"] : "")}>
							{translate("home_title_desktop")}
						</h2>
					</div>
				)}
				<div
					id={"target-mobile"}
					className={styles["actions"]}>
					{(isBtnActive || deviceState.notDesktop) && (
						<AnimatedCapsule
							bluePillText={translate("pickup_label")}
							redPillText={translate("delivery_label")}
							className={styles["animated-capsule-delivery-type"]}
							redPillOnPress={onOrderButtonsClick.bind(this, false)} // Delivery
							bluePillOnPress={onOrderButtonsClick.bind(this, true)} // Pickup
						/>
					)}
				</div>

				{process.env.NODE_ENV === "development" && <DevShit />}
			</div>
		);
	};

	const hasAssets = typeof user?.assets === "object" && user.assets?.length > 0;
	const videoObject = hasAssets
		? user.assets.filter((asset) => asset.id === ASSETS_ENUM.LANDING_PAGE)[0]
		: null;
	const videoName = videoObject?.value;
	const videoUrl = getSimpleMediaUrl(`Marketing/${videoName}`);

	return (
		<>
			<HiddenContent
				elements={[
					{
						onClick: () =>
							skipToContent(
								deviceState.isDesktop ? "target-desktop" : "target-mobile",
							),
						text: translate("accessibility_skipToMainContent"),
					},
					videoStopped
						? {
								onClick: () => {
									setVideoStopped(false);
									resumeVideo("home-video");
								},
								text: translate("accessibility_resumeVideo"),
						  }
						: {
								onClick: () => {
									setVideoStopped(true);
									stopVideo("home-video");
								},
								text: translate("accessibility_stopVideo"),
						  },
				]}
			/>
			<Header
				className={clsx(styles["header"], isPageActive ? styles["active"] : "")}
			/>
			<div
				id="bthn"
				lang={bthnLang}></div>
			<div
				id={"main_content"}
				className={styles["home"]}>
				{videoUrl ? (
					<Head>
						<link
							rel="prefetch"
							href={videoUrl}
							as="video"
						/>
					</Head>
				) : null}
				<BackgroundImage />

				<video
					id={"home-video"}
					className={styles["video-background"]}
					playsInline={true}
					muted={true}
					autoPlay={true}
					loop={true}
					controls={false}
					src={videoUrl}
				/>

				{/* <Header /> */}
				{deviceState?.notDesktop && renderMiddleSection()}
				{renderBottomSection()}
				{deviceState.isDesktop && <div className={styles["bottom-gradient"]} />}
			</div>
			<Footer />
		</>
	);
}

const DevShit = ({ props }) => {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const randomPopup = () => {
		dispatch(
			Actions.addPopup({
				type: popups.MARKETING_SUBSCRIPTION,
				payload: {
					type: MARKETING_TYPES.PRESENT_POPUP,
					title: translate("marketing_get_benefit_title"),
					addTitle: translate("marketing_get_benefit_add_title"),
					subTitle: translate("marketing_get_benefit_disclaimer"),
					mainBtnText: translate("marketing_get_benefit_btn"),
					isLottie: true,
					mainBtnFunc: () => {},
					subBtnFunc: () => {},
				},
			}),
		);
	};

	return (
		<>
			<button
				style={{ margin: 30 }}
				onClick={randomPopup}>
				{"Click here to GENERAL_MESSAGE  popup"}
			</button>
		</>
	);
};
