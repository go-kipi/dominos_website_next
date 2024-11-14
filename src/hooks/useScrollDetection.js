const { useCallback, useState, useRef, useEffect } = require("react");

export function useScrollDetection(callback, delay = 150) {
    const [isScrolling, setIsScrolling] = useState(false);
    const timeoutRef = useRef(null);
  
    const handleScroll = useCallback(() => {
      if (!isScrolling) {
        setIsScrolling(true);
        callback(true);
      }
  
      // Clear the existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
  
      // Set a new timeout
      timeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
        callback(false);
      }, delay);
    }, [isScrolling, callback, delay]);
  
    useEffect(() => {
      // Cleanup function to clear the timeout when the component unmounts
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);
  
    return handleScroll;
  }