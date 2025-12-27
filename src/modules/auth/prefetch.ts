import { queryClient } from "../../shared/api/query-client";
import { store } from "../../shared/redux";
import { authApi } from "./api";
import { authSlice } from "./auth.slice";

/**
 * Предзагрузка (prefetch) данных авторизованного пользователя.
 *
 * Зачем нужно:
 * - чтобы ускорить загрузку страниц, которые требуют данных пользователя
 * - чтобы перед рендером сразу положить user в кэш React Query
 * - удобно вызывать при навигации, SSR, hydration
 *
 * Логика:
 * 1. Читаем userId из Redux store (текущие данные авторизации).
 * 2. Если пользователь авторизован (userId есть) —
 *    вызываем prefetchQuery, который заранее загрузит user в кэш.
 *
 * prefetchQuery:
 * - НЕ вызывает повторный рендер
 * - НЕ перезаписывает данные, если они уже есть
 * - НЕ кидает ошибки
 * - просто загружает данные в кэш, чтобы useQuery() их мгновенно получил
 */
export const prefetchAuth = () => {
  // Получаем userId напрямую из Redux store (без hooks)
  const userId = authSlice.selectors.userId(store.getState());

  // Если пользователь авторизован — предзагружаем данные
  if (userId) {
    queryClient.prefetchQuery(authApi.getUserById(userId));
  }
};
