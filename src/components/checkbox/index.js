import basic from "./index.module.scss";
import RedCheckBox from "components/RedCheckBox";
import useTranslate from "hooks/useTranslate";

const CheckboxIsInStock = ({
	isOutOfStock,
	extraStyles,
    isBeverage = false,
	onClickCheckbox,
	id,
	isSelected,
}) => {
	const translate = useTranslate();
	const styles = (className) => {
        return `${basic[className]} ${extraStyles[className] ? extraStyles[className] : ''}`;
	};

	const renderInStockCheckbox = () => {
		return (
			<RedCheckBox
				id={id}
				onChange={onClickCheckbox}
				value={isSelected}
			/>
		);
	};

	const renderOutOfStockOption = () => {
		return (
			<span className={`${styles("out-of-stock")} ${isBeverage ? styles("beverage") : ''}`}>
				{translate("outOfStock")}
			</span>
		);
	};

	return (
		<div className={styles('wrapper')}>{isOutOfStock ? renderOutOfStockOption() : renderInStockCheckbox()}</div>
	);
};

export default CheckboxIsInStock;
