import { useSelector } from "react-redux";

function useCityBranches(city, branch = "") {
	const cities = useSelector((store) => store.cities);
	const branches = useSelector((store) => store.branches);
	let branchFound = undefined;

	if (branches) {
		for (const b of branches) {
			if (branch && city) {
				if (b.url === branch && b.cityUrl === city) {
					branchFound = b;
				}
			} else if (!branch && city) {
				if (b.url === city && !b.cityUrl) {
					branchFound = b;
				}
			} else if (branch && !city) {
				if (b.url === branch && !b.cityUrl) {
					branchFound = b;
				}
			}
		}
	}

	const cityFound = cities && cities?.find((cityData) => cityData.url === city);

	return {
		isCity: !!cityFound,
		isBranch: !!branchFound,
		branchFound,
		cityFound,
	};
}
export default useCityBranches;
