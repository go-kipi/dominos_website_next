import clsx from "clsx";
import React from "react";
import styles from './index.module.scss';
export default function Separator(props) {
    const {
        horizontal = false,
        className
    } = props;
    const horizontalClassName = horizontal ? styles['horizontal'] : '';
    return (
        <div className={clsx(className, styles['separator'], horizontalClassName)}></div>
    )
}
