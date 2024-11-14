import React, { useEffect, useRef, useState } from "react";
import { animated, useSpring } from "@react-spring/web";
import { useDispatch, useSelector } from "react-redux";

import Actions from "redux/actions";
import * as addressTypes from "constants/address-types";
import * as deliveryScreensTypes from "constants/delivery-popup-screen-types";

import SlideUpAndOpacityAnimation from "components/SlideUpAndOpacityAnimation/SlideUpAndOpacityAnimation";
import AddressTypeBlock from "./AddressTypeBlock/AddressTypeBlock";
import DeliveryHeader from "../DeliveryHeader/DeliveryHeader";

import FlatAmimation from "animations/addressTypes/flat.json";
import HouseAmimation from "animations/addressTypes/house.json";
import OfficeAmimation from "animations/addressTypes/office.json";
import OutsideAmimation from "animations/addressTypes/outside.json";
import Flat from "/public/assets/icons/addressTypes/flat.svg";
import House from "/public/assets/icons/addressTypes/house.svg";
import Outide from "/public/assets/icons/addressTypes/outside.svg";
import Office from "/public/assets/icons/addressTypes/office.svg";

import styles from "./AddressType.module.scss";
import DifferentAddressForm from "../DifferentAddressForm/DifferentAddressForm";
import STACK_TYPES from "constants/stack-types";
import useStack from "hooks/useStack";
import clsx from "clsx";
import useTranslate from "hooks/useTranslate";
import { createAccessibilityText } from "../../../../../components/accessibility/acfunctions";
import SRContent from "../../../../../components/accessibility/srcontent";
import { TAB_INDEX_HIDDEN } from "../../../../../constants/accessibility-types";

function AddressType(props) {
	const translate = useTranslate();

	const [selectedIndex, setSelectedIndex] = useState(false);
	const [showForm, setShowForm] = useState(false);
	const dispatch = useDispatch();
	const form = useSelector((store) => store.addAddressForm);
	const [hideClass, setHideClass] = useState("");
	const wrapperRef = useRef(null);
	const imageStyle = useRef(null);
	const [imageClassName, setImageClassName] = useState("");
	const [formClassName, setFormClassName] = useState("");
	const {
		params,
		animateOut = () => {},
		navigateToMenuScreen,
		setDeliveryDetailsRejection,
		kosherCheckbox,
	} = props;

	const types = useSelector((store) => store.addAddressForm?.addressTypes);
	const selectedType = useSelector((store) => store.addAddressForm?.addressType);
	const isOneType = types.length === 1;
	const { address, shouldShowFormByDefault = false, resetForm = true } = params;
	const [shouldShowFormByDefaultState, setShouldShowFormByDefaultState] =
		useState(shouldShowFormByDefault);
	const [shouldResetForm, setShouldResetForm] = useState(resetForm);
	const [disableSlideUp, setDisableSlideUp] = useState(false);
	const [_, setStack, goBack] = useStack(STACK_TYPES.DELIVERY);

	const data = [
		{
			id: addressTypes.APARTMENT,
			text: translate("deliveryPopup_addressType_flat"),
			lottie: FlatAmimation,
			image: Flat.src,
		},
		{
			id: addressTypes.HOUSE,
			text: translate("deliveryPopup_addressType_house"),
			lottie: HouseAmimation,
			image: House.src,
		},
		{
			id: addressTypes.OFFICE,
			text: translate("deliveryPopup_addressType_office"),
			lottie: OfficeAmimation,
			image: Office.src,
		},
		{
			id: addressTypes.OUT,
			text: translate("deliveryPopup_addressType_outside"),
			lottie: OutsideAmimation,
			image: Outide.src,
		},
	];
	const [currentImagePosition, setCurrentImagePosition] = useState({
		top: 0,
		left: 0,
	});
	const [imagePositionBasedScreen, setImagePositionBasedScreen] = useState({
		x: 0,
		y: 0,
	});

	useEffect(() => {
		if (shouldShowFormByDefaultState && selectedType) {
			const index = types.findIndex((t) => t === selectedType);
			setShowForm(true);
			setSelectedIndex(index);
		}
	}, [shouldShowFormByDefaultState, selectedType]);

	useEffect(() => {
		if (wrapperRef.current && !isOneType) {
			const rect = wrapperRef.current.getBoundingClientRect();

			const imageX = imagePositionBasedScreen?.x - rect.x;
			const imageY = imagePositionBasedScreen?.y - rect.y;
			setCurrentImagePosition({ top: imageY, left: imageX });
		}
	}, [wrapperRef, imagePositionBasedScreen]);

	useEffect(() => {
		if (
			!isOneType &&
			currentImagePosition.top !== imageStyle.current?.top &&
			currentImagePosition.left !== imageStyle.current?.left
		) {
			imageStyle.current = {
				top: currentImagePosition.top,
				left: currentImagePosition.left,
			};
		}
	}, [currentImagePosition, imageStyle]);

	useEffect(() => {
		if (selectedIndex !== false) {
			dispatch(
				Actions.updateAddAddressForm({
					addressType: data[selectedIndex].id,
				}),
			);
		}
	}, [selectedIndex, dispatch]);

	useEffect(() => {
		if (isOneType) {
			for (const index in data) {
				const item = data[index];
				if (item.id === types[0]) {
					setSelectedIndex(index);
					setShowForm(true);
				}
			}
		}
	}, [types]);

	useEffect(() => {
		const delayTime = types.length * 300;
		let timer1 = null;
		let timer2 = null;
		let timer3 = null;
		if (shouldShowFormByDefaultState) {
			setImageClassName(styles["active"]);
			setFormClassName("active");
			setHideClass(styles["hide"]);
		} else if (!showForm && !isOneType) {
			setHideClass("");
			setImageClassName("");
			setFormClassName("");
		} else if (showForm && !isOneType) {
			// add class hide to btns and title
			timer1 = setTimeout(() => {
				setHideClass(styles["hide"]);
			}, delayTime);

			//   moving the image
			timer2 = setTimeout(() => {
				setImageClassName(styles["active"]);
			}, delayTime - 100);

			// showing the form
			timer3 = setTimeout(() => {
				setFormClassName("active");
			}, 1500);
		} else {
			setHideClass(styles["hide"]);
			setImageClassName(styles["active"]);
			setCurrentImagePosition(null);

			timer3 = setTimeout(() => {
				setFormClassName("active");
			}, 500);
		}
		return () => {
			timer1 && clearTimeout(timer1);
			timer2 && clearTimeout(timer2);
			timer3 && clearTimeout(timer3);
		};
	}, [showForm, shouldShowFormByDefaultState]);

	const animatedTitleStyle = useSpring({
		to: { opacity: 1 },
		from: { opacity: 0 },
		delay: 300,
		config: { duration: 300 },
	});
	const hideAnimatedTitleStyle = useSpring({
		to: { opacity: 0 },
		from: { opacity: 1 },
		delay: 300,
	});

	function onClickAddressType(index) {
		setSelectedIndex(index);
		setTimeout(() => {
			setDisableSlideUp(false);

			setShowForm(true);
		}, 300);
	}

	function RenderAddressType(list) {
		const addressesTypes = [];

		list.map((item, index) => {
			if (types.includes(item.id)) {
				const component = (
					<AddressTypeBlock
						lottie={item.lottie}
						text={item.text}
						isSelected={index === selectedIndex}
						id={item.id}
						onClick={onClickAddressType}
						index={index}
						key={index}
						setCurrentImagePosition={setImagePositionBasedScreen}
					/>
				);
				addressesTypes.push(component);
			}
			return null;
		});
		return addressesTypes;
	}

	function onBackPressWhenForm() {
		setShowForm(false);
		setShouldShowFormByDefaultState(false);
		setDisableSlideUp(true);
		setShouldResetForm(true);
	}

	function onImagePress() {
		if (isOneType) {
			goBack();
		} else {
			onBackPressWhenForm();
		}
	}
	const srText = createAccessibilityText(
		address?.location
			? address?.location
			: translate("deliveryPopup_delivery_chooseBranch_HeaderTitle"),
		translate("deliveryPopup_addressType_title"),
	);
	return (
		<div
			className={styles["address-type-wrapper"]}
			ref={wrapperRef}>
			<SRContent
				role={"alert"}
				message={srText}
			/>
			<DeliveryHeader
				address={address?.location ?? address?.description}
				didAnimateAddress={!isOneType}
				onBackPressHandler={
					showForm && !isOneType ? onBackPressWhenForm : undefined
				}
				animateOut={animateOut}
			/>
			{showForm && (
				<div
					onClick={onImagePress}
					className={clsx(styles["address-type-image-wrapper"], imageClassName)}
					style={currentImagePosition}>
					<img
						src={data[selectedIndex]?.image}
						alt={""}
						aria-hidden={true}
					/>
				</div>
			)}

			<animated.div
				className={clsx(styles["address-type-title-wrapper"], hideClass)}
				style={showForm ? hideAnimatedTitleStyle : animatedTitleStyle}>
				<h1
					tabIndex={TAB_INDEX_HIDDEN}
					className={styles["title"]}>
					{translate("deliveryPopup_addressType_title")}
				</h1>
			</animated.div>

			<SlideUpAndOpacityAnimation
				trail={!showForm ? 300 : 200}
				delay={!showForm ? 300 : 0}
				list={RenderAddressType(data)}
				className={styles["address-types"]}
				hideClassName={hideClass}
				hide={showForm}
				disabled={disableSlideUp}
				leave={{ opacity: 0 }}
			/>

			{showForm && (
				<DifferentAddressForm
					kosherCheckbox={kosherCheckbox}
					type={form.addressType}
					className={formClassName}
					animateOut={animateOut}
					navigateToMenuScreen={navigateToMenuScreen}
					setDeliveryDetailsRejection={setDeliveryDetailsRejection}
					shouldResetForm={shouldResetForm}
				/>
			)}
		</div>
	);
}

export default AddressType;
