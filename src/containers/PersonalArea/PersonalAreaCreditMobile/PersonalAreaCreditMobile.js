import React, { useEffect, useState } from "react";
import HeaderTitle from "../HeaderTitle/HeaderTitle";
import { useDispatch, useSelector } from "react-redux";
import Api from "api/requests";
import styles from "./PersonalAreaCreditMobile.module.scss";
import * as popups from "constants/popup-types";
import AmexCardDisabled from "/public/assets/icons/cards/amex-disable.svg";
import DinersCardDisabled from "/public/assets/icons/cards/diners-disable.svg";
import MasterCardDisabled from "/public/assets/icons/cards/mastercard-disable.svg";
import VisaCardDisabled from "/public/assets/icons/cards/visa-disable.svg";
import AmexCard from "/public/assets/icons/cards/amex.svg";
import DinersCard from "/public/assets/icons/cards/diners.svg";
import MasterCard from "/public/assets/icons/cards/mastercard.svg";
import VisaCard from "/public/assets/icons/cards/visa.svg";
import NoCards from "/public/assets/icons/no-cards.svg";

import CreditCard from "../CreditCard/CreditCard";

import Actions from "redux/actions";
import TWO_ACTION_TYPES from "constants/two-actions-popup-types";
import useTranslate from "hooks/useTranslate";
import useStack from "hooks/useStack";
import STACK_TYPES from "constants/stack-types";
import GeneralHeader from "components/GeneralHeader/GeneralHeader";
import AnalyticsService from "utils/analyticsService/AnalyticsService";

export default function PersonalAreaCreditMobile(props) {
  const [savedCreditCards, setSavedCreditCards] = useState(false);
  const creditCardTokens = useSelector((store) => store.creditCardTokens);
  const [newCard, setNewCard] = useState({});
  const dispatch = useDispatch();
  const translate = useTranslate();
  const [currentScreen, setStack, goBack] = useStack(STACK_TYPES.PERSONAL_AREA);

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

    function onSuccess(res) {
      const filtered = Object.values(savedCreditCards).filter(
        (card) => card.token !== token
      );
      setSavedCreditCards(filtered);
      Api.getCustomerSavedCards();
    }
    Api.deleteCustomerCreditCard({ payload, onSuccess });
    AnalyticsService.personalAreaRemoveCreditCard('Remove Card')
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
                newCard={newCard}
                removeCreditCard={() => removeCreditCard(card.token)}
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
    <div className={styles["personal-area-mobile-credit-wrap"]}>
      <GeneralHeader
        title={translate("personalArea_creditCard_title")}
        back
        backOnClick={goBack}
        gradient
      />

      <div className={styles["body"]}>
        {savedCreditCards && Object.values(savedCreditCards).length > 0
          ? renderCreditCards()
          : renderNoCards()}
      </div>
    </div>
  );
}
