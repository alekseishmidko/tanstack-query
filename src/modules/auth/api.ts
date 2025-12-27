import { queryOptions } from "@tanstack/react-query";
import { jsonApiInstance } from "../../shared/api/instance";

export type PaginatedResult<T> = {
  data: T[];
  first: number;
  items: number;
  last: number;
  next: number | null;
  pages: number;
  prev: number | null;
};

export type UserDto = {
  id: string;
  login: string;
  password: string;
};

export const authApi = {
  baseKey: "users",
  getUserById: (id: string) => {
    return queryOptions({
      queryKey: [authApi.baseKey, "byId", id],
      queryFn: (meta) =>
        jsonApiInstance<UserDto>(`/users/${id}`, {
          signal: meta.signal,
        }),
    });
  },

  loginUser: ({ login, password }: { login: string; password: string }) => {
    return jsonApiInstance<UserDto[]>(
      `/users?login=${login}&password=${password}`,
    ).then((r) => r[0] as UserDto | undefined);
  },
};
