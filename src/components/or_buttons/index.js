import React from "react";
import styles from "./index.module.scss";
import Button from "../button";
import LanguageDirectionService from "services/LanguageDirectionService";
import useTranslate from "hooks/useTranslate";

export default function OrButtons(props) {
  const {
    className = "",
    primaryText = "",
    primaryClassName = "",
    primaryOnClick = null,
    secondaryText = "",
    secondaryClassName = "",
    secondaryOnClick = null,
  } = props;
  const isRTL = LanguageDirectionService.isRTL();
  const translate = useTranslate();

  const handlePrimaryOnClick = () => {
    typeof primaryOnClick === "function" && primaryOnClick();
  };

  const handleSecondaryOnClick = () => {
    typeof secondaryOnClick === "function" && secondaryOnClick();
  };

  return (
    <div
      className={"or-buttons-wrapper " + className}
      style={{ flexDirection: isRTL ? "row" : "row-reverse" }}
    >
      <Button
        className={"secondary-btn"}
        textClassName={"secondary-btn-text"}
        text={secondaryText}
        onClick={handleSecondaryOnClick}
      />
      <span className={"or-buttons-separator"}>
        {translate("or_middle_section")}
      </span>
      <Button
        className={"primary-btn"}
        textClassName={"primary-btn-text"}
        text={primaryText}
        onClick={handlePrimaryOnClick}
      />
    </div>
  );
}
