import { useEffect, useState } from "react";
import styles from "./Revolver.module.scss";

const Digits = ({ value }) => {
	function renderNumbers() {
		const valusAsString = value.toString();
		const numberOfChars = valusAsString.length;

		const components = [];
		for (let i = numberOfChars; i > 0; i--) {
			const val = valusAsString[i - 1];

			const component = (
				<Digit
					key={"digit" + i}
					value={val}
					values={[...Object.keys(Array.from({ length: 10 }))]}
					elementToWatch={`.${styles["number"]}`}
				/>
			);
			components.push(component);
		}
		return components;
	}

	return value ? (
		<div className={styles["number"]}>{renderNumbers()}</div>
	) : null;
};
export default Digits;

const Digit = ({ value, elementToWatch, values }) => {
	const [offsetTop, setOffsetTop] = useState(0);

	useEffect(() => {
		const numbersWrapper = document.querySelector(elementToWatch);
		if (numbersWrapper) {
			const val = parseInt(value ?? "", 10);
			const fontSize = parseFloat(
				window.getComputedStyle(numbersWrapper).fontSize.replace("px", ""),
			);

			if (!isNaN(val)) {
				setOffsetTop(-(fontSize * val));
			} else {
				setOffsetTop(-fontSize);
			}
		}
	}, [value]);

	return (
		<div className={styles["digit"]}>
			<Revolver
				value={value}
				values={values}
				offsetTop={offsetTop}
			/>
		</div>
	);
};

const Revolver = ({ value, values, offsetTop, secretKey }) => {
	return (
		<div
			className={styles["revolver-wrapper"]}
			style={{ top: offsetTop }}>
			{values.map((char, idx) => (
				<div key={`revolver-${secretKey}-element-${idx}`} aria-hidden={char !== value}>{char}</div>
			))}
		</div>
	);
};
