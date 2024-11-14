import clsx from "clsx";
import React from "react";
import styles from "./FilterByList.module.scss";
export default function FilterByList(props) {
  const { data, selectedList = [], onChange } = props;
  function isIdInList(id) {
    return selectedList.includes(id);
  }

  function onFilterFieldPress(id) {
    const isSelected = isIdInList(id);

    let newList = [];
    if (isSelected) {
      newList = selectedList.filter((item) => item !== id);
    } else {
      newList = [...selectedList, id];
    }

    onChange(newList);
  }

  function RenderFilterField(item, index) {
    const isSelected = isIdInList(item.id);

    return (
      <FilterField
        id={item.id}
        text={item.text}
        key={"filter-field" + index}
        isSelected={isSelected}
        onPress={onFilterFieldPress}
      />
    );
  }

  return (
    <div className={styles["filter-by-list-wrapper"]}>
      {data.map((item, index) => {
        return RenderFilterField(item, index);
      })}
    </div>
  );
}

function FilterField(props) {
  const { text, isSelected, id, onPress } = props;

  return (
    <button
      className={clsx(
        styles["filter-field-wrapper"],
        isSelected ? styles["selected"] : ""
      )}
      onClick={() => {
        onPress(id);
      }}
      role={"checkbox"}
      aria-checked={isSelected}
    >
      <span className={clsx(styles["filter-field-text"], styles["selected"])}>
        {text}
      </span>
      <span className={styles["filter-field-text"]}>{text}</span>
    </button>
  );
}
