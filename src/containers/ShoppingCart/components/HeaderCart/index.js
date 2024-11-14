import React from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
// Services
import LanguageDirectionService from "services/LanguageDirectionService";

// Assets
import BackArrow from "/public/assets/icons/back.svg";
import WhiteBoard from "/public/assets/icons/multipleOptionsIndicator/white-board.svg";
import Trash from "/public/assets/icons/multipleOptionsIndicator/trash.svg";
import DominosLogo from "/public/assets/logos/dominos-logo-with-name.svg";

// Components
import styles from "./index.module.scss";
import clsx from "clsx";
import useTranslate from "hooks/useTranslate";
import Burger from "components/common/buttons/burger/burger";
import Link from "next/link";

import * as Routes from "constants/routes";

const HeaderCart = (props) => {
	const translate = useTranslate();

	const deviceState = useSelector((store) => store.deviceState);
	const { isDesktop } = deviceState;

	const isRTL = LanguageDirectionService.isRTL() ? styles["rtl"] : styles["ltr"];

	const router = useRouter();

	const { deleteItems, isEmptyBasket } = props;

	const renderMobileHeader = () => {
		return (
			<>
				<div className={styles["back-wrapper"]}>
					<Link
						className={styles["arrow-img-wrapper"]}
						aria-label={translate("accessibility_alt_arrowBack")}
						href={Routes.menu}
						passHref>
						<img
							className={clsx(styles["arrow-img"], isRTL)}
							src={BackArrow.src}
							alt={"back"}
							aria-hidden={true}
						/>
					</Link>
				</div>

				<div className={styles["title-wrapper"]}>
					<p className={styles["header-title"]}>{translate("cart_your_order")}</p>
				</div>
				<div className={styles["delete-wrapper"]}>
					{!isEmptyBasket ? (
						<button onClick={deleteItems}>
							<img
								src={Trash.src}
								className={styles["trash-img"]}
								aria-hidden={true}
							/>
						</button>
					) : null}
				</div>
			</>
		);
	};

	const renderDesktopHeader = () => {
		return (
			<>
				<Burger />
				<button
					className={styles["dominos-logo"]}
					onClick={() => router.push("/")}
					aria-label={translate("accessibility_logo_toHomePage")}>
					<img
						src={DominosLogo.src}
						alt={"logo"}
						aria-hidden={true}
					/>
				</button>
			</>
		);
	};

	return (
		<header className={clsx(styles["header-wrapper"])}>
			{isDesktop ? renderDesktopHeader() : renderMobileHeader()}
		</header>
	);
};

export default HeaderCart;

// const options = [
// 	{
// 		id: generateUniqueId(8),
// 		img: WhiteBoard,
// 		text: translate("cart_header_special_requests"),
// 		onPress: () => specialRequest(),
// 		canChange: true,
// 		extraData: handleIndication(),
// 	},
// 	{
// 		id: generateUniqueId(8),
// 		img: Trash,
// 		text: translate("cart_header_delete_cart"),
// 		onPress: () => deleteItems(),
// 	},
// ];

// <MultipleOptionsIndicator
// 	extraStyles={styles}
// 	options={options}
// 	className={clsx(styles["toppings-actions"], isRTL)}
// 	tipClassName={styles["tip-wrapper"]}
// 	toolTipClassName={styles["toppings-actions-tooltip"]}
// 	optionsContainerClassName={styles["toppings-actions-wrapper"]}
// />
