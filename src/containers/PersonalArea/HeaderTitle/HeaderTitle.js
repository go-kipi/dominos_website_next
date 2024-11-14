import React from "react";

import BackIcon from "/public/assets/icons/back.svg";
import styles from "./HeaderTitle.module.scss";
import { useRouter } from "next/router";
import useStack from "hooks/useStack";
import STACK_TYPES from "constants/stack-types";

function HeaderTitle(props) {
  const { title = "", canGoBack = true, routeTo, backFn } = props;
  const isOverride = typeof backFn === 'function';
  const router = useRouter();
  const [currentScreen, setStack, goBack] = useStack(STACK_TYPES.PERSONAL_AREA);

  return (
    <div className={styles["personal-area-header-title-wrapper"]}>
      <div className={styles["header-wrapper"]}>
        <div className={styles["back-icon-wrapper"]}>
          {canGoBack && (
            <button className={styles["icon-wrapper"]} onClick={() => isOverride ? backFn() : goBack()}>
              <img src={BackIcon.src} />
            </button>
          )}
        </div>
        <div className={styles["title-wrapper"]}>
          <span className={styles["title"]} tabIndex={0}>{title}</span>
        </div>
      </div>
    </div>
  );
}

export default HeaderTitle;
