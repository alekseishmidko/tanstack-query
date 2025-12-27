import { queryClient } from "../../shared/api/query-client";
import { store } from "../../shared/redux";
import { authSlice } from "../auth/auth.slice";
import { prefetchAuth } from "../auth/prefetch";
import { todoListApi } from "./api";

/**
 * Предзагрузка (prefetch) списков TODO для одного или нескольких пользователей.
 *
 * Использование:
 * - удобно при SSR, рендеринге приватных страниц или при переходе на маршрут
 *   где сразу нужен список задач
 * - ускоряет рендеринг, т.к. данные попадут в кэш раньше, чем компонент смонтируется
 *
 * Логика:
 * 1. Получаем userId из Redux store.
 * 2. Если пользователь авторизован:
 *    - прогреваем (prefetch) данные авторизации через prefetchAuth()
 *    - прогружаем список TODO для текущего пользователя
 *    - дополнительно прогружаем TODO для нескольких других userId ("2" и "3")
 *
 * Примечание:
 * prefetchQuery:
 * - НЕ вызывает повторный рендер
 * - НЕ кидает ошибки
 * - НЕ перезаписывает существующие данные
 * - просто тихо кладёт данные в кэш, чтобы useQuery получил их мгновенно
 */
export const prefetchTodoList = () => {
  const userId = authSlice.selectors.userId(store.getState());

  // Выполняем prefetch только если пользователь авторизован
  if (userId) {
    // Предзагрузка профиля пользователя
    prefetchAuth();

    // Предзагрузка TODO списка для текущего пользователя
    queryClient.prefetchQuery(todoListApi.getTodoListQueryOptions({ userId }));

    // Предзагрузка TODO ещё для пользователей "2" и "3"
    // Может быть полезно, если приложение отображает несколько списков,
    // или нужно прогреть кэш заранее
    queryClient.prefetchQuery(
      todoListApi.getTodoListQueryOptions({ userId: "2" }),
    );
    queryClient.prefetchQuery(
      todoListApi.getTodoListQueryOptions({ userId: "3" }),
    );
  }
};
