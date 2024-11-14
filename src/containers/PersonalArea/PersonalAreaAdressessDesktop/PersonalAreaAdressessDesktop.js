import React, { useEffect } from "react";
import Api from "api/requests";
import { useSelector } from "react-redux";

import AddressListItem from "../AddressListItem/AddressListItem";
import NoAddressesIcon from "/public/assets/icons/PersonalArea/personal-area-no-addresses.svg";
import styles from "./PersonalAreaAdressessDesktop.module.scss";
import useKosher from "hooks/useKosher";
import useTranslate from "hooks/useTranslate";

function PersonalAreaAdressessDesktop() {
  const user = useSelector((store) => store.userData);
  const isKosher = useKosher();
  const translate = useTranslate();

  useEffect(() => {
    const payload = { storetypes: isKosher ? ["Kosher"] : [] };
    Api.getCustomerAddresses({ payload });
  }, []);

  const handleAddressDelete = (address) => {
    Api.deleteAddress({ payload: { uniqueId: address.id } });
  };

  const addressesToShow = (user?.addresses ?? []).filter(
    (address) => !address.isNotSaved
  );
  return (
    <div className={styles["personal-area-addresses-wrapper"]}>
      {typeof addressesToShow === "object" && addressesToShow.length > 0 ? (
        <>
          <h1 className={styles["title"]}>
            {translate("personalArea_addresses_title")}
          </h1>
          <div className={styles["addresses-list-wrapper"]}>
            <div className={styles["container"]}>
              {addressesToShow.map((address, idx) => (
                <AddressListItem
                  key={`address-${idx}`}
                  onClick={handleAddressDelete}
                  address={address}
                />
              ))}
            </div>
          </div>
        </>
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
  );
}

export default PersonalAreaAdressessDesktop;
