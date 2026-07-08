import { useState, useRef, useCallback } from 'react';
import { NOTIFICATION_CONFIG } from '../constants/character';

export function useGameAlert(duration = NOTIFICATION_CONFIG.autoHideDuration) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onCompleteRef = useRef<(() => void) | null>(null);

  const hide = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    onCompleteRef.current = null;
    setVisible(false);
  }, []);

  const show = useCallback(
    (onComplete?: () => void, customDuration?: number) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      onCompleteRef.current = onComplete ?? null;
      setVisible(true);
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        const callback = onCompleteRef.current;
        onCompleteRef.current = null;
        setVisible(false);
        callback?.();
      }, customDuration ?? duration);
    },
    [duration],
  );

  return { visible, show, hide };
}
