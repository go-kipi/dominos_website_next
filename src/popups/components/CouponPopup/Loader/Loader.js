import DominosLoader from "components/DominosLoader/DominosLoader";
import React from "react";

import styles from "./Loader.module.scss";

function Loader(props) {
  return (
    <div className={styles["coupon-loader-wrapper"]} role={'progressbar'}>
      <div className={styles["loader-container"]}>
        <DominosLoader />
      </div>
    </div>
  );
}

export default Loader;
