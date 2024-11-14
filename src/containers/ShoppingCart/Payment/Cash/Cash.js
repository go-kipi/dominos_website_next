import React, {useState} from "react";

import styles from "./Cash.module.scss";
import CashImage from "/public/assets/icons/payment/cash.svg";
import TextOnlyButton from "components/text_only_button";
import Button from "components/button";
import Api from "api/requests";
import {useDispatch} from "react-redux";
import Actions from "redux/actions";
import PAYMENT_METHODS from "constants/PaymentMethods";

import LottieAnimation from "../../../../components/LottieAnimation";
import LoadingAnim from "../../../../animations/loading.json";
import useTranslate from "hooks/useTranslate";

const loadingDefaultOptions = {
    loop: true,
    autoplay: true,
    animation: LoadingAnim,
};

function Cash(props) {
    const {goBackToChoosePayment, leftToPay, currency, submitOrder} = props;
    const dispatch = useDispatch();
    const [showLoading, setShowLoading] = useState(false);
    const translate = useTranslate();

    function payWithCash() {
        const payload = {
            paymentMethod: PAYMENT_METHODS.CASH,
            amount: leftToPay,
            currency,
        };

        setShowLoading(true);

        function onFail() {
            setShowLoading(false);
        }

        Api.addPayment({
            payload,
            onSuccess,
            onFailure: onFail,
            onRejection: onFail,
        });

        function onSuccess(data) {
            dispatch(
                Actions.addPayment({
                    data,
                    paymentMethod: PAYMENT_METHODS.CASH,
                    currency,
                }),
            );

            typeof submitOrder === "function" && submitOrder();
        }
    }

    return showLoading ? (
        <LottieAnimation
            className={styles["lottie-anim"]}
            {...loadingDefaultOptions}
        />
    ) : (
        <div className={styles["cash-wrapper"]}>
            <div className={styles["cash-image-wrapper"]}>
                <img src={CashImage.src} alt={''}/>
            </div>
            <span className={styles["cash-title"]}>
				{translate("shoppingCart_payment_cash_title")}
			</span>

            <span
                className={styles["cash-subtitle"]}
                aria-live={"polite"}>
				{translate("shoppingCart_payment_cash_subtitle")}
			</span>
            <div className={styles["actions"]}>
                <Button
                    className={styles["button-accept"]}
                    text={translate("shoppingCart_payment_cash_accept")}
                    onClick={payWithCash}
                />
                <TextOnlyButton
                    className={styles["button-decline"]}
                    text={translate("shoppingCart_payment_cash_decline")}
                    onClick={goBackToChoosePayment}
                />
            </div>
        </div>
    );
}

export default Cash;
