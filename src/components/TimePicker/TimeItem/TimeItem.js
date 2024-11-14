import clsx from "clsx";
import React, {useEffect, useRef, useState} from "react";
import useTranslate from "../../../hooks/useTranslate";
import styles from "./TimeItem.module.scss";
import SRContent from "../../accessibility/srcontent";
import {TAB_INDEX_HIDDEN} from "../../../constants/accessibility-types";

function TimeItem(props) {
    const {text, isSelected, isPrev, isNext, setHeight} = props;
    const ref = useRef(null);
    const [styleInline, setStyleInline] = useState({});
    const translate = useTranslate();

    useEffect(() => {
        setStyleInline({height: ref.current.clientHeight});
        setHeight(ref.current.clientHeight);
    }, [ref]);

    return (
        <button className={clsx(styles["time-item-wrapper"], isSelected ? 'selected' : '')} ref={ref}
                style={styleInline}
                tabIndex={TAB_INDEX_HIDDEN}
                role={'listitem'}
        >
            {
                isSelected &&
                <SRContent
                    message={translate('accessibility_timePicker_selectTime') + text.hour + ':' + text.minute}
                    // ariaLive={'polite'}
                    // role={'button'}
                />
            }

            <span
                className={clsx(
                    styles["time-text"],
                    (isSelected ? styles["selected"] : ""),
                    (isPrev || isNext ? styles["nextorprev"] : "")
                )}
            >
        <span aria-hidden={true}>{text.minute}</span>
      </span>
            <span
                className={clsx(
                    styles["time-text"],
                    (isSelected ? styles["selected"] : ""),
                    (isPrev || isNext ? styles["nextorprev"] : "")
                )}
            >
        <span aria-hidden={true}>:</span>
      </span>
            <span
                className={clsx(
                    styles["time-text"],
                    (isSelected ? styles["selected"] : ""),
                    (isPrev || isNext ? styles["nextorprev"] : "")
                )}
            >
          <span aria-hidden={true}>{text.hour}</span>
      </span>
        </button>
    );
}

export default TimeItem;
