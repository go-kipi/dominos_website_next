import React, { useEffect, useRef, useState } from "react";
import useTranslate from "hooks/useTranslate";
import styles from "./index.module.scss";
import TextOnlyButton from "components/text_only_button";
import BitStyledButton from "components/BitButton/BitButton";
import PAYMENT_SCREEN_TYPES from "constants/PaymentScreenTypes";
import { useSelector } from "react-redux";
import BitService from "services/Bit";
import Api from "api/requests";
import BitIcon from "/public/assets/icons/payment/bit-icon.png";

function Bit(props) {
	const translate = useTranslate();
	const isBitPaymentApproved = useRef(false);
	const deviceState = useSelector((store) => store.deviceState);
	const {
		params,
		goBackToChoosePayment,
		setStack,
		getBitPaymentStatus = () => {},
	} = props;
	const { bitUrl, bitUUID } = params;

	const handleBitInDesktop = () => {
		BitService.isBitAvailable().then((isAvailable) => {
			if (isAvailable) {
				const events = {
					onApproved: (data) => {
						getBitPaymentStatus(bitUUID, (res) => {
							const { status } = res.extraData;
							if (status === "authorized") {
								setStack({
									type: PAYMENT_SCREEN_TYPES.BIT_DONE,
									params: { bitUUID },
								});
							}
						});
						isBitPaymentApproved.current = true;
					},
					onCancel: (data) => {
						console.log("cancel", data);
						setStack({
							type: PAYMENT_SCREEN_TYPES.CHOSSE_PAYMENT,
							params: {},
						});
					},
					onTimeout: (data) => {
						console.log("timeout", data);
						setStack({
							type: PAYMENT_SCREEN_TYPES.CHOSSE_PAYMENT,
							params: {},
						});
					},
					log: (data) => {
						const { description } = data;
						if (
							typeof description === "string" &&
							(description === "payment-modal-closed" ||
								description === "close-payment-modal") &&
							!isBitPaymentApproved.current
						) {
							setStack({
								type: PAYMENT_SCREEN_TYPES.CHOSSE_PAYMENT,
								params: {},
							});
						}
					},
				};
				BitService.Pay(events);
			}
		});
	};

	const handleBitInMobile = () => {
		typeof bitUrl === "string" && window.open(bitUrl, "_blank");
	};

	const handleOnBitPress = () => {
		setStack({
			type: PAYMENT_SCREEN_TYPES.LOADER,
			params: { loaderText: "bitLoader_text", bitUUID },
		});
		deviceState.isMobile ? handleBitInMobile() : handleBitInDesktop();
	};

	const handleGoBack = () => {
		typeof goBackToChoosePayment === "function" && goBackToChoosePayment();
	};

	return (
		<div className={styles["wrapper"]}>
			<div className={styles["bit-logo"]}>
				<img src={BitIcon.src} />
			</div>
			<div className={styles["pay-with-bit"]}>{translate("payWithBit_title")}</div>
			<div className={styles["press-the-btn"]}>
				{translate("payWithBit_subtitle")}
			</div>
			<BitStyledButton
				className={styles["bit-btn"]}
				onClick={handleOnBitPress}
			/>
			<TextOnlyButton
				text={translate("shoppingCart_payment_cash_decline")}
				className={styles["go-back"]}
				onClick={handleGoBack}
			/>
		</div>
	);
}

export default Bit;
