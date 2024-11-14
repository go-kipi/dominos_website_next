import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Actions from "redux/actions";

import { clearAllBodyScrollLocks, disableBodyScroll } from "body-scroll-lock";

// popup types
import * as popupTypes from "constants/popup-types";

// popup components
import BasicPopup from "./components/basic";
import TwoActionPopup from "./components/two-action";
import BasicBlurPopup from "./components/basic-blur";
import OnBoardingPopup from "./components/OnboardingPopup/Onboarding";
import DeliveryPopup from "./components/Delivery/delivery";
import PersonalBuilderPopup from "./components/personal-builder";
import ProductPopup from "./components/Product/Product";
import PizzaDetailsPopup from "./components/pizza-details";
import EditPizzaNamePopup from "./components/edit-pizza-name";
import PriceListPopup from "./components/price-list";
import Coupon from "./components/CouponPopup/Coupon";
import RemainingUpgradesModal from "./components/RemainingUpgradesModal";
import EndOfSalePopup from "./components/EndOfSalePopup";
import PizzaSpecialRequests from "./components/PizzaSpecialRequests";
import PizzaDuplicate from "./components/PizzaDuplicate";
import ChooseQuarterPopup from "./components/ChooseQuarterPopup";
import Roleta from "./components/Roleta/Roleta";
import SwitchMixPopup from "./components/switch-mix-popup";
import MixInfoPopup from "./components/MixInfoPopup";
import VeganPizzaPopup from "./components/VeganPizzaPopup";
import SpecialRequestCart from "./components/SpecialRequestCart";
import AddCreditCardPopup from "./components/AddCreditCardPopup";
import RegisterPopup from "./components/Register";
import IdentificationPopup from "./components/Identification";
import SavePizza from "./components/savePizza";
import LogoutPopup from "./components/LogoutPopup/Logout";
import ContinueActiveOrderPopup from "./components/ContinueActiveOrder";
import BranchAboutToClosePopup from "./components/BranchAboutToClosePopup";
import TermOfServicePopup from "./components/TermOfService";
import ApiErrorPopup from "./components/ApiErrorPopup";

import { useRouter } from "next/router";
import VeganErrorPopup from "./components/VeganErrorPopup";
import WelcomeCouponPopup from "./components/WelcomeCouponPopup/WelcomeCouponPopup";
import OrderDetailsPopup from "./components/customerDetails";
import AddCreditCardFullScreenPopup from "./components/AddCreditCardFullScreenPopup";
import MinimumPricePopup from "./components/MinimumPricePopup/MinimumPrice";
import { KEY_ESC } from "../constants/accessibility-types";
import BigOrdersSuccessPopup from "./components/BigOrdersSuccessPopup/BigOrdersSuccessPopup";
import BirthDayEventsPopup from "./components/BirthDayEventsPopup/BirthDayEventsPopup";
import DevPopup from "./components/Dev/dev";
import dynamic from "next/dynamic";
import GeneralMessage from "./components/GeneralMessagePopup/GeneralMessagePopup";
import MenuFiltersPopup from "./components/MenuFiltersPopup/MenuFiltersPopup";
import UnresolvedCartItemsPopup from "./components/UnresolvedCouponsPopup";
import PromotionalImagePopup from "./components/PromotionalImagePopup";
import ReactFocusTrap from "components/accessibility/reactFocusTrap";
import BuilderPopup from "./components/builder";
import UpSalePopup from "./components/UpSalePopup/UpSalePopup";
import MixedUpgradesPopup from "./components/MixedUpgrades";
import Dips from "./components/Dips";
import MarketingSubscription from "./components/MarketingSubscription/MarketingSubscription";
import { isSafariBrowser } from "utils/functions";

export default function Popups() {
	const popupsArray = useSelector((store) => store.popupsArray);
	const dispatch = useDispatch();
	const router = useRouter();
	let scrollPosition = 0;

	// Note: Saving the position of the screen to prevent ui shifting of the background
	const disableSafariScroll = () => {
		scrollPosition = window.scrollY;
		document.body.style.overflow = "hidden";
		document.body.style.position = "fixed";
		document.body.style.top = `-${scrollPosition}px`;
		document.body.style.width = "100%";
	};

	const enableSafariScroll = () => {
		document.body.style.overflow = "";
		document.body.style.position = "";
		document.body.style.top = "";
		document.body.style.width = "";
		window.scrollTo(0, scrollPosition);
	};

	// Note: stop body from scrolling while popup is open
	useEffect(() => {
		const userAgent = navigator.userAgent;

		const popupContainer = document.querySelector("#popupContainer");

		if (!isSafariBrowser()) {
			disableBodyScroll(popupContainer);
		} else {
			disableSafariScroll();
		}
		return () => {
			if (!isSafariBrowser()) {
				clearAllBodyScrollLocks();
			} else {
				enableSafariScroll();
			}
		};
	}, [popupsArray]);

	// map popup types to popup components
	const getPopupComponent = (key, type, payload) => {
		const popupProps = {
			key,
			id: payload.key,
			payload,
		};
		const popupComponents = {
			/* ====================== general popups ====================== */
			[popupTypes.COUPON]: <Coupon {...popupProps} />,
			[popupTypes.ROLETA]: <Roleta {...popupProps} />,
			[popupTypes.API_ERROR]: <ApiErrorPopup {...popupProps} />,
			[popupTypes.API_MESSAGE]: <ApiErrorPopup {...popupProps} />,
			[popupTypes.GENERAL_MESSAGE]: <GeneralMessage {...popupProps} />,
			[popupTypes.UPSALE]: <UpSalePopup {...popupProps} />,
			[popupTypes.BUILDER]: <BuilderPopup {...popupProps} />,
			[popupTypes.PRODUCT]: <ProductPopup {...popupProps} />,
			[popupTypes.MIX_INFO]: <MixInfoPopup {...popupProps} />,
			[popupTypes.REGISTER]: <RegisterPopup {...popupProps} />,
			[popupTypes.DELIVERY]: <DeliveryPopup {...popupProps} />,
			[popupTypes.TWO_ACTION]: <TwoActionPopup {...popupProps} />,
			[popupTypes.UPDATE]: <TwoActionPopup {...popupProps} />,
			[popupTypes.BASIC_BLUR]: <BasicBlurPopup {...popupProps} />,
			[popupTypes.PRICE_LIST]: <PriceListPopup {...popupProps} />,
			[popupTypes.SWITCH_MIX]: <SwitchMixPopup {...popupProps} />,
			[popupTypes.END_OF_SALE]: <EndOfSalePopup {...popupProps} />,
			[popupTypes.DUPLICATE_PIZZA]: <PizzaDuplicate {...popupProps} />,
			[popupTypes.ONBOARDING]: <OnBoardingPopup {...popupProps} />,
			[popupTypes.VEGAN_PIZZA]: <VeganPizzaPopup {...popupProps} />,
			[popupTypes.VEGAN_ERROR]: <VeganErrorPopup {...popupProps} />,
			[popupTypes.PIZZA_DETAILS]: <PizzaDetailsPopup {...popupProps} />,
			[popupTypes.TERM_OF_SERVICE]: <TermOfServicePopup {...popupProps} />,
			[popupTypes.SPECIAL_REQUEST_CART]: <SpecialRequestCart {...popupProps} />,
			[popupTypes.CHOOSE_QUARTER]: <ChooseQuarterPopup {...popupProps} />,
			[popupTypes.EDIT_PIZZA_NAME]: <EditPizzaNamePopup {...popupProps} />,
			[popupTypes.PERSONAL_BUILDER]: <PersonalBuilderPopup {...popupProps} />,
			[popupTypes.ORDER_DETAILS]: <OrderDetailsPopup {...popupProps} />,
			[popupTypes.PIZZA_SPECIAL_REQUESTS]: (
				<PizzaSpecialRequests {...popupProps} />
			),
			[popupTypes.REMAINING_UPGRADES]: <RemainingUpgradesModal {...popupProps} />,
			[popupTypes.ADD_CREDIT_CARD]: <AddCreditCardPopup {...popupProps} />,
			[popupTypes.IDENTIFICATION]: <IdentificationPopup {...popupProps} />,
			[popupTypes.SAVE_PIZZA]: <SavePizza {...popupProps} />,
			[popupTypes.LOGOUT]: <LogoutPopup {...popupProps} />,
			[popupTypes.CONTINUE_ACTIVE_ORDER]: (
				<ContinueActiveOrderPopup {...popupProps} />
			),
			[popupTypes.BRANCH_ABOUT_TO_CLOSE]: (
				<BranchAboutToClosePopup {...popupProps} />
			),
			[popupTypes.UNRESOLVED_CART_ITEMS]: (
				<UnresolvedCartItemsPopup {...popupProps} />
			),
			[popupTypes.WELCOME_COUPON]: <WelcomeCouponPopup {...popupProps} />,
			[popupTypes.ADD_CREDIT_CARD_FULLSCREEN]: (
				<AddCreditCardFullScreenPopup {...popupProps} />
			),
			[popupTypes.BIG_ORDERS_SUCCESS]: <BigOrdersSuccessPopup {...popupProps} />,
			[popupTypes.BIRTHDAY_EVENTS]: <BirthDayEventsPopup {...popupProps} />,
			[popupTypes.MINIMUM_PRICE]: <MinimumPricePopup {...popupProps} />,
			[popupTypes.DEV]: <DevPopup {...popupProps} />,
			[popupTypes.MENU_FILTERS]: <MenuFiltersPopup {...popupProps} />,
			[popupTypes.PROMOTIONAL_IMAGE_POPUP]: (
				<PromotionalImagePopup {...popupProps} />
			),
			[popupTypes.MIXED_UPGRADES_POPUP]: <MixedUpgradesPopup {...popupProps} />,
			[popupTypes.PIZZA_DIPS]: <Dips {...popupProps} />,
			[popupTypes.MARKETING_SUBSCRIPTION]: (
				<MarketingSubscription {...popupProps} />
			),
		};

		const popupToReturn =
			type in popupComponents ? (
				popupComponents[type]
			) : (
				<BasicPopup
					key={key}
					id={payload.key}
					payload={{ text: "unknown popup type" }}
				/>
			);
		return popupToReturn;
	};

	const renderPopups = () => {
		const popupsToRender = popupsArray.map((popup, index) => {
			const key = `popup-${popup.type}-${popup.key}`;
			const isLastPopup = popupsArray.length - 1 === index;

			const popupComponent = getPopupComponent(key, popup.type, {
				...popup.payload,
				key: popup.key,
			});
			return (
				<ReactFocusTrap
					key={"focus-trap" + key}
					paused={!isLastPopup}
					priority={popup?.priority}>
					{popupComponent}
				</ReactFocusTrap>
			);
		});

		return popupsToRender;
	};

	// close the popup when back button is pressed instead of going to previous page
	const closePopupOnBackButton = () => {
		dispatch(Actions.removePopup());
	};

	const onKeyDown = (event) => {
		if (event.key === KEY_ESC) {
			closePopupOnBackButton();
		}
	};

	const activePopup = popupsArray[popupsArray.length - 1];

	return (
		<div
			className={"popup"}
			id="popupContainer"
			role={"dialog"}
			onKeyDown={onKeyDown}
			aria-modal={true}
			aria-describedby={"desc"}>
			{renderPopups()}
		</div>
	);
}
