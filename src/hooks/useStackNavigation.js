import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Actions from "redux/actions";
import { Store } from "redux/store";
import useStack from "./useStack";

const useStackNavigation = (stack = "", is2D = false) => {
	const dispatch = useDispatch();
	const [row, setRow] = useState(0);
	const [column, setColumn] = useState(0);
	const [_currentIndex, addToStack, _, getIndex, resetStack] = useStack(stack);
	const matrixState = useSelector((store) => store.stackState[stack]);

	const setStack = (payload, populateStack = false) => {
		if (is2D) {
			if (matrixState?.[row]?.length > 0 || populateStack) {
				// Note: Set populateStack to prevent a race condition when adding multiple stacks to set history route and then navigating to the last one
				setColumn((prev) => prev + 1);
			}
			if (
				!matrixState?.[row]?.[column + 1] ||
				matrixState?.[row]?.[column + 1]?.type !== payload.type
			) {
				addToStack(payload, row);
			}
		} else {
			if (
				!matrixState?.[row + 1] ||
				matrixState?.[row + 1]?.type !== payload.type
			) {
				addToStack(payload);
			}
			if (row > 0 || (row === 0 && typeof matrixState?.[row] !== "undefined")) {
				setRow((prev) => prev + 1);
			}
		}
	};

	const goBack = (remove = false) => {
		if (remove) {
			if (is2D) {
				dispatch(Actions.subGoBack({ key: stack, index: row }));
			} else {
				dispatch(Actions.goBack({ key: stack }));
			}
		} else {
			if (is2D) {
				if (column > 0) {
					dispatch(Actions.subGoBack({ key: stack, index: row }));
					setColumn((prev) => prev - 1);
				} else if (row > 0) {
					// dispatch(Actions.resetBuilder());
					setRow((prev) => prev - 1);
					setColumn(getIndex(row - 1).length - 1);
					dispatch(Actions.setStackDirection(false));
				}
			} else if (row > 0) {
				setRow((prev) => prev - 1);
			}
		}
	};

	const goForward = (callback, isInternal = false) => {
		if (is2D) {
			if (isInternal) {
				return typeof callback === "function" && callback();
			} else {
				const lastRow = matrixState.length - 1 === row;

				if (!lastRow) {
					setRow((prev) => prev + 1);
					const nextRow = row + 1;
					setColumn(matrixState[nextRow].length - 1);
				} else {
					return typeof callback === "function" && callback();
				}
			}
		} else {
			const lastMain = matrixState.length - 1 === row;
			if (!lastMain) {
				setRow((prev) => prev + 1);
			} else {
				typeof callback === "function" && callback();
			}
		}
	};

	const setMainIndex = (index) => {
		const matrix = Store.getState().stackState[stack];
		if (matrix && matrix?.length) {
			if (index >= 0) {
				const column = matrix[index] ? matrix[index].length - 1 : 0;
				setRow(index);
				setColumn(column);
				dispatch(Actions.setStackDirection(index > row));
			}
		}
	};

	const removeFrom2DStack = (stackIndex, removeIndex) => {
		dispatch(
			Actions.removeFrom2DStack({ key: stack, index: stackIndex, removeIndex }),
		);
		setRow(stackIndex);
		setColumn(removeIndex - 1);
	};

	const duplicateSubStack = (index, amount, shouldDuplicateLast = false) => {
		dispatch(
			Actions.duplicateSubStack({
				stack,
				currentIndex: index,
				steps: amount,
				shouldDuplicateLast,
			}),
		);
	};

	const replace = (payload) => {
		dispatch(
			Actions.replaceStack({
				key: stack,
				index: row,
				payload,
			}),
		);
	};

	const resetStackHandler = () => {
		resetStack();
		setRow(0);
		setColumn(0);
	};

	let currentScreen;
	if (is2D) {
		currentScreen = getIndex(row)?.[column];
	} else {
		currentScreen = getIndex(row);
	}
	const current = {
		screen: currentScreen,
		main: row,
		sub: column,
		setMain: setMainIndex,
	};

	const isFirst = row === 0 && column === 0;
	return {
		current,
		setStack,
		goBack,
		goForward,
		resetStack: resetStackHandler,
		isFirst,
		replace,
		duplicateSubStack,
		removeFrom2DStack,
	};
};

export default useStackNavigation;
