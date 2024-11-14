import LanguageDirectionService from "../../services/LanguageDirectionService";

/*
    When I have a list (for example, tabs) It moving the focus to each item on the list
*/

export const onArrows = (direction, ref) => {
	const isRTL = LanguageDirectionService.isRTL();

	const focusedElement = document.activeElement;
	const length = ref.current.children.length;
	const elementsArray = ref.current.children;

	const next = (index) => {
		const haveSibling = index > 0;
		haveSibling
			? elementsArray[index - 1].focus()
			: elementsArray[length - 1].focus();
	};
	const prev = (index) => {
		const haveSibling = index < length - 1;
		haveSibling ? elementsArray[index + 1].focus() : elementsArray[0].focus();
	};

	for (let i = 0; i < length; i++) {
		if (focusedElement !== elementsArray[i]) {
			continue;
		}
		if (isRTL) {
			if (direction === "right" || direction === "up") {
				next(i);
			}
			if (direction === "left" || direction === "down") {
				prev(i);
			}
		} else {
			if (direction === "right" || direction === "up") {
				prev(i);
			}
			if (direction === "left" || direction === "down") {
				next(i);
			}
		}
	}
};

// No need for now
export const onTabPress = (direction, ref) => {
	const tab = ref.current;
	if (direction === "next") {
		// tab.parentNode.nextSibling.focus()
	} else if (direction === "back") {
		// tab.parentNode.previousSibling.focus()
		// tab.previousElementSibling.focus()
	}
};

export function createAccessibilityText(...texts) {
	return texts
		.filter((t) => typeof t === "string")
		.map((t) => t.replaceAll("'", ""))
		.join(", ");
}
