import { animated, useSpring, easings } from "@react-spring/web";
import React, { forwardRef } from "react";
import LanguageDirectionService from "services/LanguageDirectionService";

const defaultConfig = {
	duration: 1000,
	easing: easings.easeInOutExpo,
};

const SlideRightRef = (props, ref) => {
	const {
		delay = 0,
		offset = 100,
		styleConfig = defaultConfig,
		children,
		onAnimationEnd,
	} = props;
	const isRTL = LanguageDirectionService.isRTL();

	const styles = useSpring({
		from: {
			x: isRTL ? -offset : offset,
		},
		to: {
			x: 0,
		},
		onRest: onAnimationEnd,
		config: {
			...styleConfig,
		},
		delay,
	});

	return (
		<animated.div
			className={"slide-right-and-opacity"}
			style={{
				...styles,
			}}>
			{children}
		</animated.div>
	);
};

const SlideRight = forwardRef(SlideRightRef);

export default SlideRight;
