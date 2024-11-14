import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";

import { useDispatch, useSelector } from "react-redux";

import Header from "./Header/Header";
import * as Routes from "constants/routes";

import styles from "./delivery.module.scss";

import * as deliveryScreensTypes from "constants/delivery-popup-screen-types";

import ChooseBranchFromList from "./pickup/ChooseBranchFromList";
import ChooseBranchWithLocation from "./pickup/ChooseBranchFromListOrMap";
import ChooseAddressFromList from "./delivery/ChooseAddressFromList";
import FutureOrder from "./FutureOrder/FutureOrder";
import NoBranch from "./delivery/NoBranch";
import AddressType from "./delivery/AddressType/AddressType";
import ChooseAddressFromMap from "./delivery/ChooseAddressFromMap/ChooseAddressFromMap";
import ClosedBranch from "./ClosedBranch";
import useStack from "hooks/useStack";
import STACK_TYPES from "../../../constants/stack-types";

import SlidePopup from "popups/Presets/SlidePopup";
import Actions from "redux/actions";
import SlideAnimation from "components/SlideAnimation/SlideAnimation";
import * as deliveryErrors from "constants/deliverability-errors";

import Api from "api/requests";

export default function DeliveryPopup(props) {
	const dispatch = useDispatch();
	const order = useSelector((store) => store.order);
	const stackState = useSelector(
		(store) => store.stackState[STACK_TYPES.DELIVERY],
	);
	const temporarilyNotKosher = useSelector(
		(store) => store.generalData.temporarilyNotKosher,
	);
	const { isPickup } = order;
	const router = useRouter();
	const [currentScreen, setStack, _goBack, _, resetStack] = useStack(
		STACK_TYPES.DELIVERY,
	);
	const [radioButton, setRadioButton] = useState(false);
	const ref = useRef();
	const promotionalAndOperationalPopups = useSelector(
		(store) => store.promoPopups,
	);

	useEffect(() => {
		if (isPickup) {
			setStack({
				type: deliveryScreensTypes.PICKUP,
				showHeader: true,
			});
		} else {
			setStack({
				type: deliveryScreensTypes.DELIVERY,
				showHeader: true,
			});
		}
	}, [isPickup]);

	useEffect(() => {
		return () => {
			resetStack();
		};
	}, []);

	function navigateToMenuScreen(res, isStopper = false) {
		const promoPopups = res?.data?.popups;
		const isNoPopups =
			!promoPopups && promotionalAndOperationalPopups.length === 0;

		if (isNoPopups || !isStopper) {
			dispatch(Actions.setTemporarilyNotKosher(false));
			animateOut();
			const timeout = setTimeout(() => {
				router.push(Routes.menu);

				clearTimeout(timeout);
			}, 300);
		} else animateOut();
	}

	function setDeliveryDetailsRejection(error) {
		if (error.message.id === deliveryErrors.NO_KOSHER_BRANCH_FOUND) {
			setStack({
				type: deliveryScreensTypes.NOBRANCH,
				params: { isKosher: true },
			});
		} else if (
			error.message.id === deliveryErrors.NO_ADDRESS_FOUND ||
			error.message.id === deliveryErrors.NO_STORE_DELIVER_NOW
		) {
			setStack({
				type: deliveryScreensTypes.NOBRANCH,
				params: {},
			});
		} else {
			Api.onFailure(error);
		}
	}

	function RenderPopup() {
		switch (currentScreen.type) {
			case deliveryScreensTypes.PICKUP:
				return (
					<ChooseBranchFromList
						params={currentScreen.params}
						navigateToMenuScreen={navigateToMenuScreen}
						animateOut={animateOut}
					/>
				);

			case deliveryScreensTypes.DELIVERY:
				return (
					<ChooseAddressFromList
						params={currentScreen.params}
						kosherCheckbox={radioButton}
						setKosherCheckbox={setRadioButton}
						navigateToMenuScreen={navigateToMenuScreen}
						animateOut={animateOut}
						setDeliveryDetailsRejection={setDeliveryDetailsRejection}
					/>
				);

			case deliveryScreensTypes.BRANCHWITHLOCATION:
				return (
					<ChooseBranchWithLocation
						animateOut={animateOut}
						params={currentScreen.params}
					/>
				);

			case deliveryScreensTypes.ADDRESSWITHLOCATION:
				return (
					<ChooseAddressFromMap
						animateOut={animateOut}
						params={currentScreen.params}
						kosherCheckbox={radioButton}
					/>
				);

			case deliveryScreensTypes.FUTUREORDER:
				return <FutureOrder params={currentScreen.params} />;

			case deliveryScreensTypes.ADDRESSTYPE:
				return (
					<AddressType
						params={currentScreen.params}
						animateOut={animateOut}
						kosherCheckbox={radioButton}
						navigateToMenuScreen={navigateToMenuScreen}
						setDeliveryDetailsRejection={setDeliveryDetailsRejection}
					/>
				);

			case deliveryScreensTypes.NOBRANCH:
				return <NoBranch params={currentScreen.params} />;

			case deliveryScreensTypes.CLOSEDBRANCH:
				return (
					<ClosedBranch
						params={currentScreen.params}
						navigateToMenuScreen={navigateToMenuScreen}
					/>
				);

			default:
				return (
					<div
						className={"visually-hidden"}
						tabIndex={0}
					/>
				); // Must for focusTrap to work!
		}
	}

	const animateOut = (callback) => {
		if (temporarilyNotKosher) {
			dispatch(Actions.setTemporarilyNotKosher(false));
		}
		const animateOutCallback = () => {
			resetStack();
			typeof callback === "function" && callback();
		};
		ref.current?.animateOut(animateOutCallback);
	};

	const handleAnimateOutCallback = () => {
		if (temporarilyNotKosher) {
			dispatch(Actions.setTemporarilyNotKosher(false));
		}
		currentScreen.type === deliveryScreensTypes.NOBRANCH
			? () => dispatch(Actions.removePopup())
			: resetStack;
	};

	return (
		<SlidePopup
			id={props.id}
			className={`${styles["delivery"]} ${styles[currentScreen.type]}`}
			ref={ref}
			animateOutCallback={handleAnimateOutCallback}>
			{currentScreen?.showHeader && <Header />}

			<SlideAnimation stack={STACK_TYPES.DELIVERY}>{RenderPopup()}</SlideAnimation>
		</SlidePopup>
	);
}
