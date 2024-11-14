import { animated, useSpring, easings } from "@react-spring/web";
import React, { forwardRef } from "react";

const defaultConfig = {
	duration: 1000,
	easing: easings.easeInOutExpo,
};

const SlideUpRef = (props, ref) => {
	const {
		delay = 0,
		offset = 100,
		styleConfig = defaultConfig,
		children,
	} = props;

	const styles = useSpring({
		from: {
			y: offset,
		},
		to: {
			y: 0,
		},
		config: {
			...styleConfig,
		},
		delay,
	});

	return (
		<animated.div
			className={"slide-up-and-opacity"}
			style={{
				...styles,
			}}>
			{children}
		</animated.div>
	);
};

const SlideUp = forwardRef(SlideUpRef);

export default SlideUp;
