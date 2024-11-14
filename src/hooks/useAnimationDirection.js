import { useSelector } from "react-redux";
import LanguageDirectionService from "services/LanguageDirectionService";

function useAnimationDirection() {
  const stackDirection = useSelector((store) => store.stackState.direction);
  const isrtl = LanguageDirectionService.isRTL();

  const isForward = stackDirection === "forward";
  let animationClassTransition = "";
  if (!isForward) {
    animationClassTransition = isrtl ? "forward" : "backward";
  } else {
    animationClassTransition = isrtl ? "backward" : "forward";
  }

  return animationClassTransition;
}

export default useAnimationDirection;
