import React from "react";

import Flag from "/public/assets/icons/white-flag.svg";
import IconTitle from "containers/Menu/components/IconTitle/IconTitle";
import SavedPizzaCard from "../SavedPizzaCard/SavedPizzaCard";

import styles from "./PersonalAreaSavedPizzasMobile.module.scss";
import useTranslate from "hooks/useTranslate";

function PersonalAreaSavedPizzasMobile(props) {
  const { savedPizzas } = props;
  const translate = useTranslate();

  return (
    <div className={styles["personal-area-saved-pizzas-mobile"]}>
      <div className={styles["personal-area-saved-pizzas-title"]}>
        <IconTitle
          title={translate("personalArea_savedPizzas_title")}
          icon={Flag}
        />
      </div>

      <div className={styles["personal-area-saved-pizzas-wrapper"]}>
        {Object.values(savedPizzas).map((pizza, index) => {
          return (
            <div
              className={styles["saved-pizza-item"]}
              key={"saved-pizza" + index}
            >
              <SavedPizzaCard name={pizza.name} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PersonalAreaSavedPizzasMobile;
