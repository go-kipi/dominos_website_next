import React from "react";

import styles from "./NoSavedPizzasMobile.module.scss";

import NoSavedPizzasIcon from "/public/assets/icons/PersonalArea/nofavorites.svg";
import useTranslate from "hooks/useTranslate";

function NoSavedPizzasMobile(props) {
  const translate = useTranslate();

  return (
    <div className={styles["no-saved-pizzas-wrapper"]}>
      <div className={styles["no-saved-pizzas-image-wrapper"]}>
        <img src={NoSavedPizzasIcon.src} alt={translate("alt_noSavedPizza")} />
      </div>
      <span className={styles["no-saved-pizzas-title"]}>
        {translate("personalArea_savedPizzas_noSavedPizza_title")}
      </span>
      <span className={styles["no-saved-pizzas-subtitle"]}>
        {translate("personalArea_savedPizzas_noSavedPizza_subtitle")}
      </span>
    </div>
  );
}

export default NoSavedPizzasMobile;
