import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type TodoDto, todoListApi } from "./api";

/**
 * Хук для переключения состояния todo (done <-> not done).
 *
 * Реализовано:
 * - оптимистичное обновление списка в кэше
 * - rollback при ошибке
 * - отзыв запросов перед обновлением
 * - инвалидирование кэша после завершения мутации
 *
 * Работает по схеме:
 *   1. onMutate — мгновенно меняем UI локально
 *   2. onError — если сервер вернул ошибку, откатываем назад
 *   3. onSettled — обновляем данные из сети, чтобы гарантировать консистентность
 */
export const useToggleTodo = () => {
  const queryClient = useQueryClient();

  const updateTodoMutation = useMutation({
    // Функция отправки PATCH/PUT запроса
    mutationFn: todoListApi.updateTodo,

    /**
     * Вызывается ПЕРЕД выполнением мутации.
     * Здесь:
     * 1) Отменяем все запросы, чтобы предотвратить "гонки"
     * 2) Достаём текущее состояние списка (previousTodos)
     * 3) Обновляем кэш оптимистично — мгновенно меняем todo.done
     */
    onMutate: async (newTodo) => {
      // 1. Останавливаем запросы, которые могут перезаписать кэш
      await queryClient.cancelQueries({
        queryKey: [todoListApi.baseKey],
      });

      // 2. Сохраняем старые значения для возможного rollback
      const previousTodos = queryClient.getQueryData(
        todoListApi.getTodoListQueryOptions().queryKey,
      );

      // 3. Оптимистично обновляем todo в кэше
      queryClient.setQueryData(
        todoListApi.getTodoListQueryOptions().queryKey,
        (old) => {
          if (!old) return old;

          return {
            ...old, // сохраняем first, prev, next, items…
            data: old.data.map((todo) =>
              todo.id === newTodo.id
                ? { ...todo, ...newTodo } // обновляем только одно поле (done)
                : todo,
            ),
          };
        },
      );

      // Возвращаем контекст — понадобится onError для rollback
      return { previousTodos };
    },

    /**
     * Вызывается при ошибке запроса.
     * Мы откатываем кэш к состоянию до оптимистичного изменения.
     *
     * @param context.previousTodos — данные, сохранённые в onMutate
     */
    onError: (_, __, context) => {
      if (context) {
        queryClient.setQueryData(
          todoListApi.getTodoListQueryOptions().queryKey,
          context.previousTodos,
        );
      }
    },

    /**
     * Вызывается после запроса вне зависимости от результата.
     *
     * Здесь мы инвалидируем кэш, чтобы получить гарантированно свежие данные с сервера.
     */
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [todoListApi.baseKey],
      });
    },
  });

  /**
   * Удобная функция для компонента:
   * переключает done у конкретной todo.
   */
  const toggleTodo = (todo: TodoDto) => {
    updateTodoMutation.mutate({ id: todo.id, done: !todo.done });
  };

  return {
    toggleTodo,
  };
};
