import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { authApi } from "./api";
import { authSlice } from "./auth.slice";
import { useSelector } from "react-redux";

/**
 * Хук для получения данных текущего пользователя.
 *
 * Логика:
 * 1. Читаем userId из Redux store.
 * 2. Если userId нет → запрос не выполняется (enabled = false)
 * 3. Если есть → React Query делает запрос authApi.getUserById()
 *
 * Используется в компонентах, где пользователь может НЕ быть авторизован.
 */
export function useUser() {
  // Берём текущий userId из Redux state
  const userId = useSelector(authSlice.selectors.userId);

  return useQuery({
    // Конфигурация запроса (queryFn, queryKey и т. д.)
    ...authApi.getUserById(userId!),

    // Важный флаг: запрос выполняется только если userId существует
    enabled: Boolean(userId),
  });
}

/**
 * Хук для получения данных пользователя, но через Suspense API.
 *
 * Отличия от useUser():
 * - НЕ использует enabled (предполагается, что userId существует)
 * - Бросает Promise, пока данные не загрузятся → требует <Suspense>
 * - Работает в "защищённых" зонах приложения (роуты с авторизацией)
 *
 * Если userId будет undefined → произойдёт ошибка,
 * поэтому этот хук следует использовать только там,
 * где доступ к странице разрешён ТОЛЬКО авторизованным пользователям.
 */
export function useSuspenceUser() {
  // userId по-прежнему берём из Redux
  const userId = useSelector(authSlice.selectors.userId);

  return useSuspenseQuery({
    // Запрос должен быть гарантированно валидным
    ...authApi.getUserById(userId!),

    // Замечание:
    // SuspenseQuery НЕ должен использовать enabled,
    // потому что Suspense ожидает полный и гарантированный запрос.
  });
}
