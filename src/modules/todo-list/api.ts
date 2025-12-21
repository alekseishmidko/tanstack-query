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
};
