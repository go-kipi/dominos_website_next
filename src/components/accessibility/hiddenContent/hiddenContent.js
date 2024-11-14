import React from "react";
import styles from "./hiddenContent.module.scss";
import { useSelector } from "react-redux";
import clsx from "clsx";

/**
 * A button element to that can be accessible only when focusing
 *
 * @param {Array} elements - Array of objects.
 * @param {string} className - additional
 * @param {string} ariaLabelledBy - aria-labelledby attribute
 */
export default function HiddenContent({
  elements = [],
  className = "",
  ariaLabelledBy = "",
}) {
    return (
        elements.map((element, index) => {
          const {text, onClick} = element
          return (
              <Content
                key={index}
                index={index}
                className={className}
                onClick={onClick}
                text={text}
                ariaLabelledBy={ariaLabelledBy}
              />
          )
        })
    )
}

const Content = ({
    index,
    onClick,
    text = '',
    ariaLabelledBy = '',
    className = ''
 }) => {
    return (
        <button
            id={index}
            className={clsx(styles["hidden-content"], className)}
            onClick={onClick}
            aria-label={text}
            aria-labelledby={ariaLabelledBy}
            role={'link'}
        >
            {text}
        </button>
    )
}
