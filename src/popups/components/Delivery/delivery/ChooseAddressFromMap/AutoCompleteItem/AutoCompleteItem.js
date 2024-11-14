import clsx from "clsx";
import React, { useRef } from "react";
import basic from "./AutoCompleteItem.module.scss";

export default function AutoCompleteItem(props) {
  const { text, onSelectItem, searchQuery, extraStyles = {} } = props;
  const lastValidAutoComplete = useRef();

  const styles = (className) => {
    return (basic[className] ?? "") + " " + (extraStyles[className] ?? "");
  };

  const formatText = (text) => {
    const parts = text.split(new RegExp(`(${searchQuery})`, "gi"));
    return (
      <span className={styles("autocomplete-item")}>
        {parts.map((part, i) => (
          <span
            key={i}
            className={
              part.toLowerCase() === searchQuery.toLowerCase()
                ? styles("autocomplete-item-bold")
                : ""
            }
          >
            {part}
          </span>
        ))}
      </span>
    );
  };

  return (
    <button onClick={onSelectItem} className={styles("autocomplete-item-wrapper")} role={'listitem'}>
      {formatText(text)}
    </button>
  );
}
