import { queryClient } from "../../shared/api/query-client";
import { type AppThunk } from "../../shared/redux";
import { MutationObserver, useMutation } from "@tanstack/react-query";
import { authApi } from "./api";
import { authSlice } from "./auth.slice";

/**
 * Thunk для ручного выполнения login-мутации внутри Redux.
 *
 * Почему не useMutation?
 * — внутри thunk нельзя использовать React Hooks.
 * — поэтому используется низкоуровневый MutationObserver,
 *   который позволяет выполнять мутации React Query вне React-компонентов.
 *
 * Логика:
 * 1. Выполняем запрос loginUser(login, password)
 * 2. Если пользователь найден — сохраняем его в Redux + локальный кэш React Query
 * 3. Пишем userId в localStorage для восстановления сессии
 * 4. Если логин неуспешен → устанавливаем ошибку
 */
export const loginThunk =
  (login: string, password: string): AppThunk =>
  async (dispatch) => {
    // Создаём observer для выполнения мутации вручную
    const user = await new MutationObserver(queryClient, {
      mutationKey: ["login"], // ключ для отслеживания мутации
      mutationFn: authApi.loginUser, // функция для запроса
    }).mutate({
      login,
      password,
    });

    /**
     * Если сервер вернул user → логин успешен
     */
    if (user) {
      // 1. Записываем userId в Redux state
      dispatch(
        authSlice.actions.addUser({
          userId: user.id,
        }),
      );

      // 2. Обновляем кэш React Query, чтобы данные были сразу доступны
      queryClient.setQueryData(authApi.getUserById(user.id).queryKey, user);

      // 3. Сохраняем userId → пользователь останется залогинен после перезагрузки страницы
      localStorage.setItem("userId", user.id);

      return; // успешный логин → выходим из thunk
    }

    /**
     * Если user === null → логин неуспешен
     * Устанавливаем текст ошибки в Redux
     */
    dispatch(authSlice.actions.setError("Пароль и Логин неверные"));
  };

/**
 * Хук, возвращающий состояние загрузки login-мутации.
 *
 * Использование:
 *   const isLoading = useLoginLoading();
 *
 * Работает, потому что:
 * - мы используем тот же mutationKey: ["login"]
 * - React Query автоматически связывает мутацию и observer
 */
export const useLoginLoading = () =>
  useMutation({
    mutationKey: ["login"],
  }).isPending;
