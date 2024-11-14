import React, { useRef } from "react";
import AutoCompleteItem from "../AutoCompleteItem/AutoCompleteItem";

import basic from "./AutoCompleteList.module.scss";
import HiddableScroolBar from "components/HiddableScrollBar/HiddableScrollBar";
import {onArrows} from "../../../../../../components/accessibility/acfunctions";
import {handleArrowUpAndDown} from "../../../../../../components/accessibility/keyboardsEvents";

export default function AutoCompleteList(props) {
  const {
    data = [],
    showList = true,
    searchQuery = "",
    onSelectItem,
    extraStyles = {},
    keyToFind = "location",
    id = '',
  } = props;

  const ref = useRef();

  const styles = (className) => {
    return (basic[className] ?? "") + " " + (extraStyles[className] ?? "");
  };

  if (!showList || data.length === 0 || searchQuery.length < 2) {
    return <></>;
  }

  const handleSelectItem = (item) => {
    typeof onSelectItem === "function" && onSelectItem(item);
  };

  const handleKeyboardEvents = (event) => {
    onArrows(event, ref);
  };
  return (
    <div className={styles("autocomplete-list")}>
      <HiddableScroolBar
        isOpen={true}
        numberOfOptions={data.length}
        listref={ref}
        extraStyles={basic}
      >
        <div id={id} className={styles("autocomplete-menu")} ref={ref} role={'list'}
             onKeyDown={(event) => handleArrowUpAndDown(event, handleKeyboardEvents)}>
          {data.map((item, index) => {
            return (
              <AutoCompleteItem
                extraStyles={basic}
                key={`_${index}-${item.location}`}
                onSelectItem={() => handleSelectItem(item)}
                searchQuery={searchQuery}
                text={item[keyToFind]}
              />
            );
          })}
        </div>
      </HiddableScroolBar>
    </div>
  );
}
