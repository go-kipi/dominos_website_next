import React, { useEffect } from "react";
import LottieAnimation from "components/LottieAnimation";


import ConfettiAnimation from "animations/Confetti.json";

import styles from "./Greeting.module.scss";
import useTranslate from "hooks/useTranslate";

export default function Greeting(props) {
  const { params, animateOut, onDone } = props;
  const { name } = params;
  const translate = useTranslate();

  useEffect(() => {
    const timer = setTimeout(() => {
      animateOut(onDone);
    }, 2000);
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
    <div className={styles["greeting-wrapper"]}>
      <div className={styles["greeting-top"]}>
        <div className={styles["lottie-wrapper"]}>
          <LottieAnimation {...defaultOptions} />
        </div>
        <h1 className={styles["title"]} tabIndex={0}>
          {translate("onboarding_greeting_title").replace("{username}", name)}
        </h1>
      </div>

      <h2 className={styles["subtitle"]} role={'alert'} tabIndex={0}>{translate("onboarding_greeting_subtitle")}</h2>
    </div>
  );
}
