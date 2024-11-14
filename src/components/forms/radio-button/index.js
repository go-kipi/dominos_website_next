import {CHECKBOX_VARAINTS} from "constants/checkbox-variants";
import React from "react";
import darkEmpty from "/public/assets/checkbox/kosher-checkbox-dark.svg";
import darkFull from "/public/assets/checkbox/kosher-checkbox-selected-dark.svg";
import lightEmpty from "/public/assets/checkbox/kosher-checkbox.svg";
import lightFull from "/public/assets/checkbox/kosher-checkbox-selected.svg";
import styles from "./radiobutton.module.scss";

function RadioButton(props) {
  const {
    className,
    variant = CHECKBOX_VARAINTS.LIGHT,
    overrideVariant = false,
    options,
    name,
    value,
    onChange,
    showError = false,
    errorMessage = "",
    emptyImage,
    checkedImage,
  } = props;

  function onChangeHandler(event) {
    const id = event.target.id;
    onChange(name, id);
  }

  function doesPhotoExsits() {
    return emptyImage !== undefined || checkedImage !== undefined;
  }

  function getImage(isSelected) {
    if (overrideVariant && checkedImage && emptyImage) {
      return isSelected ? checkedImage : emptyImage;
    } else {
      if (variant == CHECKBOX_VARAINTS.LIGHT) {
        return isSelected ? lightFull : lightEmpty;
      } else {
        return isSelected ? darkFull : darkEmpty;
      }
    }
  }

  function getCorrectImage(id) {
    const isSelected = id === value;
    const src = getImage(isSelected);
    return <img className="radio-img" src={src} alt={''}/>;
  }

  function getContentBasedOnDoesPhotoExsits(id) {
    if (isStyled) {
      return getCorrectImage(id);
    } else {
      return (
          <div className="default-radio">
            <span className="dot"></span>
          </div>
      );
    }
  }

  const isStyled = doesPhotoExsits();

  return (
      <div className={"radios-wrapper " + className}>
        {options.map((item) => (
            <div key={item.id} className="radio-wrapper">
              <input
                  className="radio"
                  type="radio"
                  name={name}
                  id={item.id}
                  onChange={onChangeHandler}
              />
              <label htmlFor={item.id} className="label-radio">
                {getContentBasedOnDoesPhotoExsits(item.id)}

                {item.text}
              </label>
            </div>
        ))}

        {showError ? <div className="error-text">{errorMessage}</div> : ""}
      </div>
  );
}

export default RadioButton;
