import React, { useEffect } from "react";
import FocusTrap from "focus-trap-react";

export default function ReactFocusTrap({
	className = "",
	isActive = true,
	children,
	paused = false,
	priority = 1,
}) {
	if (!isActive) {
		return children;
	}

	return (
		<FocusTrap paused={paused}>
			<div className={`${className} ${"priority-" + priority}`}>{children}</div>
		</FocusTrap>
	);
}
