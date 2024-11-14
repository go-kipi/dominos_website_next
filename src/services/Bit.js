const BitService = (() => {
	let orderTransactionId, orderId, BitPayment;
	let env = "Topic";

	const clearTransactionIds = () => {
		orderTransactionId, (orderId = undefined);
	};

	const setTransactionIds = (serialId, initiationId) => {
		orderTransactionId = serialId;
		orderId = initiationId;
	};

	const setBitPayment = (bit) => {
		BitPayment = bit;
	};

	const isBitAvailable = () => {
		return new Promise((resolve, reject) => {
			resolve(BitPayment !== undefined);
		});
	};

	const Pay = (events) => {
		const { onApproved, onCancel, onTimeout, log } = events;
		if (BitPayment) {
			BitPayment.pay({
				orderTransactionId,
				orderId,
				// env,
				onCreate: function (data) {},
				onApproved: function (data) {
					typeof onApproved === "function" && onApproved(data);
					clearTransactionIds();
				},
				onCancel: function (data) {
					typeof onCancel === "function" && onCancel(data);
					clearTransactionIds();
				},
				onTimeout: function (data) {
					typeof onTimeout === "function" && onTimeout(data);
					clearTransactionIds();
				},
				log: function (data) {
					if (process.env.NODE_ENV === "development")
						console.log("[BIT LOG]:", data);
					typeof log === "function" && log(data);
				},
				logLevel: 1,
			});
		}
	};

	return {
		setBitPayment,
		isBitAvailable,
		setTransactionIds,
		Pay,
	};
})();

export default BitService;
