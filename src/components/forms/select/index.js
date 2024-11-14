import clsx from "clsx";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import DropDown from "/public/assets/icons/drop-down.svg";

import basic from "./select.module.scss";
import {
  TAB_INDEX_DEFAULT,
  TAB_INDEX_HIDDEN,
} from "constants/accessibility-types";
import useTranslate from "../../../hooks/useTranslate";

const NO_HIGHLIGHT = -1;
function Select(props) {
  const {
    label = "",
    options,
    disabled = false,
    mobileNativeSelect = false,
    selectedId = -1,
    onChange,
    name,
    className = "",
    showError = false,
    errorMessage = "",
    dropDownImg = DropDown,
    extraStyles = {},
    ariaLabel = "",
    additionalImg = "",
    customActiveClass = "",
  } = props;

  const styles = (className) => {
    return (basic[className] ?? "") + " " + (extraStyles[className] ?? "");
  };
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedItem, setHighlightedItem] = useState(NO_HIGHLIGHT);
  const [selectedItem, setSelectedItem] = useState({ id: -1, text: label });
  const deviceState = useSelector((state) => state.deviceState);
  const dropRef = useRef();
  const translate = useTranslate();
  const handleClick = (event) => {
    // hanles when user clicks the button
    event.stopPropagation();
    const newState = !isOpen;
    setIsOpen(newState);
  };

  useEffect(() => {
    const text = getSelectedById(selectedId);
    if (text !== undefined) {
      setSelectedItem({ id: selectedId, text: text.text });
    }
  }, [selectedId]);

  const handleClickOutside = () => {
    // hanles when user clicks outside of the select
    setHighlightedItem(NO_HIGHLIGHT);
    setIsOpen(false);
  };

  const focusHighlight = (highlight) => {
    if (highlight !== NO_HIGHLIGHT) {
      const focusedElement = document.activeElement;
      dropRef.current.children[highlight].focus();
    }
  };
  const handleKeyDown = (event) => {
    let highlightedItemCounter = highlightedItem;
    let selectedItemCounter = selectedItem;
    switch (event.key) {
      case "ArrowDown":
        if (isOpen) {
          event.preventDefault();
          highlightedItemCounter + 1 > options.length - 1
            ? (highlightedItemCounter = 0)
            : highlightedItemCounter++;

          focusHighlight(highlightedItemCounter);
          setHighlightedItem(highlightedItemCounter);

          setIsOpen(true); // When its lose focus i need to bring focus back
        }
        break;

      case "ArrowUp":
        if (isOpen) {
          event.preventDefault();
          highlightedItemCounter - 1 < 0
            ? (highlightedItemCounter = options.length - 1)
            : highlightedItemCounter--;

          focusHighlight(highlightedItemCounter);
          setHighlightedItem(highlightedItemCounter);
          setIsOpen(true); // When its lose focus i need to bring focus back
        }
        break;

      case "Enter":
        selectedItemCounter = options[highlightedItemCounter];
        if (selectedItemCounter && highlightedItemCounter !== NO_HIGHLIGHT) {
          typeof onChange === "function" &&
            onChange(name, selectedItemCounter.id, selectedItemCounter.text);
          setSelectedItem(selectedItemCounter);
          setHighlightedItem(NO_HIGHLIGHT);
        }
        setIsOpen(false);
        break;

      case "Escape":
        setIsOpen(false);
        setHighlightedItem(NO_HIGHLIGHT);
        break;
      default:
        setIsOpen(false);
        setHighlightedItem(NO_HIGHLIGHT);
        break;
    }
  };

  const handleOptionClick = (event) => {
    // hanles when user clicks an option
    let selectedOption = null;

    if (event.target.tagName === "SELECT") {
      selectedOption = getSelectedByText(event.target.value);
    } else {
      selectedOption = getSelectedById(event.target.id);
    }
    setSelectedItem(selectedItem);
    setIsOpen(false);

    onChange(name, selectedOption.id, selectedOption.text);
  };
  function getSelectedByText(text) {
    const selectedOption = options.find((item) => {
      return item.text === text;
    });
    return selectedOption;
  }
  function getSelectedById(id) {
    const selectedOption = options.find((item) => {
      return item.id === id;
    });
    return selectedOption;
  }

  const activeClass = isOpen ? styles("active") : "";
  const disabledClass = disabled ? styles("disabled") : "";
  const startClass = selectedId === -1 ? styles("start") : "";

  const useNativeSelect = !deviceState.isDesktop && mobileNativeSelect;
  let content = "";
  if (useNativeSelect) {
    content = (
      <div className={clsx(styles("select-wrapper"), className)}>
        <select
          value={selectedItem.text}
          className={startClass}
          onChange={handleOptionClick}
        >
          <option hidden>{selectedItem.text}</option>
          {options.map((item, index) => {
            return <option key={index}> {item.text} </option>;
          })}
        </select>
        {showError ? (
          <div className={styles("error-text")}>{errorMessage}</div>
        ) : (
          ""
        )}
      </div>
    );
  } else {
    content = (
      <div
        className={clsx(
          styles("select-wrapper"),
          activeClass,
          isOpen ? customActiveClass : "",
          disabled ? styles("disable") : "",
          className
        )}
        // onBlur={handleClickOutside}
        onKeyDown={handleKeyDown}
      >
        <button
          className={clsx(styles("select_button"), disabledClass, startClass)}
          onClick={handleClick}
          aria-label={ariaLabel}
          aria-haspopup={"true"}
          aria-expanded={isOpen}
          type="button"
        >
          {additionalImg && (
            <img
              src={additionalImg.src}
              alt={"network img"}
              aria-hidden={true}
            />
          )}
          {selectedItem.text}
          <img
            src={dropDownImg.src}
            className={styles("dropdown-img")}
            alt={translate("accessibility_imageAlt_dropDown")}
          />
        </button>

        <ul ref={dropRef} className={styles("dropdown_menu")} role={"list"}>
          {options.map((item, index) => {
            let activeOption = "";
            let hightlightedOption = "";

            if (item.id === selectedItem.id) {
              activeOption = styles("active");
            }

            if (index === highlightedItem) {
              hightlightedOption = styles("highlight");
            }

            return (
              <li
                className={clsx(
                  styles("select-option"),
                  activeOption,
                  hightlightedOption
                )}
                key={index}
                id={item.id}
                onMouseDown={handleOptionClick}
                role={"listitem"}
                aria-label={item.text}
                aria-selected={selectedItem.id === item.id}
                tabIndex={isOpen ? TAB_INDEX_DEFAULT : TAB_INDEX_HIDDEN}
              >
                {item.text}
              </li>
            );
          })}
        </ul>
        {showError ? (
          <div className={styles("error-text")}>{errorMessage}</div>
        ) : (
          ""
        )}
      </div>
    );
  }

  return <>{content}</>;
}

export default Select;
