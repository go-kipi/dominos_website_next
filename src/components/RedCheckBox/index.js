import React from "react";
import EmptyImage from "/public/assets/checkbox/red-checkbox-empty.svg";
import FullImage from "/public/assets/checkbox/red-checkbox-full.svg";
import clsx from "clsx";

const RedCheckBox = (props) => {
    const {
        id,
        value,
        label,
        className = "",
        showError = false,
        errorMessage = "",
        onChange = () => {
        },
    } = props;

    const handleChange = (e) => {
        typeof onChange === "function" && onChange(id);
    };

    function doesPhotoExists() {
        return EmptyImage !== undefined || FullImage !== undefined;
    }

    const img = value ? (
        <img
            src={FullImage.src}
            className="img"
            alt={''}
        />
    ) : (
        <img
            src={EmptyImage.src}
            className="img"
            alt={''}
        />
    );

    const isStyled = doesPhotoExists();

    const styledImages = isStyled ? img : "";
    const labelClass = isStyled ? "styled" : "";
    return (
        <div
            className={clsx(
                "checkbox-wrapper",
                labelClass,
                className,
                value ? "selecetd" : "",
            )}
            onClick={handleChange}>
            <label htmlFor={id}>
                {styledImages}
                <span className="label">{label}</span>
            </label>
            {showError ? <div className="error-text">{errorMessage}</div> : ""}
        </div>
    );
};

export default RedCheckBox;
