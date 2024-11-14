import React, {useEffect, useState} from "react";

import LottieAnimation from "components/LottieAnimation";
import Checkbox from "components/forms/checkbox";

import {handleKeyPress} from "../../../../components/accessibility/keyboardsEvents";

import styles from "./Language.module.scss";
import FullCheckbox from "/public/assets/icons/full-radio.svg";
import EmptyCheckbox from "/public/assets/icons/empty-radio.svg";
import LanguageAnimation from "animations/select-lang.json";
import Button from "components/button";
import LanguageDirectionService from "services/LanguageDirectionService";
import { LANGUAGES } from "constants/Languages";
import useTranslate from "hooks/useTranslate";
import AnalyticsService from "utils/analyticsService/AnalyticsService";

const defaultOptions = {
  loop: false,
  autoplay: true,
  animation: LanguageAnimation,
};

function Language(props) {
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [focusedElement, setFocusedElement] = useState(null)
  const translate = useTranslate();
  const { navigateToPhone } = props;

  function onKeyDown() {
      if(focusedElement) {
          const {id} = focusedElement.target
          setSelectedLanguage(id)
      }
  }
  function onFocus(event) {
      setFocusedElement(event)
  }

  function onBlur() {
      setFocusedElement(null)
  }

  function onButtonPress() {
    LanguageDirectionService.changeLanguage(selectedLanguage);
    navigateToPhone();
    AnalyticsService.onBoardingLanguageSet(selectedLanguage)
  }

  function onChangeHandler(e) {
    const { id } = e.target;
    setSelectedLanguage(id);
  }

  const text = selectedLanguage
    ? selectedLanguage === LANGUAGES.HEBREW.name
      ? translate("onboarding_language_btn_text_he")
      : selectedLanguage === LANGUAGES.ENGLISH.name
      ? translate("onboarding_language_btn_text_en")
      : ""
    : "";

  return (
    <div className={styles["select-language-wrapper"]}
         onKeyDown={(event) => handleKeyPress(event, onKeyDown)}>
      <div className={styles["select-language-animation-wrapper"]}>
        <LottieAnimation {...defaultOptions} />
      </div>
      <h2 id={'desc'} className={styles["select-language-title"]} tabIndex={0}>{translate("onboarding_language_title")}</h2>
      <div className={styles["choose-language"]} role={'group'}>
        <Checkbox
          className={styles["lang-radio"]}
          id={LANGUAGES.HEBREW.name}
          name={"lang"}
          label={translate("onboarding_language_he_title")}
          value={selectedLanguage === LANGUAGES.HEBREW.name}
          overrideVariant
          emptyImage={EmptyCheckbox}
          checkedImage={FullCheckbox}
          onChange={onChangeHandler}
          extraStyles={styles}
          tabIndex={0}
          onFocus={onFocus}
          onBlur={onBlur}
        />
        <div className={styles["separator"]} />
        <Checkbox
          className={styles["lang-radio"]}
          id={LANGUAGES.ENGLISH.name}
          name={"lang"}
          label={translate("onboarding_language_en_title")}
          value={selectedLanguage === LANGUAGES.ENGLISH.name}
          emptyImage={EmptyCheckbox}
          checkedImage={FullCheckbox}
          overrideVariant
          onChange={onChangeHandler}
          extraStyles={styles}
          tabIndex={0}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      </div>
      {selectedLanguage && (
        <div className={styles["actions"]}>
      <Button onClick={onButtonPress} text={text} type={'submit'}/>
        </div>
      )}
    </div>
  );
}

export default Language;
