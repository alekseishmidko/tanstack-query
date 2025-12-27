import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { jsonApiInstance } from "../../shared/api/instance";

export type TodoDto = {
  id: string;
  text: string;
  done: boolean;
  userId?: string;
};

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
  baseKey: "tasks",
  getTodoListInfinityQueryOptions: ({
    perPage = 10,
  }: { perPage?: number } = {}) => {
    return infiniteQueryOptions({
      queryKey: [todoListApi.baseKey, "list"],
      // Функция запроса. React Query автоматически передаёт сюда pageParam.
      // meta.pageParam — номер текущей страницы (1, 2, 3...)
      queryFn: (meta) =>
        jsonApiInstance<PaginatedResponse<TodoDto[]>>(
          `/tasks?_page=${meta?.pageParam}&_per_page=${perPage}`,
          {
            signal: meta.signal,
          },
        ),
      // todoListApi.getTodoList({ page: meta?.pageParam }, meta),
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
  getTodoListQueryOptions: ({
    page = 1,
    perPage = 20,
    userId,
  }: {
    page?: number;
    perPage?: number;
    userId?: string;
  } = {}) => {
    return queryOptions({
      queryKey: [todoListApi.baseKey, "list", { page }, { userId }],
      // Функция запроса. React Query автоматически передаёт сюда pageParam.
      // meta.pageParam — номер текущей страницы (1, 2, 3...)
      queryFn: (meta) =>
        jsonApiInstance<PaginatedResponse<TodoDto[]>>(
          `/tasks?_page=${page}&_per_page=${perPage}&_userId=${userId}`,
          {
            signal: meta.signal,
          },
        ),
    });
  },

  createTodo: (data: TodoDto) => {
    return jsonApiInstance<TodoDto>(`/tasks`, {
      method: "POST",
      json: data,
    });
  },
  updateTodo: (data: Partial<TodoDto> & { id: string }) => {
    return jsonApiInstance<TodoDto>(`/tasks/${data.id}`, {
      method: "PATCH",
      json: data,
    });
  },
  deleteTodo: (id: string) => {
    return jsonApiInstance(`/tasks/${id}`, {
      method: "DELETE",
    });
  },
};
