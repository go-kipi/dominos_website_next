import React, { useEffect, useState } from "react";
import styles from "./index.module.scss";
import CloseX from "/public/assets/icons/x-icon-white.svg";
import DoughType from "../DoughType";
import Option from "../Option";
import { useSelector } from "react-redux";
import { getFullMediaUrl } from "utils/functions";
import { MEDIA_TYPES } from "constants/media-types";
import { MEDIA_ENUM } from "constants/media-enum";
import clsx from "clsx";
import useTranslate from "hooks/useTranslate";
import ReactFocusTrap from "../../../../../../components/accessibility/reactFocusTrap";
import { createAccessibilityText } from "../../../../../../components/accessibility/acfunctions";

const OptionsModal = (props) => {
	const {
		show,
		onClose = () => {},
		onChange = () => {},
		data = {},
		position = {},
		stepIndex,
		doughSize = "",
	} = props;
	const translate = useTranslate();
	const deviceState = useSelector((store) => store.deviceState);
	const catalogProducts = useSelector(
		(store) => store.menusData.catalogProducts,
	);
	const isMobile = deviceState.isMobile;
	const [fold, setFold] = useState(false);
	const [foldingAnimationDone, setFoldingAnimationDone] = useState(false);
	const dough = useSelector((store) => store.builder.dough[stepIndex ?? 0]);
	const doughTypes = useSelector((store) => store.pizzaSelection);

	useEffect(() => {
		if (fold && foldingAnimationDone) {
			onClose();
		}
	}, [foldingAnimationDone, fold]);

	useEffect(() => {
		if (show) {
			setFold(false);
			setFoldingAnimationDone(false);
		}
	}, [show]);

	useEffect(() => {
		if (fold && foldingAnimationDone) {
			onClose();
		}
	}, [foldingAnimationDone, fold]);

	useEffect(() => {
		if (show) {
			setFold(false);
			setFoldingAnimationDone(false);
		}
	}, [show]);

	const animationDone = () => {
		setFoldingAnimationDone(true);
	};

	const handleClose = () => {
		setFoldingAnimationDone(false);
		setFold(true);
	};

	const handleSelect = (id) => {
		onChange("option", id);
		setFold(true);
	};

	const showBlurClassName = show ? styles["show"] : "";
	const flip = position.left > (window.innerWidth / 3) * 2;
	const root =
		doughTypes[doughSize]?.subs?.[dough?.type]?.subs?.[dough?.extra]?.subs;
	const sortedOptions = data?.options?.sort((a, b) =>
		parseInt(root?.[a]?.sortIndex) > parseInt(root?.[b]?.sortIndex) ? -1 : 1,
	);

	const baseSRText =
		dough?.type && dough.extra
			? createAccessibilityText(
					translate("accessibility_doughBuilder_type").replace(
						"{doughType}",
						translate(`pizzaSelection-${dough.type}`),
					),
					translate(`pizzaSelection-${dough.extra}`),
			  )
			: "";

	return (
		showBlurClassName && (
			<ReactFocusTrap>
				<div
					className={clsx(styles["blur-modal-overlay"], showBlurClassName)}
					onClick={handleClose}>
					<button
						aria-label={"Close modal"}
						className={styles["close-modal-wrapper"]}
						onClick={handleClose}>
						<img
							src={CloseX.src}
							alt=""
							className={styles["close-x"]}
						/>
					</button>
					<div
						className={styles["options-wrapper"]}
						style={{ left: position?.left, top: position?.top }}>
						<DoughType
							id={data?.id}
							image={data?.image}
							selectedText={data?.selectedText}
							text={data?.text}
							selected={true}
							comment={data?.comment}
							className={isMobile ? styles["parent-dough"] : ""}
							inModal={true}
						/>
						{sortedOptions?.map((op, idx) => {
							const productId = root[op]?.subs?.final?.subs?.["muzzarella"]?.productId;
							const product = catalogProducts[productId];
							const shortHandName = product.nameUseCases["PizzaProductSelection"];
							const item = {
								assetVersion: 0,
								id: op,
							};
							const srText = createAccessibilityText(
								baseSRText,
								translate("accessibility_doughBuilder_flavor").replace(
									"{flavor}",
									shortHandName,
								),
							);

							return (
								<Option
									flip={flip}
									isVisible={true}
									index={idx}
									text={shortHandName}
									image={getFullMediaUrl(
										item,
										MEDIA_TYPES.DOUGH,
										MEDIA_ENUM.DOUGH,
										"svg",
									)}
									id={op}
									productId={productId}
									fold={fold}
									selected={dough?.option === op}
									height={position?.height}
									onSelect={handleSelect}
									onAnimationDone={animationDone}
									key={`option-${op}`}
									role={"radio"}
									ariaLabel={srText}
								/>
							);
						})}
					</div>
				</div>
			</ReactFocusTrap>
		)
	);
};

export default OptionsModal;
