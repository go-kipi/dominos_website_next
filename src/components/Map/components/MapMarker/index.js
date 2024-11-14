import React from "react";
import styles from "./index.module.scss";
import useTranslate from "hooks/useTranslate";

const MapMarker = (props) => {
  const {
    icon = "",
    className = "",
    labelClassName = "",
    text,
    selected = false,
    branchName,
    note,
    allowCursorOnDisable = false,
  } = props;
  const translate = useTranslate();

  const getConditionalClassName = (cond, propClassName, defaultValue) => {
    return props[cond]
      ? props[propClassName]
        ? props[propClassName]
        : defaultValue
      : "";
  };

  const selectedClass = getConditionalClassName(
    "selected",
    "selectedClassName",
    "selected"
  );
  const disabledClass = getConditionalClassName(
    "disabled",
    "disabledClassName",
    "disabled"
  );
  return (
    <div className={`${styles["map-marker-wrapper"]} ${className}`}>
      <img
        src={icon.src}
        className={`${styles["map-marker-img"]} ${styles[selectedClass]} ${
          styles[disabledClass]
        } ${allowCursorOnDisable ? styles["cursor"] : ""}`}
        alt={""}
      />
      {selected && text && (
        <div
          className={`${styles["map-marker-text"]} ${styles[labelClassName]}`}
          style={{ zIndex: selected ? 10008 : 0 }}
        >
          {text}
        </div>
      )}
      {branchName && (
        <div className={styles["branch-name-wrapper"]}>
          <span className={styles["branch-name"]}>
            {translate("branchMarker_text") + " " + branchName}
          </span>
          {note && <span className={styles["branch-note"]}>{note}</span>}
        </div>
      )}
    </div>
  );
};

export default MapMarker;
