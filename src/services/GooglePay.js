import { notEmptyObject } from "utils/functions";

const GooglePay = (() => {
	const formatGooglePayRequestData = (data, leftToPay) => {
		let tempData = {};
		if (data && typeof data === "object") {
			tempData = JSON.parse(JSON.stringify(data));

			tempData.apiVersion = 2;
			tempData.apiVersionMinor = 0;
			tempData.allowedPaymentMethods = [
				{
					type: "CARD",
					parameters: {
						...data.baseCardPaymentMethod.parameters,
					},
					tokenizationSpecification: {
						...data.tokenizationSpecification,
					},
				},
			];
			tempData.transactionInfo = {
				totalPriceStatus: "FINAL",
				totalPriceLabel: "Total",
				currencyCode: "ILS",
				totalPrice: `${leftToPay}`,
				countryCode: "IL",
			};
			tempData.merchantInfo = {
				merchantId: data.merchantId,
				merchantName: data.businessName,
			};
			delete tempData.businessName;
			delete tempData.merchantId;
			delete tempData.baseCardPaymentMethod;
			delete tempData.tokenizationSpecification;
		}
		return tempData;
	};
	const updateGooglePayRequestDataFields = (requestData) => {
		if (
			requestData &&
			typeof requestData === "object" &&
			notEmptyObject(requestData)
		) {
			let GpayRequestData = {
				...requestData,
			};
			delete GpayRequestData.environment;
			GpayRequestData.transactionInfo.currencyCode = "ILS";
			return GpayRequestData;
		}
		return null;
	};
	return {
		updateGooglePayRequestDataFields,
		formatGooglePayRequestData,
	};
})();

export default GooglePay;
