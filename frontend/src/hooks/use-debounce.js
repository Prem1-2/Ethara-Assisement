import { useState, useEffect } from "react";

/**
 * Debounces a value by the given delay (ms).
 * Returns the debounced value, which only updates after the delay has passed
 * without the original value changing.
 */
export function useDebounce(value, delay = 300) {
	const [debouncedValue, setDebouncedValue] = useState(value);

	useEffect(() => {
		const timer = setTimeout(() => setDebouncedValue(value), delay);
		return () => clearTimeout(timer);
	}, [value, delay]);

	return debouncedValue;
}
