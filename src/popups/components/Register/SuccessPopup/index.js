import React from "react";
import { useSelector } from "react-redux";


import Button from "../../../../components/button";
import LottieAnimation from "../../../../components/LottieAnimation";
import RegisterSuccess from "animations/success_celebration.json";

import styles from "./index.module.scss"
import useTranslate from "hooks/useTranslate";

export default function RegisterPopup(props) {
  const userData = useSelector((store) => store.userData);
  const translate = useTranslate()
  const { animateOut } = props;
  function RenderPopup() {
    return (
      <>
        <div className={styles["success-wrap"]}>
          <LottieAnimation className={styles["lottie"]} animation={RegisterSuccess} />
          <div className={styles["lottie-title-wrap"]}>
            <span className={styles["lottie-title"]} tabIndex={0}>
              {userData?.firstName
                ? userData.firstName +
                  ", " +
                  translate("register_popup_success_glad_you_join")
                : translate("register_popup_success_glad_you_join")}
            </span>
          </div>
          <div className={styles["additional-text"]} tabIndex={0}>
            {translate("register_popup_success_additional_text")}
          </div>
        </div>
        <div className={styles["btn-wrap"]}>
          <Button
            isPrimary={true}
            className={styles["btn"]}
            text={translate("register_popup_success_btn_continue")}
            onClick={animateOut}
          />
        </div>
      </>
    );
  }

  return <div className={styles["content"]}>{RenderPopup()}</div>;
}
