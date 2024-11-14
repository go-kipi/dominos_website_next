import clsx from "clsx";
import React, { useState } from "react";

import styles from './index.module.scss';

const AutoComplete = (props) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightedId, setHighlighted] = useState(0);
  const inputRef = React.createRef();

  const handleClickOutside = () => {
    setOpen(false);
  };
  const handleClick = (e) => {
    setOpen(!open);
  };
  const onChange = (e) => {
    setHighlighted(0);
    setQuery(e.target.value);
  };

  const handleOptionClick = (e, option) => {
    e.preventDefault();
    setOpen(false);
    setQuery(option.text);
    props.onSelect(option.payload);
    inputRef.current.blur();
    setHighlighted(0);
  };
  const getList = () => {
    const list = [];

    const options = props.options.filter(
      (option) => option.text.indexOf(query) !== -1
    );

    for (const item in options) {
      const option = options[item];
      const highlightedOption = option.id === highlightedId ? styles["highlight"] : "";

      list.push(
        <li
          className={clsx(styles["auto-option"], highlightedOption)}
          key={option.id}
          id={option.id}
          onMouseDown={(e) => handleOptionClick(e, option)}
        >
          {option.text}
        </li>
      );
    }
    return list;
  };
  const handleKeyDown = (event) => {
    event.stopPropagation();
    let highlightedItem;
    const options = props.options.filter(
      (option) => option.text.indexOf(query) !== -1
    );

    const selectedOption = props.options[highlightedId];

    switch (event.key) {
      case "ArrowDown":
        highlightedItem =
          highlightedId + 1 > options.length - 1 ? 0 : highlightedId + 1;
        setHighlighted(highlightedItem);
        break;

      case "ArrowUp":
        highlightedItem =
          highlightedId - 1 < 0 ? options.length - 1 : highlightedId - 1;
        setHighlighted(highlightedItem);
        break;

      case "Enter":
        props.onSelect(selectedOption.payload);
        setQuery(selectedOption.text);
        setOpen(false);
        event.target.blur();
        setHighlighted(0);
        break;

      case "Escape":
        setOpen(false);
        setHighlighted(0);
        event.target.blur();
        break;
      default:
        break;
    }
  };
  const optionList = getList();
  const activeClass = open && optionList.length > 0 ? styles["active"] : "";

  return (
    <div
      className={clsx(
        styles["auto-wrapper"],
        props.className,
        activeClass,
        (props.disabled ? styles["disable"] : "")
  )}
      onBlur={handleClickOutside}
      onKeyDown={handleKeyDown}
    >
      <input
        className={styles["auto-input"]}
        name={props.name}
        type="text"
        autoComplete="off"
        placeholder={props.placeholder}
        onClick={(e) => handleClick(e)}
        onChange={(e) => onChange(e)}
        value={query}
        ref={inputRef}
      />

      <ul className={styles["auto-menu"]}>{optionList}</ul>
    </div>
  );
};

export default AutoComplete;
