import { useSelector, useDispatch } from "react-redux";
import Actions from "redux/actions";

export default function useStack(stack) {
	const dispatch = useDispatch();

	const stackState = useSelector((store) => store.stackState[stack]);

	let currentScreen = {};
	if (stackState) {
		currentScreen = {
			type: stackState[stackState.length - 1]?.type,
			showHeader: stackState[stackState.length - 1]?.showHeader,
			params: stackState[stackState.length - 1]?.params,
			headers: stackState[stackState.length - 1]?.headers,
		};
	}

	const setStack = (payload, index = false) => {
		if (index !== false) {
			dispatch(
				Actions.updateSubStack({
					value: payload,
					stack,
					index,
				}),
			);
		} else {
			dispatch(
				Actions.updateStack({
					value: payload,
					key: stack,
				}),
			);
		}
	};

	const goBack = (index = false) => {
		if (index) {
			dispatch(
				Actions.subGoBack({
					key: stack,
					index,
				}),
			);
		} else {
			dispatch(
				Actions.goBack({
					key: stack,
				}),
			);
		}
	};

	const screenAt = (index, subIndex = false) => {
		if (stackState) {
			if (subIndex) {
				return stackState[index][subIndex];
			} else {
				return stackState[index];
			}
		}
	};

	const resetStack = () => {
		dispatch(Actions.resetStack(stack));
	};

	const removeScreen = (screenName) => {
		dispatch(
			Actions.removeScreen({
				key: stack,
				value: screenName,
			}),
		);
	};

	return [currentScreen, setStack, goBack, screenAt, resetStack, removeScreen];
}
