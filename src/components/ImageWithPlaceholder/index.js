import clsx from "clsx";
import React, { useState } from "react";
import styles from "./index.module.scss";

function ImageWithPlaceholderRef(props, ref) {
  const {
    className = "",
    placeholderClassName = "",
    alt = "",
    src,
    placeholderSrc,
    ariaHidden = false,
  } = props;
  const [isLoaded, setIsLoaded] = useState(false);

  function onLoad() {
    setIsLoaded(true);
  }

  function onError() {
    setIsLoaded(false);
  }

  return (
    <>
      <img
        ref={ref}
        src={src}
        onLoad={onLoad}
        onError={onError}
        className={clsx(
          className,
          isLoaded ? styles["loaded"] : styles["hidden"]
        )}
        alt={alt}
        aria-hidden={ariaHidden}
      />
      <img
        src={placeholderSrc}
        aria-hidden={ariaHidden}
        className={clsx(placeholderClassName, isLoaded ? styles["hidden"] : "")}
      />
    </>
  );
}

const ImageWithPlaceholder = React.forwardRef(ImageWithPlaceholderRef);

export default ImageWithPlaceholder;
