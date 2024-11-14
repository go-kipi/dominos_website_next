import { useEffect, useState } from "react";
import { connect } from "nats.ws";
import { useSelector } from "react-redux";

// NOTE: uncomment 'debug: true' for debugging purposes.
const options = {
	// debug: true,
	maxReconnectAttempts: -1,
	reconnectTimeWait: 2 * 1000,
	pingInterval: 2 * 1000,
	maxOutstandingPings: 5,
};

export default function useNatsConnection() {
	const [nats, setNats] = useState();
	const apiData = useSelector((store) => store.apiData);

	useEffect(() => {
		(async () => {
			const nc = await connect({
				servers: apiData.messaging,
				user: "dominosapp",
				pass: "&1!ITh3R@bb1tst0N1G#7!",
				...options,
			});
			setNats(nc);
			console.log("connected to NATS");
		})();

		return async () => {
			await nats?.closed();
			console.log("closed NATS connection");
		};
	}, []);

	return () => nats;
}
