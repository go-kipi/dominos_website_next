import React, { useEffect, useState } from "react";
import Api from "api/requests";
import * as popups from "constants/popup-types";

import styles from "./PersonalAreaCreditCardDesktop.module.scss";
import AmexCardDisabled from "/public/assets/icons/cards/amex-disable.svg";
import DinersCardDisabled from "/public/assets/icons/cards/diners-disable.svg";
import MasterCardDisabled from "/public/assets/icons/cards/mastercard-disable.svg";
import VisaCardDisabled from "/public/assets/icons/cards/visa-disable.svg";
import AmexCard from "/public/assets/icons/cards/amex.svg";
import DinersCard from "/public/assets/icons/cards/diners.svg";
import MasterCard from "/public/assets/icons/cards/mastercard.svg";
import VisaCard from "/public/assets/icons/cards/visa.svg";
import PlusIcon from "/public/assets/icons/blue-plus.svg";
import NoCards from "/public/assets/icons/no-cards.svg";

import CreditCard from "../CreditCard/CreditCard";
import { useDispatch, useSelector } from "react-redux";
import Actions from "../../../redux/actions";
import useTranslate from "hooks/useTranslate";
import AnalyticsService from "utils/analyticsService/AnalyticsService";
export default function PersonalAreaCreditCardDesktop(props) {
  const [savedCreditCards, setSavedCreditCards] = useState(false);
  const creditCardTokens = useSelector((store) => store.creditCardTokens);
  const [newCard, setNewCard] = useState({});
  const translate = useTranslate();
  const dispatch = useDispatch();

  useEffect(() => {
    function onSuccess(data) {
      const creditCards = data?.creditCards;
      if (creditCardTokens?.isAddedCreditCard) {
        setNewCard(creditCards[creditCards.length - 1]);
        dispatch(Actions.toggleIsAddedCreditCard(false));
      }
      creditCards &&
        dispatch(Actions.addCreditCardTokens(getTokens(creditCards)));
      setSavedCreditCards(creditCards);
    }
    Api.getCustomerSavedCards({ onSuccess });
  }, []);

  const getTokens = (creditCard) =>
    creditCard && Object.values(creditCard).map((card) => card.token);
  function getCardImage(brand, isDisabled) {
    switch (brand) {
      case "Amex":
        return isDisabled ? AmexCardDisabled : AmexCard;
      case "Diners":
        return isDisabled ? DinersCardDisabled : DinersCard;
      case "Mastercard":
        return isDisabled ? MasterCardDisabled : MasterCard;
      case "Visa":
        return isDisabled ? VisaCardDisabled : VisaCard;
      default:
        break;
    }
  }
  const removeCreditCard = (token) => {
    const payload = { token };
    function onSuccess() {
      const filtered = Object.values(savedCreditCards).filter(
        (card) => card.token !== token
      );
      setSavedCreditCards(filtered);
      Api.getCustomerSavedCards();
      AnalyticsService.personalAreaRemoveCreditCard("Remove Card");
    }
    Api.deleteCustomerCreditCard({ payload, onSuccess });
  };

  function renderCreditCards() {
    return (
      <div className={styles["container"]}>
        {Object.values(savedCreditCards)
          .reverse()
          .map((card, index) => {
            return (
              <CreditCard
                key={card.token}
                index={index}
                card={card}
                getCardImage={getCardImage}
                removeCreditCard={() => removeCreditCard(card.token)}
                newCard={newCard}
              />
            );
          })}
      </div>
    );
  }

  function renderNoCards() {
    return (
      <div className={styles["no-cards-wrapper"]}>
        <span className={styles["no-cards-title"]}>
          {translate("personalAreaSavedCard_noCards_title")}
        </span>
        <div className={styles["no-cards-image"]}>
          <img src={NoCards.src} alt="no-cards" />
        </div>
      </div>
    );
  }

  return (
    <div className={styles["personal-area-credit-desktop"]}>
      {savedCreditCards && Object.values(savedCreditCards).length > 0 ? (
        <>
          <div className={styles["title-wrap"]}>
            <h1 className={styles["title"]}>
              {translate("personalArea_creditCards_cards")}
            </h1>
            <h2 className={styles["title"]}>
              {translate("personalArea_credit_cards_myCards")}
            </h2>
          </div>

          <div className={styles["body"]}>{renderCreditCards()}</div>
        </>
      ) : (
        renderNoCards()
      )}
    </div>
  );
}
