import { queryClient } from "../../shared/api/query-client";
import { type AppThunk } from "../../shared/redux";
import { MutationObserver, useMutation } from "@tanstack/react-query";
import { type TodoDto, todoListApi } from "./api";
import { nanoid } from "nanoid";
import { authSlice } from "../auth/auth.slice";
import { authApi } from "../auth/api";

/**
 * Thunk для создания TODO с оптимистичным обновлением.
 *
 * Что делает:
 * 1. Проверяет авторизацию → без userId нельзя создать todo
 * 2. Загружает данные пользователя (чтобы добавить Owner в текст)
 * 3. Генерирует локальный todo (с nanoid)
 * 4. Оптимистично добавляет его в кэш React Query
 * 5. Выполняет мутацию createTodo через MutationObserver
 * 6. В случае ошибки — откатывает кэш назад
 * 7. В конце инвалидирует список задач, чтобы подтянуть свежие данные
 *
 * Использование оптимистичной стратегии:
 * - UI сразу обновляется
 * - Сервер подтверждает или откатывает изменения
 */
export const createTodoThunk =
  (text: string): AppThunk =>
  async (dispatch, getState) => {
    // Шаг 1. Проверяем авторизацию
    const userId = authSlice.selectors.userId(getState());
    if (!userId) {
      throw new Error("user not login");
    }

    // Шаг 2. Запрашиваем данные пользователя (нужен login для текста)
    const user = await queryClient.fetchQuery(authApi.getUserById(userId));

    // Шаг 3. Создаём новый todo локально (до отправки на сервер)
    const newTodo: TodoDto = {
      id: nanoid(), // локальный id для оптимистического UI
      done: false,
      text: `${text}. Owner: ${user.login}`,
      userId,
    };

    // Шаг 4. Останавливаем все запросы списка, чтобы избежать гонок
    queryClient.cancelQueries({
      queryKey: [todoListApi.baseKey],
    });

    // Сохраняем предыдущие данные на случай отката
    const prevTasks = queryClient.getQueryData(
      todoListApi.getTodoListQueryOptions({ userId }).queryKey,
    );

    // Шаг 5. Оптимистично обновляем кэш — просто пушим новый todo в конец списка
    queryClient.setQueryData(
      todoListApi.getTodoListQueryOptions({ userId }).queryKey,
      (tasks) => {
        if (!tasks) return tasks; // если нет данных — просто возвращаем

        return {
          ...tasks, // сохраняем meta (pages, next, prev и т.д.)
          data: [...tasks.data, newTodo], // корректное обновление массива
        };
      },
    );

    try {
      // Шаг 6. Выполняем реальную мутацию на сервере
      await new MutationObserver(queryClient, {
        mutationFn: todoListApi.createTodo,
      }).mutate(newTodo);

      // Если всё прошло успешно — оптимистичный UI остаётся как есть
    } catch (e) {
      // Шаг 7а. Ошибка → откатываем список назад
      queryClient.setQueryData(
        todoListApi.getTodoListQueryOptions({ userId }).queryKey,
        prevTasks,
      );
    } finally {
      // Шаг 7б. Независимо от результата — инвалидируем список,
      // чтобы сделать refetch и полностью синхронизировать данные
      queryClient.invalidateQueries({
        queryKey: [todoListApi.baseKey],
      });
    }
  };

/**
 * Хук, позволяющий узнать, выполняется ли создание todo.
 * Работает, потому что использует тот же mutationKey.
 */
export const useCreateLoading = () =>
  useMutation({
    mutationKey: ["create-todo"],
  }).isPending;
