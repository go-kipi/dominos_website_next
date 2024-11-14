import { StringCodec, connect } from "nats.ws";
const NATSWebSocketService = (function () {
	const sc = StringCodec();

	const decodeData = (data) => {
		return sc.decode(data);
	};
	return {
		decodeData,
	};
})();

export default NATSWebSocketService;
