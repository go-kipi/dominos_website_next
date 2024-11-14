import React, { useRef, useEffect, useState } from "react";

import styles from "./index.module.scss";

import LottieAnimation from "components/LottieAnimation";

import UnfoldAnimation from "animations/blue-button-open1.json";
import FoldAnimation from "animations/blue-button-close.json";
import Price from "../../../../components/Price";
import clsx from "clsx";

function BlueButton(props) {
  const {
    text = "",
    onClick,
    className = "",
    classNameInner,
    price,
    priceAfterSale,
    showPriceBeforeDiscount,
  } = props;

  const [animationState, setAnimationState] = useState("unfold");

  function onUnfoldAnimationFinish() {
    setAnimationState("btn");
  }

  function onButtonClick() {
    setAnimationState("fold");

    setTimeout(() => {
      onClick();
    }, 150);
  }

  function onFoldAnimationFinish() {
    setAnimationState("unfold");
  }

  function RenderUnfoldAnimation() {
    return (
      <div className={styles["animation-unfolding-wrapper"]}>
        <LottieAnimation
          animation={UnfoldAnimation}
          onComplete={onUnfoldAnimationFinish}
        />
      </div>
    );
  }
  function RenderFoldAnimation() {
    return (
      <div className={styles["animation-folding-wrapper"]}>
        <LottieAnimation
          animation={FoldAnimation}
          onComplete={onFoldAnimationFinish}
        />
      </div>
    );
  }

  function RenderAnimation() {
    if (animationState === "unfold") {
      return RenderUnfoldAnimation();
    } else if (animationState === "fold") {
      return RenderFoldAnimation();
    } else if (animationState === "btn") {
      return RenderButton();
    }
  }

  function RenderButton() {
    return (
      <button
        className={clsx(
          styles["blue-btn"],
          styles["btn-wrapper"],
          styles["blue-btn"]
        )}
        onClick={onButtonClick}
      >
        <div className={clsx(styles["btn-inner"], classNameInner || "")}>
          <span className={styles["text"]}>{text}</span>
          {typeof parseInt(price) === "number" && (
            <div className={styles["prices-wrapper"]}>
              {showPriceBeforeDiscount && (
                <Price
                  className={clsx(styles["price"], styles["old-price"])}
                  value={price}
                  currency={"shekel"}
                  mark={true}
                  extraStyles={styles}
                />
              )}

              <Price
                className={clsx(styles["price"], styles["new-price"])}
                value={priceAfterSale}
                currency={"shekel"}
                extraStyles={styles}
              />
            </div>
          )}
        </div>
      </button>
    );
  }
  return <div className={className}>{RenderAnimation()}</div>;
}

export default BlueButton;
