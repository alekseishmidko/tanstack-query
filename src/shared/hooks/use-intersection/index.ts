import { useCallback, useRef } from "react";

/**
 * Хук для отслеживания попадания элемента в область видимости (viewport).
 *
 * @param onIntersect - callback, вызываемый при пересечении элемента с viewport
 *
 * @returns функцию, которую нужно передать в ref отслеживаемого элемента.
 *
 * Пример:
 * const ref = useIntersection(() => console.log("visible"));
 * return <div ref={ref}>Observe me</div>;
 */
export const useIntersection = (onIntersect: () => void) => {
  // Храним функцию для отмены подписки при смене элемента
  const unsubscribe = useRef<() => void>(() => {});

  return useCallback(
    (el: HTMLDivElement | null) => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onIntersect();
          }
        });
      });

      // Если элемент есть — начинаем наблюдение
      if (el) {
        observer.observe(el);
        unsubscribe.current = () => observer.disconnect();
      } else {
        // Если элемента больше нет — отключаем наблюдение
        unsubscribe.current();
      }

      // Cleanup для корректного размонтирования
      return () => observer.disconnect();
    },
    [onIntersect],
  );
};
