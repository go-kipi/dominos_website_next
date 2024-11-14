import useAnimationDirection from "hooks/useAnimationDirection";
import useStack from "hooks/useStack";
import { useSelector } from "react-redux";
import { CSSTransition, TransitionGroup } from "react-transition-group";

function SlideAnimation({ stack, children }) {
	const [currentScreen] = useStack(stack);
	const stackState = useSelector((store) => store.stackState[stack]);
	const animationClassTransition = useAnimationDirection();

	return (
		<TransitionGroup
			className={`${"transition-wrapper"} ${animationClassTransition}`}>
			<CSSTransition
				key={currentScreen.type}
				timeout={300}
				enter={Array.isArray(stackState) ? stackState.length > 0 : true}
				exit={Array.isArray(stackState) ? stackState.length > 0 : true}
				classNames={"slide"}>
				<div className="body-wrapper">{children}</div>
			</CSSTransition>
		</TransitionGroup>
	);
}
export default SlideAnimation;
