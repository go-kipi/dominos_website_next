import React from "react";
import GeneralHeader from "../../../components/GeneralHeader/GeneralHeader";
import ChooseBranchWithLocation from "../../../popups/components/Delivery/pickup/ChooseBranchFromListOrMap";
import styles from "./index.module.scss";
import useTranslate from "hooks/useTranslate";

export default function BranchesMobile(props) {
  const translate = useTranslate();
  return (
    <div className={styles["container"]}>
      <GeneralHeader
        hamburger
        title={translate("branchesScreen_header_title")}
      />

      <div className={styles["popup-like"]}>
        <ChooseBranchWithLocation
          showHeader={false}
          isOnBranchesScreen={true}
          useLink={true}
          showAutoComplete={true}
        />
      </div>
    </div>
  );
}
