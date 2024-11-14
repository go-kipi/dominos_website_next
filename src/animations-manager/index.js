import React from "react";
import { useSelector } from "react-redux";
import animationTypes from "constants/animationTypes";

/* Animation Components */
import {MovingImage, MovingSavedPizza} from "./animations";

/* Assets */

function Animations() {
  const animationArray = useSelector((store) => store.animationArray);

  function getAnimationByType(animation) {
    const TYPES = {
      [animationTypes.MOVING_IMAGE]: (
        <MovingImage
          key={animation.id}
          payload={animation.payload}
          id={animation.id}
        />
      ),
      [animationTypes.MOVING_SAVED_PIZZA]: (
        <MovingSavedPizza
          key={animation.id}
          payload={animation.payload}
          id={animation.id}
        />
      ),
    };
    return Object.keys(TYPES).includes(animation.type)
      ? TYPES[animation.type]
      : TYPES[animationTypes.MOVING_IMAGE];
  }

  function RenderAnimations() {
    const animationsToRender = animationArray.map((animation) => {
      return getAnimationByType(animation);
    });
    return animationsToRender;
  }

  return <>{RenderAnimations()}</>;
}

export default Animations;
