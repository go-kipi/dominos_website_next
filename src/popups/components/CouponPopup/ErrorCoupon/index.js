import React from "react";
import styles from "./index.module.scss";
import CouponErrorIcon from "/public/assets/icons/coupon-error-img.svg";

import Button from "components/button";
import useTranslate from "hooks/useTranslate";

function ErrorCoupon(props) {
  const { params, btnText = "", onClick } = props;
  const { errorId } = params;
  const translate = useTranslate();
  const handleOnClick = () => typeof onClick === "function" && onClick();
  return (
    <div className={styles["error-coupon-wrapper"]}>
      <div className={styles["error-coupon-img"]}>
        <img src={CouponErrorIcon.src} alt={'coupon image'}/>
      </div>
      <h1 className={styles["error-coupon-desc"]} aria-live={'polite'} tabIndex={0}>
        {errorId
          ? translate(errorId)
          : translate("unresolvedCouponsModal_description")}
      </h1>
      <Button
        text={
          btnText.length > 0
            ? btnText
            : translate("unresolvedCouponsModal_btn_label")
        }
        className={styles["ok-btn"]}
        onClick={() => handleOnClick()}
      />
    </div>
  );
}

export default ErrorCoupon;
