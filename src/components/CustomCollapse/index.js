import React, { useLayoutEffect, useRef, useState } from "react";

import styles from "./index.module.scss"
import { useSelector } from "react-redux";
import clsx from "clsx";
import SRContent from "../accessibility/srcontent";

const CustomCollapse = (props) => {
  const collapseRef = useRef(null);
  const [height, setHeight] = useState(0);
  const deviceState = useSelector((store) => store.deviceState);
  const { notDesktop } = deviceState;

  const { isOpen = false, content, shouldChangeMaxHeight = false, className = "" } = props;

  useLayoutEffect(() => {
    setHeight(collapseRef.current.clientHeight);
  }, [isOpen]);

  const openCollapseStyle = {
    overFlow: "unset",
    maxHeight: shouldChangeMaxHeight ? height + 5 + "px" : "unset",
  };
  return (
    <div className={clsx(styles["collapse"], className)} style={isOpen ? openCollapseStyle : {}} aria-hidden={!isOpen}>
      {isOpen && <SRContent message={content()} role={'alert'} ariaLive={'off'}/>}
      <div className={styles["wrap"]} ref={collapseRef}>
        {content()}
      </div>
    </div>
  );
};

export default CustomCollapse;
