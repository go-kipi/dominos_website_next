const LocalStorageService = (function () {
	const getItem = (key, defaultValue, callback) => {
		const value = localStorage.getItem(key);
		if (typeof callback === "function") {
			return callback(value || defaultValue);
		}
		return value || defaultValue;
	};
	const setItem = (key, value, callback) => {
		localStorage.setItem(key, value);
		typeof callback === "function" && callback();
	};
	const removeItem = (key, callback) => {
		localStorage.removeItem(key);
		typeof callback === "function" && callback();
	};

	const clearAllKeys = () => {
		localStorage.clear();
	};

	return {
		getItem,
		setItem,
		removeItem,
		clearAllKeys,
	};
})();

export default LocalStorageService;
