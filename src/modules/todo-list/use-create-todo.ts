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

    // выполнится при любом исходе
    // тут асинхронная ф-я чтобы улучшить ui
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
