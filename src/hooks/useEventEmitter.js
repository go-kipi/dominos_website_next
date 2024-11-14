import { useEffect, useCallback, useMemo } from "react";
import { publish, subscribe, unsubscribe } from "services/events";

function useEventEmitter(eventName, listener, shouldSubscribe = true) {
	// Memoize the listener to avoid unnecessary re-subscriptions
	const memoizedListener = useMemo(() => listener, [listener]);

	// Subscribe and unsubscribe using useEffect
	useEffect(() => {
		if (!shouldSubscribe || !eventName || typeof memoizedListener !== "function")
			return;

		// Subscribe to the event
		subscribe(eventName, memoizedListener);

		// Cleanup function to unsubscribe when the component unmounts or dependencies change
		return () => {
			unsubscribe(eventName, memoizedListener);
		};
	}, [eventName, memoizedListener]);

	// Memoize the emit function to avoid unnecessary re-creations
	const emit = useCallback(
		(data) => {
			publish(eventName, data);
		},
		[eventName],
	);

	return emit;
}

export default useEventEmitter;
