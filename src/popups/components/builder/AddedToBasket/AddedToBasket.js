import React, { useEffect } from "react";
import LottieAnimation from "components/LottieAnimation";

import styles from "./AddedToBasket.module.scss";

import ConfettiAnimation from "animations/confetti-with-check.json";
import useTranslate from "hooks/useTranslate";

function AddedToBasket(props) {
  const { onDone } = props;
  const translate = useTranslate();

  useEffect(() => {
    const timer = setTimeout(() => {
      typeof onDone === "function" && onDone();
    }, 1500);
    return () => {
      clearTimeout(timer);
    };
  }, []);

  const defaultOptions = {
    loop: false,
    autoplay: true,
    animation: ConfettiAnimation,
  };

  return (
    <div className={styles["bundle-up-sale-added-to-basket"]}>
      <div className={styles["bundle-up-sale-added-to-basket-content"]}>
        <LottieAnimation
          {...defaultOptions}
          className={styles["confetti-wrapper"]}
        />

        <span className={styles["added-to-basket"]}>
          {translate("upSalePopup_addedToBasket")}
        </span>
      </div>
    </div>
  );
}

export default AddedToBasket;
