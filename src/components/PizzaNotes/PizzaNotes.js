import clsx from "clsx";
import { META_ENUM } from "constants/menu-meta-tags";
import { useSelector } from "react-redux";

const { default: ActionTypes } = require("constants/menus-action-types");
const { default: useMenus } = require("hooks/useMenus");

export default function RenderNotes(props) {
	const { items, className, styles = {} } = props;
	const comma = <span className={className}>{", "}</span>;
	const catalog = useSelector((store) => store.menusData.catalogProducts);

	const components = [];

	for (const key in items) {
		const item = items[key];

		const product = catalog[item.productId];

		if (product && META_ENUM.PIZZA_PREP === product?.meta) {
			const component = (
				<RenderNote
					woi
					item={item}
					key={item.id}
					className={className}
				/>
			);

			if (components.length > 0) {
				components.push(comma);
			}
			components.push(component);
		}
	}

	const hasEelemts = components.length > 0;

	return (
		<div
			className={clsx(
				styles["special-requests-wrapper"],
				hasEelemts ? styles["has-req"] : "",
			)}>
			{components}
		</div>
	);
}
function RenderNote(props) {
	const { item, className } = props;

	const product = useMenus(item.productId, ActionTypes.PRODUCT);

	if (product && META_ENUM.PIZZA_PREP === product?.meta) {
		return <span className={className}>{product?.nameUseCases?.Title}</span>;
	} else {
		return null;
	}
}
