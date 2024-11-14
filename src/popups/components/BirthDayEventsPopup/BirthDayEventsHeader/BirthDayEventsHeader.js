"use client";

import React from "react";

import styles from "./BirthDayEventsHeader.module.scss";
import BackIcon from "/public/assets/icons/back-black.svg";
import XIcon from "/public/assets/icons/x-icon.svg";
import LanguageDirectionService from "services/LanguageDirectionService";
import clsx from "clsx";

function BirthDayEventsHeader({ hide, back = false, close = false, goBack }) {
  const isRTL = LanguageDirectionService.isRTL();
  return (
    <div className={styles["birthday-header"]}>
      <div className={styles["icon-container"]}>
        {back && (
          <button
            className={clsx(
              styles["icon-wrapper"],
              isRTL ? "" : styles["flipped-icon"]
            )}
            onClick={() => goBack()}
          >
            <img src={BackIcon.src} />
          </button>
        )}
      </div>
      <div className={styles["icon-container"]}>
        {close && (
          <button
            className={clsx(
              styles["icon-wrapper"],
              isRTL ? "" : styles["flipped-icon"]
            )}
            onClick={hide}
          >
            <img src={XIcon.src} />
          </button>
        )}
      </div>
    </div>
  );
}

export default BirthDayEventsHeader;
