import React from "react";
import { useRouter } from "next/router";
import Tracker from "containers/Tracker";

function TrackOrderPage() {
	const router = useRouter();
	const { orderHash = "" } = router.query;
	return (
		<>
			<Tracker saleHash={orderHash} />
		</>
	);
}

export default TrackOrderPage;
