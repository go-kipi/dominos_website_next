import React from "react";
import NoSavedPizzasIcon from "/public/assets/icons/PersonalArea/nofavorites.svg";

import styles from "./NoSavedPizzaDesktop.module.scss";
import clsx from "clsx";
import useTranslate from "hooks/useTranslate";

function NoSavedPizzaDesktop(props) {
  const translate = useTranslate();

  function getPlaceHolders() {
    const components = [];

    for (let i = 0; i < 6; i++) {
      const component = (
        <div className={styles["no-saved-pizzas-image-wrapper"]}>
          <img src={NoSavedPizzasIcon.src} alt={translate("alt_noSavedPizza")} />
        </div>
      );
      components.push(component);
    }
    return components;
  }

  return (
    <div className={styles["no-saved-pizza-desktop-perosonal-area"]}>
      <span className={styles["no-saved-pizzas-title"]}>
        {translate("personalArea_savedPizzas_noSavedPizza_title_desktop_1")}
      </span>
      <span className={clsx(styles["bold"], styles["no-saved-pizzas-title"])}>
        {translate("personalArea_savedPizzas_noSavedPizza_title_desktop_2")}
      </span>
      <span className={styles["no-saved-pizzas-subtitle"]}>
        {translate("personalArea_savedPizzas_noSavedPizza_subtitle")}
      </span>
      <div className={styles["no-saved-pizza-placeholders"]}>{getPlaceHolders()}</div>
    </div>
  );
}

export default NoSavedPizzaDesktop;
