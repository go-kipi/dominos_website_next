import React from "react";
import useGetBranchDetails from "hooks/useGetBranchDetails";
import { useDispatch, useSelector } from "react-redux";
import BranchMobile from "containers/branches/branchesMobile/branchMobile";
import BranchDesktop from "containers/branches/branchesDesktop/branchDesktop";
import { handleNavigation } from "utils/functions";
import { useRouter } from "next/router";
import Actions from "redux/actions";
import useCityBranches from "hooks/useCityBranches";

export default function BranchPageContainer(props) {
	const { city, branch, isOnCityPage = false } = props;
	const deviceState = useSelector((store) => store.deviceState);

	const { cityFound, branchFound } = useCityBranches(city, branch);
	const branchData = useGetBranchDetails(branchFound?.id);

	const router = useRouter();
	const dispatch = useDispatch();

	const handleOrder = () => {
		dispatch(
			Actions.updateUserBranches({
				...branchFound,
				orderFromBranch: true,
			}),
		);
		dispatch(Actions.updateOrder({ isPickup: true }));
		router.push("/");
	};

	return deviceState.isDesktop ? (
		<BranchDesktop
			data={branchData}
			id={branchFound?.id}
			handleNavigation={handleNavigation}
			handleOrder={handleOrder}
			city={cityFound}
			isOnCityPage={isOnCityPage}
		/>
	) : (
		<BranchMobile
			data={branchData}
			id={branchFound?.id}
			handleNavigation={handleNavigation}
			handleOrder={handleOrder}
			city={cityFound}
			isOnCityPage={isOnCityPage}
		/>
	);
}
