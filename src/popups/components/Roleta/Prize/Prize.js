import React, {useEffect, useState} from "react";
import LottieAnimation from "../../../../components/LottieAnimation";
import {useSelector} from "react-redux";

import {getFullMediaUrl} from "utils/functions";
import Api from "api/requests";
import styles from "./Prize.module.scss";
import Button from "components/button";
import clsx from "clsx";
import {MEDIA_TYPES} from "constants/media-types";
import {MEDIA_ENUM} from "constants/media-enum";
import useTranslate from "hooks/useTranslate";
import ConfettiAnimation from "animations/just-confetti.json";
import SRContent from "../../../../components/accessibility/srcontent";
import moment from "moment";
import {createAccessibilityText} from "../../../../components/accessibility/acfunctions";
import {TAB_INDEX_DEFAULT, TAB_INDEX_FOCUS} from "../../../../constants/accessibility-types";

function Prize(props) {
    const {animateOut, exitRoletaModal, prize} = props;
    const translate = useTranslate();
    const deviceState = useSelector((store) => store.deviceState);

    const productImg = getFullMediaUrl(
        {id: prize?.productId, assetVersion: prize?.assetVersion},
        MEDIA_TYPES.PRODUCT,
        MEDIA_ENUM.IN_MENU
    );

    const date = prize?.expirationDate ? formatDate(prize.expirationDate) : '01/01/1970';

    function onClick() {
        animateOut();
        exitRoletaModal();
    }

    function formatDate(dateString) {
        const dateParts = dateString.split("-");
        const year = dateParts[0];
        const month = dateParts[1];
        const day = dateParts[2];

        return `${day}/${month}/${year}`;
    }

    function RenderPrizeTitle() {
        return (
            <div className={styles["won-wrapper"]}>
        <span className={styles["won-title"]}>
          {translate("roleta_prize_won_title")}
        </span>
                <span className={styles["prize-title"]}>
          {prize?.nameUseCases?.Title}
        </span>
                <span className={styles["prize-title"]}>
          {translate("roleta_prize_prize_title")}
        </span>
            </div>
        );
    }

    function RenderPrizeDate() {
      const dateObj = moment(date, "DD/MM/YYYY");
      const dateString = dateObj.toDate().toLocaleDateString(["he-IL", "en-US"], {
        day: "numeric",
        month: "long",
        year: "numeric"
      });

      const srText = createAccessibilityText(
        translate("roleta_prize_expirationDate_title"),
        dateString,
      );
        return (
          <>
            <SRContent
              id={"roleta-prize-date-expiry"}
              message={srText}
            />
            <div className={styles["expiration-date-wrapper"]} aria-labelledby={"roleta-prize-date-expiry"} tabIndex={TAB_INDEX_FOCUS}>
                <span className={styles["expiration-date"]} aria-hidden={true}>
                  {translate("roleta_prize_expirationDate_title")}
                </span>
                <div className={clsx(styles["expiration-date"], styles["date"])} aria-hidden={true}>
                  {date}
                </div>
            </div>
          </>
        );
    }

    function RenderButton() {
        return (
            <div className={styles["actions"]}>
                <Button
                    text={translate("roleta_prize_accept_label")}
                    onClick={onClick}
                />
            </div>
        );
    }

    function RenderMobile() {
        return (
            <div className={styles["mobile-wrapper"]}>
                <div className={styles["prize-img"]}>
                    <img src={productImg} alt={""}/>
                    <LottieAnimation
                        animation={ConfettiAnimation}
                        className={styles["confetti-animation"]}
                    />
                </div>
                <div aria-live={'polite'}>
                    {RenderPrizeTitle()}
                    {RenderPrizeDate()}
                </div>
                {RenderButton()}
            </div>
        );
    }

    function RenderDesktop() {
        return (
            <div className={styles["desktop-wrapper"]}>
                <div className={styles["right-side"]}>
                    <div aria-live={'polite'}>
                        {RenderPrizeTitle()}
                        {RenderPrizeDate()}
                    </div>
                    {RenderButton()}
                </div>

                <div className={styles["left-side"]}>
                    <div className={styles['prize-img']}>
                        <img src={productImg} alt={''}/>
                        <LottieAnimation
                            animation={ConfettiAnimation}
                            className={styles["confetti-animation"]}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles["prize-wrapper"]}>
            <SRContent
                role={'alert'}
                message={translate('accessibility_rouletteDescription_finishAnimation')}
            />
            {deviceState.isDesktop ? RenderDesktop() : RenderMobile()}
        </div>
    );
}

export default Prize;
