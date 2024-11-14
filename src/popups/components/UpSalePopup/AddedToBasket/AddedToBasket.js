import React from "react";

import styles from "./AddedToBasket.module.scss";
import confetti from "/public/assets/icons/confetti-bundle-added-to-basket.svg";
import vi from "/public/assets/icons/vi-bundle-added-to-basket.svg";

import useTranslate from "hooks/useTranslate";

function AddedToBasket(props) {
    const translate = useTranslate()
    return (
        <div className={styles["bundle-up-sale-added-to-basket"]}>
            <div className={styles["bundle-up-sale-added-to-basket-content"]}>
                <div className={styles["confetti-wrapper"]}>
                    <img src={confetti.src} alt={''}/>
                </div>
                <div className={styles["vi-wrapper"]}>
                    <img src={vi.src} alt={''}/>
                </div>
                <span className={styles["added-to-basket"]} tabIndex={0}>{translate("upSalePopup_addedToBasket")}</span>
            </div>
        </div>
    );
}

export default AddedToBasket;
