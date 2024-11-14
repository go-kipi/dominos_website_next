import { animated, useTransition } from "@react-spring/web";
import clsx from "clsx";
import Scrollbar from "components/Scrollbar";
import React from "react";

const SlideUpAndOpacityAnimationRef = (props, ref) => {
	const {
		className,
		list,
		trail = 300,
		delay = 0,
		leave = {},
		hide = false,
		disabled = false,
		hideClassName = "hide",
	} = props;

	const transition = useTransition(!hide ? list : [], {
		keys: (item) => item.key,
		from: {
			opacity: 0,
			y: 100,
		},
		enter: { opacity: 1, y: 0 },
		trail,
		delay,
		leave,
	});

	const renderAnimated = () => {
		return transition(
			(style, item) =>
				item && (
					<animated.div
						className={`${className}-item`}
						style={
							disabled
								? { leave }
								: {
										...style,
								  }
						}>
						{item}
					</animated.div>
				),
		);
	};

	return (
		<div
			className={clsx(className, hide ? hideClassName : "")}
			ref={ref}>
			{renderAnimated()}
		</div>
	);
};
const SlideUpAndOpacityAnimation = React.forwardRef(
	SlideUpAndOpacityAnimationRef,
);

export default SlideUpAndOpacityAnimation;
