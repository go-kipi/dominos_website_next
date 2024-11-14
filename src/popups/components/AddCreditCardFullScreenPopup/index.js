import React, { useEffect, useRef } from "react";
import HeaderTitle from "containers/PersonalArea/HeaderTitle/HeaderTitle";
import styles from "./index.module.scss";
import FullScreenPopup from "popups/Presets/FullScreenPopup";
import STACK_TYPES from "constants/stack-types";
import useStack from "hooks/useStack";
import Actions from "redux/actions";
import PAYMENT_SCREEN_TYPES from "constants/PaymentScreenTypes";
import useTranslate from "hooks/useTranslate";
import usePostMessage from "hooks/usePostMessage";
import { useDispatch } from "react-redux";

function AddCreditCardFullScreenPopup(props) {
	const { payload } = props;
	const { iframeUrl = "", onAddCreditCardCallback } = payload;
	const [_, setPaymentStack] = useStack(STACK_TYPES.PAYEMNT);
	const ref = useRef();
	const dispatch = useDispatch();

	const translate = useTranslate();

	usePostMessage(onSuccess, onError);

	useEffect(() => {
		return () => {
			dispatch(Actions.setIsCreditModalOpen(false));
		};
	}, []);

	const animateOut = (callback) => {
		ref.current?.animateOut(callback);
	};

	function onSuccess() {
		animateOut(() => {
			setPaymentStack({
				type: PAYMENT_SCREEN_TYPES.LOADER,
				params: {
					loaderText: "defaultPaymentLoaderText",
				},
			});
			typeof onAddCreditCardCallback === "function" && onAddCreditCardCallback();
		});
	}

	function onError() {
		animateOut(() => {
			setPaymentStack({
				type: PAYMENT_SCREEN_TYPES.CHOSSE_PAYMENT,
				params: {},
			});
		});
	}

	return (
		<FullScreenPopup
			id={props.id}
			ref={ref}
			className={styles["add-credit-card"]}>
			<div className={styles["add-credit-card-wrap"]}>
				<HeaderTitle
					title={translate("personalArea_credit_card_addCard")}
					backFn={animateOut}
					canGoBack={true}
				/>
				<div className={styles["body"]}>
					{
						<iframe
							src={iframeUrl}
							className={styles["iframe"]}
						/>
					}
				</div>
			</div>
		</FullScreenPopup>
	);
}

export default AddCreditCardFullScreenPopup;
