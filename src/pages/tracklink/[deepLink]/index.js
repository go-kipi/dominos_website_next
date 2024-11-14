import React from "react";
import { useRouter } from "next/router";
import Tracker from "containers/Tracker";

function TrackOrderPage() {
	const router = useRouter();
	const { deepLink = "" } = router.query;
	return (
		<>
			<Tracker
				isDeepLink
				saleHash={deepLink}
			/>
		</>
	);
}

export default TrackOrderPage;
