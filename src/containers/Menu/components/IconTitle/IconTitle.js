import React from "react";

import styles from "./IconTitle.module.scss";
import clsx from "clsx";

function IconTitle(props) {
    const {icon, title, className = ""} = props;
    return (
        <div className={clsx(styles["icon-title-wrapper"], className)}>
            <div className={styles["icon-wrapper"]}>
                <img src={icon.src} aria-hidden={true}/>
            </div>
            <h3 className={styles["title"]}>{title}</h3>
        </div>
    );
}

export default IconTitle;
