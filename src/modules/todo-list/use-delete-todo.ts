import { useMutation, useQueryClient } from "@tanstack/react-query";
import { todoListApi } from "./api";

export const useDeleteTodo = () => {
  const deleteTodoMutation = useMutation({
    mutationFn: todoListApi.deleteTodo,
    /**
     * Вызывается при успешном запросе.
     *
     * @param _ — результат запроса (не используем)
     * @param deletedId — id удалённого элемента (передается в mutate)
     */
    onSuccess: (_, deletedId) => {
      const todos = queryClient.getQueryData(
        todoListApi.getTodoListQueryOptions().queryKey,
      );
      /**
       * Если данные есть в кэше — обновляем вручную.
       * Фильтруем todos.data, убирая элемент с id === deletedId.
       *
       * Это позволяет пользователю сразу увидеть результат,
       * даже без запроса к серверу (оптимистичное обновление).
       */
      if (todos) {
        queryClient.setQueryData(
          todoListApi.getTodoListQueryOptions().queryKey,
          {
            ...todos,
            data: todos.data.filter((item) => item.id !== deletedId),
          },
        );
      }
    },
    /**
     * Вызывается при любом результате — успехе или ошибке.
     * Здесь инвалидируем кэш, чтобы React Query подгрузил актуальные данные.
     *
     * Используем async, чтобы UI не лагал, и invalidate происходил плавно.
     */
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: [todoListApi.baseKey] });
    },
  });

  const queryClient = useQueryClient();

  return {
    handleDelete: deleteTodoMutation.mutate,
    isLoading: deleteTodoMutation.isPending,
    /**
     * Проверка: находится ли конкретный todo в состоянии удаления.
     * Используется для отображения "спиннера" только на конкретной кнопке.
     *
     * @example
     * getIsItemPending(todo.id)
     */
    getIsItemPending: (id: string) =>
      deleteTodoMutation.isPending && deleteTodoMutation.variables === id,
  };
};
