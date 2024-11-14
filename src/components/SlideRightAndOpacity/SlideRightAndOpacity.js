import { animated, useSpring, easings } from "@react-spring/web";
import React, { forwardRef } from "react";

const SlideRightAndOpacityRef = (props, ref) => {
  const { delay = 0, children } = props;

  const styles = useSpring({
    from: {
      opacity: 0,
      x: -100,
    },
    to: {
      opacity: 1,
      x: 0,
    },
    config: {
      duration: 1000,
      easing: easings.easeInOutElastic,
    },
    delay,
  });

  return (
    <animated.div
      className={"slide-right-and-opacity"}
      style={{
        ...styles,
      }}
    >
      {children}
    </animated.div>
  );
};

const SlideRightAndOpacity = forwardRef(SlideRightAndOpacityRef);

export default SlideRightAndOpacity;
