import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Actions from "redux/actions";
import * as deliveryScreensTypes from "constants/delivery-popup-screen-types";
import Api from "api/requests";
import { AnimatedCapsule } from "components/AnimatedCapsule/AnimatedCapsule";
import SlideUpAndOpacityAnimation from "components/SlideUpAndOpacityAnimation/SlideUpAndOpacityAnimation";
import Button from "components/button";
import Checkbox from "components/forms/checkbox";

import TrashIcon from "/public/assets/icons/gray-trash.svg";
import FindAddress from "/public/assets/icons/find-address.svg";
import FullRadio from "/public/assets/icons/full-radio.svg";
import EmptyRadio from "/public/assets/icons/empty-radio.svg";
import AddAddress from "/public/assets/icons/add_address.svg";
import BadazIcon from "/public/assets/icons/kosher-symbol.svg";
import AddressAnimation from "animations/bike-animation.json";

import LottieAnimation from "components/LottieAnimation";

import styles from "./ChooseAddressFromList.module.scss";
import * as popupsTypes from "constants/popup-types";
import useStack from "hooks/useStack";
import STACK_TYPES from "constants/stack-types";

import useKosher from "hooks/useKosher";
import clsx from "clsx";
import useTranslate from "hooks/useTranslate";
import { handleKeyPress } from "../../../../components/accessibility/keyboardsEvents";
import { CHECKBOX_VARAINTS } from "constants/checkbox-variants";
import OrderStatusService from "services/OrderStatusService";
import { NO_ORDER_STATUS } from "constants/OrderStatus";
import AnalyticsService from "utils/analyticsService/AnalyticsService";
import SRContent from "../../../../components/accessibility/srcontent";
import Scrollbar from "components/Scrollbar";
import HiddableScroolBar from "components/HiddableScrollBar/HiddableScrollBar";

const defaultOptions = {
	loop: false,
	autoplay: true,
	animation: AddressAnimation,
};

const trailTime = 300;

export default function ChooseAddressFromList(props) {
	const {
		params = {},
		navigateToMenuScreen,
		animateOut,
		kosherCheckbox,
		setKosherCheckbox,
		setDeliveryDetailsRejection,
	} = props;
	const { selectedIndex = null } = params;
	const SCROLL_PADDING = 5;
	const dispatch = useDispatch();
	const [selectedAddress, setSelectedAddress] = useState("");
	const [_, setStack] = useStack(STACK_TYPES.DELIVERY);
	const translate = useTranslate();
	const deviceState = useSelector((store) => store.deviceState);
	const listRef = useRef(null);
	const listContentRef = useRef(null);
	const addresses = useSelector((store) => store.userData?.addresses);
	const temporarilyNotKosher = useSelector(
		(store) => store.generalData.temporarilyNotKosher,
	);

	const [showTopGradient, setShowTopGradient] = useState(false);
	const [showBottomGradient, setShowBottomGradient] = useState(
		addresses?.length > 3,
	);
	const [isContentBiggerThanList, setIsContentBiggerThenList] = useState(true);

	const hasAddresses = addresses?.length > 0;
	const isKosher = useKosher();

	const checkedForAddresses = useRef(false);

	let promiseTime = 0;
	let selectedtAddressObejct = {};
	if (selectedAddress !== "" && addresses) {
		selectedtAddressObejct = addresses[selectedAddress];
		promiseTime = selectedtAddressObejct?.deliverability?.promiseTime;
	}

	useEffect(() => {
		const payload = {
			storetypes: temporarilyNotKosher
				? []
				: kosherCheckbox || isKosher
				? ["Kosher"]
				: [],
		};

		function onSuccess() {
			checkedForAddresses.current = true;
		}

		Api.getCustomerAddresses({ payload, onSuccess });
	}, [kosherCheckbox]);

	useEffect(() => {
		if (addresses && checkedForAddresses.current) {
			if (addresses.length === 0) {
				onNoAddressesFoundButtonPress(true);
			}
		}
	}, [addresses]);

	useEffect(() => {
		if (addresses?.length > 0 && listRef.current && listContentRef.current) {
			const listrefHeight = listRef.current.clientHeight;
			const listContentrefHeight = listContentRef.current.clientHeight;
			setIsContentBiggerThenList(listrefHeight - 1 < listContentrefHeight);
		}
	}, [listRef, listContentRef, addresses?.length]);

	useEffect(() => {
		if (selectedIndex && addresses) {
			onAddressChange(selectedIndex);
		}
	}, [selectedIndex, addresses]);

	function renderKosherSection() {
		const hasSelectedAddress = typeof selectedAddress === "number";
		if (!isKosher) {
			return (
				<div
					className={clsx(
						styles["kosher-wrapper"],
						hasSelectedAddress ? "" : styles["no-selected"],
					)}>
					<div
						className={styles["kosher-content-wrapper"]}
						onKeyDown={(event) =>
							handleKeyPress(event, () => setKosherCheckbox((prev) => !prev))
						}>
						<Checkbox
							tabIndex={0}
							type="checkbox"
							value={kosherCheckbox}
							id={"checkbox"}
							onChange={() => {
								dispatch(Actions.resetUnsavedAddresses());
								setKosherCheckbox((prev) => !prev);
								setSelectedAddress("");
							}}
							variant={CHECKBOX_VARAINTS.DARK}
							label={
								translate("deliveryPopup_chooseAddressFromList_kosherLabel1") +
								translate("deliveryPopup_chooseAddressFromList_kosherLabel2")
							}
							hideLabel={true}
						/>
						<div className={styles["kosher-text-wrapper"]}>
							<h5 className={styles["kosher-text"]}>
								{translate("deliveryPopup_chooseAddressFromList_kosherLabel1")}
							</h5>
							<h5 className={styles["kosher-bold-text"]}>
								{translate("deliveryPopup_chooseAddressFromList_kosherLabel2")}
							</h5>
						</div>
						<div className={styles["kosher-icon"]}>
							<img
								src={BadazIcon.src}
								alt={""}
							/>
						</div>
					</div>
				</div>
			);
		} else {
			return (
				<div className={styles["only-kosher-wrapper"]}>
					<div className={styles["only-kosher-icon"]}>
						<img
							src={BadazIcon.src}
							aria-hidden={true}
						/>
					</div>
					<div className={styles["only-kosher-text-wrapper"]}>
						<h5
							className={styles["only-kosher-text"]}
							tabIndex={0}>
							{translate(
								`deliveryPopup_sentFromKosherBranchesMessage_text${
									deviceState.isMobile ? "" : "1"
								}`,
							)}
						</h5>
						{!deviceState.isMobile && (
							<h5
								className={clsx(styles["only-kosher-text"], styles["bold"])}
								tabIndex={0}>
								{translate("deliveryPopup_sentFromKosherBranchesMessage_text2")}
							</h5>
						)}
					</div>
				</div>
			);
		}
	}

	function onNoAddressesFoundButtonPress(didSkipPage = false) {
		setStack({
			type: deliveryScreensTypes.ADDRESSWITHLOCATION,
			showHeader: false,
			params: { didSkipPage },
		});
	}

	function RenderNoAddresses() {
		return (
			<div className={styles["no-addresses-found-wrapper"]}>
				<div className={styles["no-addresses-found-image-wrapper"]}>
					<img
						src={FindAddress.src}
						className={styles["no-addresses-found-image"]}
						alt={""}
					/>
				</div>
				<div aria-live={"polite"}>
					<h3
						className={clsx(
							styles["no-addresses-found-title"],
							styles["no-addresses-found-title-1"],
						)}
						tabIndex={0}>
						{translate("deliveryPopup_notFound_title")}
					</h3>
					<h3
						className={clsx(
							styles["no-addresses-found-title"],
							styles["no-addresses-found-title-2"],
						)}
						tabIndex={0}>
						{translate("deliveryPopup_noAddressesFound_subtitle")}
					</h3>
				</div>

				<Button
					className={styles["no-addresses-found-button"]}
					textClassName={styles["no-addresses-found-button-text"]}
					text={translate("deliveryPopup_noAddressesFound_buttonLabel")}
					onClick={onNoAddressesFoundButtonPress}
				/>
			</div>
		);
	}

	function RenderAddressesList() {
		const addressesList = [];
		for (const index in addresses) {
			const address = addresses[index];

			const component = (
				<div
					className={styles["branch-item"]}
					key={"address-item" + index}>
					<Address
						index={index}
						id={address.id}
						isSelected={parseInt(selectedAddress, 10) === parseInt(index, 10)}
						onChange={onAddressChange}
						address={address}
						notifyOnceNotKosher={
							address?.deliverability?.outOfSelectedStoreTypesDeliveryArea
						} // Disabled for kosher && distance reasons
						isDisabled={address?.deliverability?.outOfDeliveryArea} //Disabled for distance reasons
						setStack={setStack}
					/>
				</div>
			);
			addressesList.push(component);
		}
		return addressesList;
	}

	function onAddressChange(id) {
		setSelectedAddress(parseInt(id, 10));

		fillMissingAddressData(id);
	}

	function RenderAddAddress() {
		return (
			<div
				className={styles["add-branch-wrapper"]}
				key={"add-branch-item"}
				onClick={onDifferentAddressPress}>
				<button className={styles["add-branch"]}>
					<div className={styles["add-branch-icon-wrapper"]}>
						<img
							src={AddAddress.src}
							className={styles["add-branch-icon"]}
							alt={"branch"}
							aria-hidden={true}
						/>
					</div>
					<span
						className={styles["different-brancn-label"]}
						tabIndex={0}>
						{translate("deliveryPopup_diffrentAddress_label")}
					</span>
				</button>
			</div>
		);
	}

	function checkForActiveOrder(callback) {
		dispatch(Actions.resetMenus());
		dispatch(Actions.clearAllPath());
		OrderStatusService.getStatus(NO_ORDER_STATUS, callback, onDisallowed);

		function onDisallowed() {
			animateOut();

			dispatch(
				Actions.addPopup({
					type: popupsTypes.CONTINUE_ACTIVE_ORDER,
					payload: {
						onDeclineCallback: callback,
					},
				}),
			);
		}
	}

	function onTimeSelectedPress() {
		checkForActiveOrder(() => {
			fillMissingAddressData(selectedAddress, () => {
				const payload = formatSetDeliveryDetailsPayload();
				Api.setDeliveryDetails({
					payload,
					onSuccessCB: navigateToMenuScreen,
					onRejectionCB: setDeliveryDetailsRejection,
				});
			});
		});
		const shippingInfo = {
			shipping_tier: `pickup - ${promiseTime}`,
			affiliation: selectedtAddressObejct.name,
		};
		AnalyticsService.chooseShippmentTime(`${promiseTime} minutes`);
		AnalyticsService.shippingInfo(shippingInfo);
	}

	function onDifferentAddressPress() {
		setStack({
			type: deliveryScreensTypes.ADDRESSWITHLOCATION,
			showHeader: false,
			params: {},
		});
		AnalyticsService.chooseShippmentLocation("new location");
	}

	function formatSetDeliveryDetailsPayload(time = undefined) {
		const datetime = time?.date + " " + time?.hour + ":" + time?.minute;

		let addressType = selectedtAddressObejct?.type;
		if (selectedtAddressObejct.isNotSaved) {
			addressType =
				selectedtAddressObejct?.type?.startsWith("address") ||
				selectedtAddressObejct?.type?.startsWith("poi")
					? selectedtAddressObejct?.type?.toLowerCase()
					: `${
							selectedtAddressObejct.isPoi ? "poi" : "address"
					  }/${(selectedtAddressObejct?.type).toLowerCase()}`;
		}

		const isPoi = selectedtAddressObejct.isPoi;
		const address = isPoi ? "" : selectedtAddressObejct?.fullAddress;
		const street = isPoi
			? selectedtAddressObejct?.fullAddress
			: selectedtAddressObejct?.street;

		const payload = {
			address,
			addresstype: addressType,
			saveaddress: selectedtAddressObejct?.saveaddress
				? selectedtAddressObejct.saveaddress
				: false,
			storetypes: temporarilyNotKosher
				? []
				: kosherCheckbox || isKosher
				? ["Kosher"]
				: [],
			Entrance: selectedtAddressObejct?.entrance,
			Floor: selectedtAddressObejct?.floor,
			timedto: time ? datetime : "",
			Apt:
				selectedtAddressObejct?.apt?.length > 0 ? selectedtAddressObejct?.apt : "0",
			city: selectedtAddressObejct?.city,
			street,
			houseNo: selectedtAddressObejct?.addressNo,
			DeliveryInstructions: selectedtAddressObejct?.deliveryInstructions,
		};

		return payload;
	}

	const onTimePicked = (time) => {
		checkForActiveOrder(() => {
			const payload = formatSetDeliveryDetailsPayload(time);
			Api.setDeliveryDetails({
				payload,
				onSuccessCB: navigateToMenuScreen,
				onRejectionCB: setDeliveryDetailsRejection,
			});
		});
	};

	function onFutureOrderPress() {
		fillMissingAddressData(selectedAddress, () => {
			setStack({
				type: deliveryScreensTypes.FUTUREORDER,
				showHeader: true,
				params: {
					address: addresses[selectedAddress],
					isPickup: false,
					onSuccess: onTimePicked,
				},
			});
		});
		const shippingInfo = {
			shipping_tier: `pickup - later`,
			affiliation: selectedtAddressObejct.name,
		};
		AnalyticsService.chooseShippmentTime("later");
		AnalyticsService.shippingInfo(shippingInfo);
	}

	function onScrollList(e) {
		const window = e.target;
		const { scrollTop, scrollHeight, offsetHeight } = window;
		const isAtTheTop = scrollTop === 0;

		setShowTopGradient(!isAtTheTop);

		const isBottomReached =
			scrollTop < scrollHeight - offsetHeight - SCROLL_PADDING;
		setShowBottomGradient(isBottomReached);
	}

	function RenderAddresses() {
		if (!hasAddresses) {
			return null;
		}
		let btnAcceptText = translate("deliveryPopup_accept_btn");
		let isSelectedAddressAvailable = true;
		if (selectedAddress !== "") {
			isSelectedAddressAvailable =
				selectedtAddressObejct?.deliverability?.deliverNow;
			btnAcceptText = btnAcceptText.replace("{time}", `${promiseTime}`);
		}

		const addressesListLength = addresses.length;
		let delay = addressesListLength;
		if (addressesListLength > 3) {
			delay = 3;
		}
		delay += 0.5;

		return (
			<div className={styles["delivery-existing-branches-select-wrapper"]}>
				<SRContent
					role={"alert"}
					message={translate("delivery_deliveryFee_tilte")}
				/>
				<div className={styles["animation-wrapper-branch"]}>
					<LottieAnimation {...defaultOptions} />
				</div>
				<h1
					aria-live={"polite"}
					className={styles["title"]}
					tabIndex={0}>
					{translate("delivery_popup_choosing_address_title")}
				</h1>
				<div className={styles["branches-list-container"]}>
					<Scrollbar
						onScroll={onScrollList}
						className={styles["branches-list-wrapper"]}>
						<SlideUpAndOpacityAnimation
							className={styles["branches-wrapper"]}
							list={RenderAddressesList()}
							trail={trailTime}
							ref={listContentRef}
						/>

						{showTopGradient && isContentBiggerThanList && (
							<div
								className={clsx(
									styles["linear-gradient"],
									styles["linear-gradient-top"],
								)}
							/>
						)}
						{showBottomGradient && isContentBiggerThanList && (
							<div
								className={clsx(
									styles["linear-gradient"],
									styles["linear-gradient-bottom"],
								)}
							/>
						)}
					</Scrollbar>
				</div>
				<SlideUpAndOpacityAnimation
					className={styles["add-branch-container"]}
					list={[RenderAddAddress()]}
					delay={delay * trailTime}
				/>
				{selectedAddress !== "" ? (
					<div
						className={clsx(
							styles["actions"],
							isKosher || !isKosher ? styles["has-kosher"] : "",
						)}>
						{isSelectedAddressAvailable && (
							<div className={styles["btn-position"]}>
								<AnimatedCapsule
									bluePillText={translate("deliveryPopup_decline_btn")}
									redPillText={btnAcceptText}
									redPillOnPress={onTimeSelectedPress}
									bluePillOnPress={onFutureOrderPress}
								/>
							</div>
						)}
						{!isSelectedAddressAvailable && (
							<div className={styles["btn-position"]}>
								<Button
									className={styles["future-order"]}
									text={translate("deliveryPopup_futureOrder_ButtonLabel")}
									onClick={onFutureOrderPress}
								/>
							</div>
						)}
					</div>
				) : (
					<span
						className={styles["delivery-fee-title"]}
						tabIndex={0}>
						{translate("delivery_deliveryFee_tilte")}
					</span>
				)}
				{renderKosherSection()}
				{/* {generalData.kosher !== "1" ? renderKosherSection():renderOnlyKosherSection()} */}
			</div>
		);
	}

	function fillMissingAddressData(id, elseCallback) {
		const address = addresses[id];

		if (address?.inComplete) {
			const payload = {};
			const isPoi = address.type.includes("poi");
			if (!isPoi) {
				payload.address = address.fullAddress;
				payload.city = address.city;
				payload.Street = address.street;
				payload.houseNo = address.addressNo;
				payload.addressType = "address";
			} else {
				payload.addressType = "pointOfInterest";
				payload.street = address.description;
				payload.city = address.city;
			}
			payload.storetypes = isKosher || kosherCheckbox ? ["Kosher"] : [];

			function onSuccessCB(res) {
				const payload = {
					address: {
						location: address.fullAddress,
						city: address.city,
						street: address.street,
						hnum: address.addressNo,
					},
					...res.data,
					id: address.id,
					isPoi: isPoi,
				};

				dispatch(Actions.updateAddAddressForm(payload));
				setStack({
					type: deliveryScreensTypes.ADDRESSTYPE,
					showHeader: false,
					params: {
						...payload,
					},
				});
			}

			Api.getAddressDeliverability({
				payload,
				onSuccessCB,
				onRejectionCB: setDeliveryDetailsRejection,
			});
		} else {
			typeof elseCallback === "function" && elseCallback();
		}
	}

	return RenderAddresses();
}

function Address(props) {
	const {
		isSelected,
		onChange,
		address,
		index,
		isDisabled = false,
		setStack,
		notifyOnceNotKosher = false,
	} = props;
	const { isPoi = false } = address;
	const translate = useTranslate();
	const radioImage = isSelected ? FullRadio : EmptyRadio;

	function onClick() {
		if (isDisabled) return;

		if (!notifyOnceNotKosher) {
			onChange(index);
		} else {
			setStack({
				type: deliveryScreensTypes.NOBRANCH,
				params: {
					isKosher: "true222",
					handleSpecialDelivery: naviagateToDelivery,
				},
			});
		}
		AnalyticsService.chooseShippmentLocation("existing location");
	}

	function naviagateToDelivery() {
		setStack({
			type: deliveryScreensTypes.DELIVERY,
			params: {
				selectedIndex: index,
			},
		});
	}

	function onDeleteAddress(e) {
		e?.stopPropagation();
		Api.deleteAddress({ payload: { uniqueId: address.id } });
	}

	return (
		<button
			className={styles["address-wrapper"]}
			onClick={onClick}
			tabIndex={0}
			role={"radio"}
			aria-checked={isSelected}>
			<div className={styles["address-container"]}>
				<div className={styles["address-details"]}>
					<div className={styles["radio-wrapper"]}>
						<img
							src={radioImage.src}
							className={styles["radio"]}
							aria-hidden={true}
						/>
					</div>
					<div className={styles["address-content-wrapper"]}>
						<h3
							className={clsx(
								styles["address-text"],
								isDisabled ? styles["disabled"] : "",
								isSelected ? styles["selected"] : "",
							)}
							tabIndex={0}>
							{address.fullAddress}
						</h3>
					</div>
				</div>
				{isDisabled ? (
					<button
						onClick={onDeleteAddress}
						className={styles["delete-address-btn"]}>
						<div className={styles["delete-address-icon"]}>
							<img src={TrashIcon.src} />
						</div>
					</button>
				) : null}
			</div>
			{isDisabled ? (
				<span
					className={styles["disabled-disclaimer"]}
					tabIndex={0}>
					{translate("deliveryPopup_addressOutOfDeliveryArea_label")}
				</span>
			) : null}
		</button>
	);
}
