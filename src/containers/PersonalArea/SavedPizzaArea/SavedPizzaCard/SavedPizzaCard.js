import { generateUniqueId } from "utils/functions";
import Api from "api/requests";
import MultipleOptionsIndicator from "components/MultipleOptionsIndicator";
import React from "react";

import styles from "./SavedPizzaCard.module.scss";

import DeletePizzaIcon from "/public/assets/icons/multipleOptionsIndicator/delete-pizza.svg";
import useTranslate from "hooks/useTranslate";
import AnalyticsService from "utils/analyticsService/AnalyticsService";
import { useSelector } from "react-redux";

const deleteId = generateUniqueId(8);

function SavedPizzaCard(props) {
  const { name } = props;
  const deviceState = useSelector((store) => store.deviceState);
  const isMobile = deviceState.isMobile;
  const shouldClipName = typeof name === 'string' && name.length > 15 && isMobile;
  const translate = useTranslate();

  const options = [
    {
      id: deleteId,
      text: translate("personalArea_savedPizzas_delete"),
      onPress: deleteSavedPizza,
      canChange: true,
      img: DeletePizzaIcon,
    },
  ];

  function deleteSavedPizza() {
    const payload = { kitName: name };
    Api.deleteSavedKit({
      payload,
      onSuccess: (res) => {
        if (res.status === "success") {
          const payload = {};
          Api.getSavedKits({ payload });
          AnalyticsService.personalAreaDeleteOwnPizza('delete own pizza')
        }
      },
    });
  }

  return (
    <div className={styles["personal-area-saved-pizza-card"]} tabIndex={0} role={'button'}>
      <span className={styles["saved-pizza-name"]}>{shouldClipName ? `${name.substring(0, 12)}...` : name}</span>
      <div className={styles["saved-pizzas-options-wrapper"]}>
        <MultipleOptionsIndicator
          options={options}
          className={styles["saved-pizzas-options"]}
          extraStyles={styles}
          tooltipAlt={translate('accessibility_imageAlt_tooltip')}
        />
      </div>
    </div>
  );
}

export default SavedPizzaCard;
