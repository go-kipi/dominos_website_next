import {
	TAB_INDEX_DEFAULT,
	TAB_INDEX_HIDDEN,
} from "constants/accessibility-types";

const Container = ({
	isBuilderRecommended,
	children,
	srText,
	...restOfProps
}) => {
	return (
		<>
			{!isBuilderRecommended ? (
				<div
					{...restOfProps}
					tabIndex={TAB_INDEX_HIDDEN}>
					{children}
				</div>
			) : (
				<button
					aria-label={srText}
					{...restOfProps}
					tabIndex={TAB_INDEX_DEFAULT}>
					{children}
				</button>
			)}
		</>
	);
};

export default Container;
