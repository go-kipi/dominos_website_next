import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import AnimatedInput from "components/forms/animated_input";
import Checkbox from "components/forms/checkbox";
import AnimatedTextArea from "components/forms/animated_textarea";

import Validate from "utils/validation";

import Actions from "redux/actions";

import * as addressTypes from "constants/address-types";

import styles from "./DifferentAddressForm.module.scss";
import Button from "components/button";
import clsx from "clsx";
import useTranslate from "hooks/useTranslate";
import { handleKeyPress } from "../../../../../components/accessibility/keyboardsEvents";
import { CHECKBOX_VARAINTS } from "constants/checkbox-variants";
import AnalyticsService from "utils/analyticsService/AnalyticsService";
import { AnimatedCapsule } from "components/AnimatedCapsule/AnimatedCapsule";
import OrderStatusService from "services/OrderStatusService";
import { NO_ORDER_STATUS } from "constants/OrderStatus";

import Api from "api/requests";

import * as popupsTypes from "constants/popup-types";
import useStack from "hooks/useStack";
import STACK_TYPES from "constants/stack-types";
import * as deliveryScreensTypes from "constants/delivery-popup-screen-types";
import useKosher from "hooks/useKosher";

const allFormInputs = [
	"deliveryInstructions",
	"apt",
	"floor",
	"ent",
	"bussiness",
];
let formInputs = [];

function DifferentAddressForm(props) {
	const {
		type,

		className = "",
		animateOut,
		navigateToMenuScreen,
		setDeliveryDetailsRejection,
		shouldResetForm = true,
		kosherCheckbox,
	} = props;
	const dispatch = useDispatch();
	const [firstTry, setFirstTry] = useState(true);
	const [isFormValid, setIsFormValid] = useState(false);
	const translate = useTranslate();
	const [_, setStack] = useStack(STACK_TYPES.DELIVERY);
	const [isBtnActive, setIsBtnActive] = useState(false);
	const isKosher = useKosher();
	const temporarilyNotKosher = useSelector(
		(store) => store.generalData.temporarilyNotKosher,
	);

	const [formValidate, setFormValidate] = useState({
		deliveryInstructions: {
			valid: false,
			ref: useRef(),
			errMsg: "",
			rules: ["notes_for_courier"],
		},
		apt: {
			valid: false,
			ref: useRef(),
			errMsg: "",
			rules: ["not_empty", "apartment"],
		},
		floor: {
			valid: false,
			ref: useRef(),
			errMsg: "",
			rules: ["not_empty", "floor"],
		},
		ent: {
			valid: false,
			ref: useRef(),
			errMsg: "",
			rules: ["entrance"],
		},
		bussiness: {
			valid: false,
			ref: useRef(),
			errMsg: "",
			rules: ["bussiness_name"],
		},
	});

	const form = useSelector((store) => store.addAddressForm);
	const fullAddress = form.address.location ?? form.address.description;

	useEffect(() => {
		let timer = setTimeout(() => {
			setIsBtnActive(true);
		}, 2000);
		return () => {
			clearTimeout(timer);
		};
	}, []);

	useEffect(() => {
		if (shouldResetForm) {
			resetForm();

			dispatch(
				Actions.updateAddAddressForm({
					saveAddress: true,
				}),
			);
		}
	}, []);

	function resetForm() {
		const payload = {};
		for (const key in allFormInputs) {
			const field = allFormInputs[key];
			payload[field] = "";
		}
		dispatch(Actions.updateAddAddressForm(payload));
	}

	function onChangeInput(e) {
		const name = e.target.name;
		const value = e.target.value;
		setFirstTry(true);

		const validationObj = Validate(value, formValidate[name].rules);

		const newState = { ...formValidate };
		newState[name].valid = validationObj.valid;
		newState[name].errMsg = validationObj.msg;

		setFormValidate(newState);

		dispatch(
			Actions.updateAddAddressForm({
				[name]: value,
			}),
		);
	}

	function onSaveAddressPress() {
		dispatch(
			Actions.updateAddAddressForm({
				saveAddress: !form.saveAddress,
			}),
		);
	}

	function showErrorBtnHandler() {
		return !firstTry && !isFormValid;
	}

	function showError(field) {
		return !firstTry && !formValidate[field].valid;
	}

	function onSubmit(callback) {
		let formValid = true;
		const newState = { ...formValidate };
		let validationObj;
		let firstInvalidRef = null;

		for (const key in formInputs) {
			const field = formInputs[key];

			validationObj = Validate(form[field], formValidate[field].rules);

			newState[field].valid = validationObj.valid;
			newState[field].errMsg = validationObj.msg;

			if (!validationObj.valid && !firstInvalidRef) {
				firstInvalidRef = newState[field]?.ref;
				formValid = false;
			}
		}

		setFormValidate(newState);
		setFirstTry(false);
		setIsFormValid(formValid);

		if (formValid) {
			typeof callback === "function" && callback();

			AnalyticsService.chooseNewShippmentLocation("new location", type);
		} else {
			firstInvalidRef?.current?.focus();
		}
	}

	function RenderNoteForCourier() {
		return (
			<div className={styles["notes-container"]}>
				<div
					className={clsx(
						styles["input-container"],
						styles["notes-input-container"],
					)}>
					<AnimatedTextArea
						name="deliveryInstructions"
						value={form.deliveryInstructions}
						onChange={onChangeInput}
						showCloseIcon={true}
						showError={showError("deliveryInstructions")}
						errorMsg={formValidate.deliveryInstructions.errMsg}
						placeholder={translate("deliveryPopup_addressTypeForm_notes")}
						className=""
						shouldGrow={true}
					/>
				</div>
			</div>
		);
	}

	function RenderAptForm() {
		return (
			<div className={styles["form"]}>
				<div className={styles["apt-form-inputs"]}>
					<div
						className={clsx(
							styles["input-container"],
							styles["apt-input-container"],
							styles["apt-form-input-container"],
						)}>
						<AnimatedInput
							ref={formValidate.apt.ref}
							name="apt"
							value={form.apt}
							onChange={onChangeInput}
							showCloseIcon={true}
							showError={showError("apt")}
							errorMsg={formValidate.apt.errMsg}
							placeholder={
								translate("deliveryPopup_addressTypeForm_apt") + translate("asterisk")
							}
							className=""
							errorClassName={styles["form-error-text"]}
							type={"number"}
							extraStyles={styles}
							ariaRequired={true}
						/>
					</div>
					<div
						className={clsx(
							styles["input-container"],
							styles["floor-input-container"],
							styles["apt-form-input-container"],
						)}>
						<AnimatedInput
							ref={formValidate.floor.ref}
							name="floor"
							value={form.floor}
							onChange={onChangeInput}
							showCloseIcon={true}
							showError={showError("floor")}
							errorMsg={formValidate.floor.errMsg}
							placeholder={
								translate("deliveryPopup_addressTypeForm_floor") + translate("asterisk")
							}
							className=""
							errorClassName={styles["form-error-text"]}
							type={"number"}
							extraStyles={styles}
							ariaRequired={true}
						/>
					</div>
					<div
						className={clsx(
							styles["input-container"],
							styles["ent-input-container"],
							styles["apt-form-input-container"],
						)}>
						<AnimatedInput
							ref={formValidate.ent.ref}
							name="ent"
							value={form.ent}
							onChange={onChangeInput}
							showCloseIcon={true}
							showError={showError("ent")}
							errorMsg={formValidate.ent.errMsg}
							placeholder={translate("deliveryPopup_addressTypeForm_ent")}
							className=""
							errorClassName={styles["form-error-text"]}
							extraStyles={styles}
						/>
					</div>
				</div>
				<div className={styles["notes-for-courier-wrapper"]}>
					{RenderNoteForCourier()}
				</div>
			</div>
		);
	}

	function RenderOfficeForm() {
		return (
			<div className={styles["form"]}>
				<div className={styles["office-form-inputs"]}>
					<div
						className={clsx(
							styles["input-container"],
							styles["floor-input-container"],
							styles["office-form-input-container"],
						)}>
						<AnimatedInput
							ref={formValidate.floor.ref}
							name="floor"
							value={form.floor}
							onChange={onChangeInput}
							showCloseIcon={true}
							showError={showError("floor")}
							errorMsg={formValidate.floor.errMsg}
							placeholder={translate("deliveryPopup_addressTypeForm_floor")}
							errorClassName={styles["form-error-text"]}
							className=""
							type={"number"}
							extraStyles={styles}
							ariaRequired={true}
						/>
					</div>
					<div
						className={clsx(
							styles["input-container"],
							styles["ent-input-container"],
							styles["office-form-input-container"],
						)}>
						<AnimatedInput
							ref={formValidate.ent.ref}
							name="ent"
							value={form.ent}
							onChange={onChangeInput}
							showCloseIcon={true}
							showError={showError("ent")}
							errorMsg={formValidate.ent.errMsg}
							placeholder={translate("deliveryPopup_addressTypeForm_ent")}
							errorClassName={styles["form-error-text"]}
							className=""
							extraStyles={styles}
						/>
					</div>
				</div>
				<div
					className={clsx(
						styles["input-container"],
						styles["bussiness-input-container"],
					)}>
					<AnimatedInput
						ref={formValidate.bussiness.ref}
						name="bussiness"
						value={form.bussiness}
						onChange={onChangeInput}
						showCloseIcon={true}
						showError={showError("bussiness")}
						errorMsg={formValidate.bussiness.errMsg}
						placeholder={translate("deliveryPopup_addressTypeForm_bussiness")}
						errorClassName={styles["form-error-text"]}
						className=""
						extraStyles={styles}
					/>
				</div>
				<div className={styles["notes-for-courier-wrapper"]}>
					{RenderNoteForCourier()}
				</div>
			</div>
		);
	}

	function getFormByType() {
		switch (type) {
			case addressTypes.HOUSE:
				formInputs = ["deliveryInstructions"];

				return RenderNoteForCourier();
			case addressTypes.APARTMENT:
				formInputs = ["apt", "floor", "ent", "deliveryInstructions"];

				return RenderAptForm();
			case addressTypes.OFFICE:
				formInputs = ["floor", "ent", "bussiness", "deliveryInstructions"];

				return RenderOfficeForm();
			case addressTypes.OUT:
				formInputs = ["deliveryInstructions"];

				return RenderNoteForCourier();
		}
	}

	function onFutureOrderPress() {
		const address = {
			deliverability: form,
		};

		setStack({
			type: deliveryScreensTypes.FUTUREORDER,
			showHeader: true,
			params: {
				address,
				isPickup: false,
				onSuccess: onTimePicked,
				onBackClick: onFutureOrderBackClick,
			},
		});
		const shippingInfo = {
			shipping_tier: `pickup - later`,
			affiliation: fullAddress,
		};
		AnalyticsService.chooseShippmentTime("later");
		AnalyticsService.shippingInfo(shippingInfo);
	}

	function onFutureOrderBackClick() {
		setStack({
			type: deliveryScreensTypes.ADDRESSTYPE,
			showHeader: false,
			params: {
				address: form.address,
				shouldShowFormByDefault: true,
				resetForm: false,
			},
		});
	}

	function formatSetDeliveryDetailsPayload(time = undefined) {
		const datetime = time?.date + " " + time?.hour + ":" + time?.minute;

		const isPoi = form.isPoi;

		const addressType =
			(isPoi ? "poi" : "address") + "/" + (form?.addressType).toLowerCase();

		const address = fullAddress;
		const street = isPoi ? fullAddress : form.address?.street;
		const payload = {
			address,
			addresstype: addressType,
			saveaddress: form?.saveAddress,
			storetypes: temporarilyNotKosher
				? []
				: kosherCheckbox || isKosher
				? ["Kosher"]
				: [],
			Entrance: form?.ent,
			Floor: form?.floor,
			timedto: time ? datetime : "",
			Apt: form?.apt?.length > 0 ? form.apt : "",
			city: form.address?.city,
			street,
			houseNo: form.address?.hnum,
			DeliveryInstructions: form?.deliveryInstructions,
		};

		return payload;
	}

	function onTimeSelectedPress() {
		checkForActiveOrder(() => {
			const payload = formatSetDeliveryDetailsPayload();

			Api.setDeliveryDetails({
				payload,
				onSuccessCB: navigateToMenuScreen,
				onRejectionCB: setDeliveryDetailsRejection,
			});
		});
		const shippingInfo = {
			shipping_tier: `pickup - ${promiseTime}`,
			affiliation: fullAddress,
		};
		AnalyticsService.chooseShippmentTime(`${promiseTime} minutes`);
		AnalyticsService.shippingInfo(shippingInfo);
	}

	function onTimePicked(time) {
		checkForActiveOrder(() => {
			const payload = formatSetDeliveryDetailsPayload(time);
			Api.setDeliveryDetails({
				payload,
				onSuccessCB: navigateToMenuScreen,
				onRejectionCB: setDeliveryDetailsRejection,
			});
		});
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

	const showErrorBtn = showErrorBtnHandler();

	const isSelectedAddressAvailable = form?.deliverNow;

	const promiseTime = form.promiseTime;
	const btnAcceptText = translate("deliveryPopup_accept_btn").replace(
		"{time}",
		`${promiseTime}`,
	);

	return (
		<div className={clsx(styles["address-type-form-wrapper"], styles[className])}>
			<div className={styles["form-wrapper"]}>{getFormByType()}</div>
			<div className={styles["form-bottom-part"]}>
				<div
					className={styles["save-address-wrapper"]}
					onKeyDown={(event) => handleKeyPress(event, onSaveAddressPress)}>
					<Checkbox
						type="checkbox"
						value={form.saveAddress}
						id={"checkbox"}
						onChange={onSaveAddressPress}
						variant={CHECKBOX_VARAINTS.DARK}
						extraStyles={styles}
						tabIndex={0}
						label={translate("deliveryPopup_addressTypeForm_saveAddress_title")}
						hideLabel
					/>
					<label
						htmlFor={"checkbox"}
						className={styles["save-address-title"]}>
						{translate("deliveryPopup_addressTypeForm_saveAddress_title")}
					</label>
				</div>

				<div className={clsx(styles["actions"])}>
					{isBtnActive ? (
						isSelectedAddressAvailable ? (
							<AnimatedCapsule
								bluePillText={translate("deliveryPopup_decline_btn")}
								redPillText={btnAcceptText}
								redPillOnPress={() => onSubmit(onTimeSelectedPress)}
								bluePillOnPress={() => onSubmit(onFutureOrderPress)}
							/>
						) : (
							<Button
								isError={showErrorBtn}
								errorText={translate(
									"deliveryPopup_addressTypeForm_acceptBtnError_title",
								)}
								isBtnOnForm={true}
								text={translate("deliveryPopup_futureOrder_ButtonLabel")}
								onClick={() => onSubmit(onFutureOrderPress)}
							/>
						)
					) : null}
				</div>
			</div>
		</div>
	);
}

export default DifferentAddressForm;
