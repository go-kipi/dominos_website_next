import React from "react";
import styles from "./CreditCardItem.module.scss";

import VisaIcon from "/public/assets/icons/payment/credit-card/visa.svg";
import DinersIcon from "/public/assets/icons/payment/credit-card/diners.svg";
import AmexIcon from "/public/assets/icons/payment/credit-card/amex.svg";
import MastercardIcon from "/public/assets/icons/payment/credit-card/mastercard.svg";
import Cardfront from "/public/assets/icons/payment/Card-front.svg";
import CardfrontDisabled from "/public/assets/icons/payment/Card-front-disabled.svg";
import GarbageIcon from "/public/assets/icons/blue-trash.svg";
import { useSelector } from "react-redux";
import clsx from "clsx";

const BRAND_ENUM = {
  DINERS: "Diners",
  AMEX: "Amex",
  VISA: "Visa",
  MASTERCARD: "Mastercard",
};

function CreditCardItem(props) {
  const {
    item,
    onSelect,
    onDeleteCard,
    onEditCard,
    canShowDelete = false,
    canShowEdit = false,
    isSelected,
  } = props;
  const deviceState = useSelector((store) => store.deviceState);

  const CARD_COMPANIES = {
    [BRAND_ENUM.AMEX]: AmexIcon,
    [BRAND_ENUM.DINERS]: DinersIcon,
    [BRAND_ENUM.MASTERCARD]: MastercardIcon,
    [BRAND_ENUM.VISA]: VisaIcon,
  };

  function handleOnSelectPress() {
    typeof onSelect === "function" && onSelect(item);
  }

  function handleOnDeletePress() {
    typeof onDeleteCard === "function" && onDeleteCard(item?.token);
  }

  function formatExpiryDate() {
    let expiryDate =
      item.expiryDate.slice(0, 2) +
      "/" +
      item.expiryDate.slice(2, item.expiryDate.length);
    return expiryDate;
  }

  return (
    <div
      onClick={handleOnSelectPress}
      className={clsx(
        styles["credit-card-item-wrapper"],
        item.expired ? styles["expired"] : "",
        isSelected ? "" : styles["not-selected"]
      )}
      role={"listitem"}
      aria-label={isSelected ? item?.brand + " " + item?.lastFourDigits : ""}
      aria-hidden={!isSelected}
    >
      <div className={styles["card-wrapper"]}>
        <img
          src={!item.expired ? Cardfront.src : CardfrontDisabled.src}
          aria-hidden={true}
        />
      </div>

      <div className={clsx(styles["cc-number"])}>
        <span className={styles["last-four-digits"]}>
          {item?.lastFourDigits}
        </span>
      </div>
      <div className={styles["credit-card-expiry-date"]}>
        {formatExpiryDate()}
      </div>
      <div className={styles["credit-card-brand"]}>
        <img src={CARD_COMPANIES[item.brand]?.src} />
      </div>
      <div className={styles["bottom"]}>
        {deviceState.notDesktop ? (
          <div className={styles["selected-card-bottom-text"]}>
            <span>{item?.brand}</span>
            <span>{` ${item?.lastFourDigits}`}</span>
          </div>
        ) : null}
        {deviceState.notDesktop && canShowDelete && item?.expired ? (
          <div
            onClick={handleOnDeletePress}
            className={styles["delete-card-icon"]}
          >
            <img src={GarbageIcon.src} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default CreditCardItem;
