import React, { useEffect } from "react";
import HeaderTitle from "../HeaderTitle/HeaderTitle";
import { useSelector } from "react-redux";
import AddressListItem from "../AddressListItem/AddressListItem";
import Api from "api/requests";
import NoAddressesIcon from "/public/assets/icons/PersonalArea/personal-area-no-addresses.svg";

import styles from "./PersonalAreaAddressessMobile.module.scss";
import useKosher from "hooks/useKosher";
import useTranslate from "hooks/useTranslate";
import useStack from "hooks/useStack";
import STACK_TYPES from "constants/stack-types";
import GeneralHeader from "components/GeneralHeader/GeneralHeader";

function PersonalAreaAddressessMobile() {
  const user = useSelector((store) => store.userData);
  const isKosher = useKosher();
  const translate = useTranslate();
  const [currentScreen, setStack, goBack] = useStack(STACK_TYPES.PERSONAL_AREA);

  useEffect(() => {
    const payload = { storetypes: isKosher ? ["Kosher"] : [] };
    Api.getCustomerAddresses({ payload });
  }, []);

  const handleAddressDelete = (address) => {
    Api.deleteAddress({ payload: { uniqueId: address.id } });
  };

  const addressesToShow = (user?.addresses ?? []).filter(address => !address.isNotSaved);
  return (
    <div className={styles["personal-area-mobile-addresses-wrapper"]}>
      <GeneralHeader
        title={translate("personalArea_addresses_title")}
        back
        backOnClick={goBack}
        gradient
      />
      <div className={styles["fake-modal"]}>
        {typeof addressesToShow === "object" && addressesToShow.length > 0 ? (
          <div className={styles["addresses-list"]}>
            {addressesToShow.map((address, idx) => (
              <AddressListItem
                key={`address-${idx}`}
                onClick={handleAddressDelete}
                address={address}
              />
            ))}
          </div>
        ) : (
          <div className={styles["no-addresses-wrapper"]}>
            <h1 className={styles["no-addresses-title"]}>
              {translate("personalArea_addresses_noAddressesTitle")}
            </h1>
            <div className={styles["no-addresses-icon"]}>
              <img src={NoAddressesIcon.src} alt={""} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PersonalAreaAddressessMobile;
