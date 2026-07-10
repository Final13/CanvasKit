import { useCallback, useRef, useState } from "react";

export function useHistory<T>(initial: T | null, limit = 30) {
  const stack = useRef<T[]>(initial ? [initial] : []);
  const index = useRef(initial ? 0 : -1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const update = useCallback(() => {
    setCanUndo(index.current > 0);
    setCanRedo(index.current < stack.current.length - 1);
  }, []);

  const push = useCallback(
    (state: T) => {
      // remove future states after current index
      stack.current = stack.current.slice(0, index.current + 1);
      stack.current.push(state);
      if (stack.current.length > limit) {
        stack.current.shift();
      } else {
        index.current += 1;
      }
      update();
    },
    [limit, update]
  );

  const undo = useCallback((): T | null => {
    if (index.current <= 0) return null;
    index.current -= 1;
    update();
    return stack.current[index.current];
  }, [update]);

  const redo = useCallback((): T | null => {
    if (index.current >= stack.current.length - 1) return null;
    index.current += 1;
    update();
    return stack.current[index.current];
  }, [update]);

  const reset = useCallback((state: T) => {
    stack.current = [state];
    index.current = 0;
    update();
  }, [update]);

  return { push, undo, redo, reset, canUndo, canRedo };
}
