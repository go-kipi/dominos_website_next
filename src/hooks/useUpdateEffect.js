import { useEffect, useRef } from 'react';
// useEffect without initially invoke (watcher)
function useUpdateEffect(effect, dependencies = []) {
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    return effect();
  }, dependencies);
}

export default useUpdateEffect;