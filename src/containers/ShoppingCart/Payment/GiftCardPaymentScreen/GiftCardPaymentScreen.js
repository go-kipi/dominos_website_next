export const UIMETA_ENUMS = {
	VERFIPHONE: "verifone",
	GIFTCARD: "creditCard",
};

import React, { useEffect, useRef, useState } from "react";
import styles from "./GiftCardPaymentScreen.module.scss";
import useTranslate from "hooks/useTranslate";
import { useSelector } from "react-redux";
import usePostMessage from "hooks/usePostMessage";
import Api from "api/requests";
import AnimatedInput from "components/forms/animated_input";
import Button from "components/button";
import Validate from "utils/validation";

export default function GiftCardPaymentScreen(props) {
	const { method } = props;
	const { uImeta } = method;

	const renderGiftCardByMeta = () => {
		switch (uImeta) {
			case UIMETA_ENUMS.GIFTCARD:
				return <GiftCard {...props} />;

			case UIMETA_ENUMS.VERFIPHONE:
				return <Verifone {...props} />;
		}
	};

	return renderGiftCardByMeta();
}

const GiftCard = (props) => {
	const { goBackToChoosePayment, method, leftToPay } = props;

	usePostMessage(onSuccess);

	const deviceState = useSelector((store) => store.deviceState);
	const translate = useTranslate();

	const [cgUrl, setCgUrl] = useState("");

	useEffect(() => {
		if (cgUrl.length === 0 && method) {
			const { id, defaultCurrency } = method;
			const payload = {
				paymentMethod: id,
				amount: leftToPay,
				currency: defaultCurrency,
			};
			Api.addPayment({ payload, onSuccess: handlePaymentSuccess });
		}
	}, []);

	function handlePaymentSuccess(res) {
		const { frameUrl } = res.extraData;
		setCgUrl(frameUrl);
	}

	function onSuccess() {
		typeof goBackToChoosePayment === "function" && goBackToChoosePayment();
	}

	return (
		<div className={styles["gift-card-wrapper"]}>
			{deviceState.isDesktop && (
				<span className={styles["title"]}>
					{translate("payment_giftCard_title")}
				</span>
			)}
			<div className={styles["body"]}>
				<iframe
					src={cgUrl}
					className={styles["iframe"]}
				/>
			</div>
		</div>
	);
};

const Verifone = (props) => {
	const { goBackToChoosePayment, method, submitOrder } = props;
	const { uImeta } = method;

	const [textInput, setTextInput] = useState("");
	const translate = useTranslate();
	const isFirstTry = useRef(true);

	const creditCardValidate = useRef({
		valid: false,
		errMsg: "",
		rules: ["not_empty"],
	});

	const onChange = (e) => {
		const { value } = e.target;
		isFirstTry.current = false;

		const validationObj = Validate(value, creditCardValidate.current.rules);

		creditCardValidate.current.valid = validationObj.valid;
		creditCardValidate.current.errMsg = validationObj.msg;

		setTextInput(value);
	};

	const onSubmit = () => {
		if (!creditCardValidate.current.valid) return;

		const payload = {
			paymentMethod: uImeta,
			amount: 1,
			currency: method.defaultCurrency,
			extraData: { cardNumber: textInput },
		};

		Api.addPayment({
			payload,
			onSuccess: () => {
				typeof submitOrder === "function" && submitOrder();
			},
			onRejection: () => {
				typeof goBackToChoosePayment === "function" && goBackToChoosePayment();
			},
			dontShowLoader: true,
		});
	};

	return (
		<div className={styles["verifone-wrapper"]}>
			<AnimatedInput
				value={textInput}
				placeholder={translate("veriphon_input_placeholder")}
				onChange={(e) => onChange(e)}
				showError={!isFirstTry.current && !textInput.length}
				name={"verifone_input"}
				maxLength={15}
				showCloseIcon
			/>

			<Button
				text={translate("veriphone_submit_btn")}
				onClick={onSubmit}
				disabled={!creditCardValidate.current.valid}
			/>
		</div>
	);
};
