import React from "react";
import clsx from "clsx";

import styles from "./Switch.module.scss";
import SRContent from "../accessibility/srcontent";
function Switch(props) {
  const { state, onClick, name, srMessage } = props;

  function onSwitchPress() {
    onClick(name, !state);
  }

  return (
    <button
      className={clsx(styles["switch-wrapper"], (state ? styles["on"] : styles["off"]))}
      onClick={onSwitchPress}
      aria-checked={state}
      role={'checkbox'}
    >
      <div className={styles["indicator"]}/>
      <SRContent
        message={srMessage}
      />
    </button>
  );
}

export default Switch;
