import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";

const BASE_URL = import.meta.env.VITE_BASE_URL;
if (!BASE_URL) {
  throw Error("no BASE_URL environment variable");
}
export type TodoDto = { id: string; text: string; done: boolean };

export type PaginatedResponse<T> = {
  first: number;
  prev: number | null;
  next: number | null;
  last: number;
  pages: number;
  items: number;
  data: T;
};

export const todoListApi = {
  getTodoList: (
    { page, perPage = 10 }: { page?: number; perPage?: number },
    { signal }: { signal?: AbortSignal },
  ) => {
    return fetch(BASE_URL + `/tasks?_page=${page}&_per_page=${perPage}`, {
      signal,
    }).then((response) => {
      return response.json() as Promise<PaginatedResponse<TodoDto[]>>;
    });
  },

  getTodoListInfinityQueryOptions: () => {
    return infiniteQueryOptions({
      queryKey: ["tasks", "list"],
      // Функция запроса. React Query автоматически передаёт сюда pageParam.
      // meta.pageParam — номер текущей страницы (1, 2, 3...)
      queryFn: (meta) =>
        todoListApi.getTodoList({ page: meta?.pageParam }, meta),
      // Запрашивать данные только если enabled === true
      // (полезно при фильтрах, SSR, ленивых запросах)

      // Первая страница, которая будет загружена при старте
      initialPageParam: 1,
      // React Query получает следующую страницу из ответа API
      // Если next === null, hasNextPage === false
      getNextPageParam: (result) => result.next,
      // Аналогично: страница для загрузки назад
      getPreviousPageParam: (result) => result.prev,
      // Преобразование результата перед тем, как отдать в компонент.
      // Мы разворачиваем pages → один плоский массив data
      select: (result) => result.pages.flatMap((page) => page.data),
    });
  },
  getTodoListQueryOptions: ({ page }: { page: number }) => {
    return queryOptions({
      queryKey: ["tasks", "list", { page }],
      // Функция запроса. React Query автоматически передаёт сюда pageParam.
      // meta.pageParam — номер текущей страницы (1, 2, 3...)
      queryFn: (meta) => todoListApi.getTodoList({ page }, meta),
    });
  },
};
