import React, { useEffect, useRef, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import styles from "./Roleta.module.scss";

import Spin from "./Spin/Spin";
import Background from "/public/assets/icons/Roleta/background.png";
import MobileBG from "/public/assets/icons/Roleta/roleta-background.png";

import Prize from "./Prize/Prize";
import useStack from "hooks/useStack";
import STACK_TYPES from "constants/stack-types";
import ROLETA_SCREEN_TYPES from "constants/RoletaScreenTypes";
import FullScreenPopup from "../../Presets/FullScreenPopup";
import Actions from "redux/actions";
import ReactFocusTrap from "../../../components/accessibility/reactFocusTrap";

function Roleta(props) {
	const ref = useRef();
	const deviceState = useSelector((store) => store.deviceState);
	const background = deviceState.notDesktop ? MobileBG : Background;
	const dispatch = useDispatch();
	const prize = useSelector((store) => store.orderPrize);
	const [prizeData, setPrizeData] = useState();

	const { exitRoletaModal } = props.payload;
	const [currentScreen, setStack, _goBack, _, resetStack] = useStack(
		STACK_TYPES.ROLETA,
	);

	useEffect(() => {
		setStack({ type: ROLETA_SCREEN_TYPES.SPIN, params: {} });
		dispatch(Actions.updateTrackerOrderRoleta());
	}, []);

	useEffect(() => {
		if (prize) {
			setPrizeData(prize);
			dispatch(Actions.resetPrize());
		}
	}, [prize]);

	useEffect(() => {
		return () => {
			resetStack();
		};
	}, []);

	function onPrizeShowen() {
		setStack({ type: ROLETA_SCREEN_TYPES.PRIZE, params: {} });
	}

	function renderPopup() {
		switch (currentScreen.type) {
			case ROLETA_SCREEN_TYPES.SPIN:
				return (
					<Spin
						onPrizeShowen={onPrizeShowen}
						animateOut={() => ref.current?.animateOut()}
						exitRoletaModal={exitRoletaModal}
						prize={prizeData}
					/>
				);
			case ROLETA_SCREEN_TYPES.PRIZE:
				return (
					<Prize
						animateOut={() => ref.current?.animateOut()}
						exitRoletaModal={exitRoletaModal}
						prize={prizeData}
					/>
				);
			default:
				return null;
		}
	}

	return (
		<FullScreenPopup
			id={props.id}
			ref={ref}
			gradient={deviceState.isDesktop}
			className={styles["roleta-popup-wrapper"]}
			background={background}>
			{renderPopup()}
		</FullScreenPopup>
	);
}

export default Roleta;
