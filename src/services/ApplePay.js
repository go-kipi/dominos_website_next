import Api from 'api/requests';
const ApplePayService = (() => {
let transactionInfo = {};

const setTransactionInfo = (data) => {
  transactionInfo = data;
}

/**
 * Checks if Apple Pay is possible in the current environment.
 * @return {Promise<Boolean>} Promise that returns a Boolean if Apple Pay is possible
 */
const isApplePayAvailable = () => {
	if (window?.ApplePaySession) {
		const promise = new Promise((resolve, reject) => {
			const canMakePayments = window.ApplePaySession.canMakePayments();
			resolve(canMakePayments);
		})
		return promise;
	}
};

/**
 * Starts the Apple Pay session using a configuration
 * ApplePaySession is the entry point for Apple Pay on the web.
 * All the steps of the payment process for a single transaction occur in a session.
 * @param {(object, object) => void} callback
 */

const startApplePaySession = (callback) => {
	let applePaySession = new window.ApplePaySession(3, transactionInfo);
	handleApplePayEvents(applePaySession, callback);
	applePaySession.begin();
};

/**
 * This is the main method of the script, since here we handle all the Apple Pay
 * events. Here you are able to populate your shipping methods, react to  shipping methods
 * changes, and many other interaction that the user has with the Apple Pay pup-up.
 *
 * @param {object} appleSession
 * @param {(object, object) => void} callback
 */
const handleApplePayEvents = (appleSession, callback) => {
	// Apple Session events - Respond to Payment Sheet Interactions

	/**
	 * This function can be called even after an onpaymentauthorized event has been dispatched.
	 * Both the user and the web page can dismiss the payment sheet and abandon the transaction.
	 * @param event 
	 */
	appleSession.oncancel = (event) => {
		console.log('onCancel==>', event);
	};

	/**
	 * This is the first event that Apple triggers. Here you need to validate the
	 * Apple Pay Session from your Back-End
	 * 
	 * Your onvalidatemerchant function calls your server, and passes it the static hostname apple-pay-gateway.apple.com as the validation URL.
	 * Your server uses the validation URL to request a session from the Apple Pay server, as described in Requesting an Apple Pay Payment Session.
	 * In response, your server receives an opaque merchant session object, MerchantSession.
	 * You pass the merchant session object to the completion method, completeMerchantValidation.
	 * @param event 
	*/
	appleSession.onvalidatemerchant = async (event) => {
    	console.log('onvalidatemerchant', event);
		// Send the validationURL to the server to start the Apple Pay Merchant Session.
		const payload = {};
		Api.getApplePaySession({payload, onSuccess: (res) => {
			const session = JSON.parse(res.session);
			appleSession.completeMerchantValidation(session);
		}})
	};

	/**
	 * The onpaymentmethodselected function must respond by calling completePaymentMethodSelection before
	 * the 30 second timeout, after which a message appears stating that the payment could not be completed.
	*/
	appleSession.onpaymentmethodselected = () => {
		const applePayPaymentMethodUpdate = {
			newLineItems: [],
			newTotal: transactionInfo.total,
		};
		appleSession.completePaymentMethodSelection(applePayPaymentMethodUpdate);
	};

	/**
	 * The onpaymentauthorized function must complete the payment and respond by calling completePayment before
	 * the 30 second timeout, after which a message appears stating that the payment couldn’t be completed.
	 * 
	 * This method is the most important method. It gets triggered after the user has
	 * confirmed the transaction with the Touch ID or Face ID. Besides getting all the
	 * details about the customer (email, address ...) you also get the Apple Pay payload
	 * needed to perform a payment.
	 * @param event 
	 */
	appleSession.onpaymentauthorized = async (event) => {
		const paymentInfo = event.payment;
		console.log('onpaymentauthorized', paymentInfo);
		callback(appleSession, paymentInfo);
	};
};

/**
 * Sets a onClick listen on the Apple Pay button. When clicked it will
 * begin the Apple Pay session with your configuration
 * @param {Promise} callback
 */
const setButtonClickListener = (callback) => {
	startApplePaySession(callback);
};
  return {
    isApplePayAvailable, 
    setTransactionInfo,
    setButtonClickListener,
  }
})();

export default ApplePayService;
