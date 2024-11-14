import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import LottieAnimation from "components/LottieAnimation";
import OnBoardingEndAnimation from "animations/onboarding-end.json";
import OnBoardingEndMobileAnimation from "animations/onboarding-end-mobile.json";

import Button from "components/button";

import styles from "./End.module.scss";
import Actions from "redux/actions";
import useTranslate from "hooks/useTranslate";

export default function End(props) {
  const { params, onDone } = props;
  const { isKosher } = params;
  const animRef = useRef();
  const [isPaused, setIsPaused] = useState(true);
  const dispatch = useDispatch();
  const deviceState = useSelector((store) => store.deviceState);
  const translate = useTranslate();

  function accept() {
    setIsPaused((prev) => !prev);
  }

  const defaultOptions = {
    loop: false,
    autoplay: false,
    isPaused,
    animation: deviceState.isDesktop
      ? OnBoardingEndAnimation
      : OnBoardingEndMobileAnimation,
    onComplete: () => {
      typeof onDone === "function" && onDone();
      dispatch(Actions.removePopup());
    },
  };

  return (
    <div className={styles["end-wrapper"]} role={"alert"}>
      <h4 className={styles["subtitle"]}>
        {translate("onboarding_end_subtitle")}
      </h4>
      <h4 className={styles["kosher-title"]}>
        {isKosher
          ? translate("onboarding_end_kosher_text")
          : translate("onboarding_end_allBranches_text")}{" "}
      </h4>

      <h3 className={styles["title"]}>{translate("onboarding_end_title")}</h3>
      <div className={styles["lottie-wrapper"]}>
        <LottieAnimation ref={animRef} {...defaultOptions} />
      </div>
      <div className={styles["actions"]}>
        <Button
          text={translate("onborading_end_continue_btn")}
          onClick={() => accept()}
          className={styles["accept"]}
        />
      </div>
    </div>
  );
}
