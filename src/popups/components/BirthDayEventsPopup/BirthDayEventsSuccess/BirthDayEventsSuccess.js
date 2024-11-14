import React from "react";

import styles from "./BirthDayEventsSuccess.module.scss";
import Ballons from "/public/assets/icons/birthday-baloons.png";
import useTranslate from "hooks/useTranslate";
import clsx from "clsx";

function BirthDayEventsSuccess(props) {
  const translate = useTranslate();
  return (
    <div className={styles["birthday-success-wrapper"]}>
      <div className={styles["image-wrapper"]}>
        <img src={Ballons.src} />
      </div>
      <div className={styles["texts-wrapper"]}>
        <span className={styles["text"]} tabIndex={0}>
          {translate("birthDayEvents_success_title1")}
        </span>
        <span className={clsx(styles["text"], styles["text-bold"])} tabIndex={0}>
          {translate("birthDayEvents_success_title2")}
        </span>
      </div>
    </div>
  );
}

export default BirthDayEventsSuccess;
