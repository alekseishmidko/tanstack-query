import { useMutation, useQueryClient } from "@tanstack/react-query";
import { todoListApi } from "./api";
import type { FormEvent } from "react";
import { nanoid } from "nanoid";

export const useCreateTodo = () => {
  const createTodoMutation = useMutation({
    mutationFn: todoListApi.createTodo,
    // выполнить операцию при успешном выполнении
    // onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: [todoListApi.baseKey] });
    // },

    /**
     * Вызывается при любом исходе запроса:
     * и при успехе, и при ошибке.
     *
     * Здесь мы инвалидируем кэш списка todos,
     * чтобы React Query автоматически подгрузил актуальные данные.
     *
     * Используем async чтобы UI работал плавно,
     * а invalidateQueries можно "await-ать".
     */
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: [todoListApi.baseKey] });
    },
  });

  const queryClient = useQueryClient();
  const handleCreate = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const text = formData.get("text")?.toString() ?? "";

    createTodoMutation.mutate({
      id: nanoid(),
      text,
      done: false,
      userId: "default",
    });
  };

  return { handleCreate, isLoading: createTodoMutation.isPending };
};
