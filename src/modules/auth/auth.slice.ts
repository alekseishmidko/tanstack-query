import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { rootReducer } from "../../shared/redux";

/**
 * Тип состояния модуля авторизации.
 *
 * userId:
 *   - string | undefined — id пользователя, если он авторизован
 *   - undefined — если пользователь не авторизован
 *
 * loginError:
 *   - текст ошибки авторизации (например, "Invalid credentials"),
 *   - используется для отображения ошибок на UI
 */
type AuthState = {
  userId: string | undefined;
  loginError?: string;
};

/**
 * Срез состояния (slice) для управления авторизацией.
 *
 * Хранит данные:
 * - userId
 * - ошибка авторизации loginError
 *
 * Позволяет:
 * - логинить пользователя
 * - разлогинивать
 * - устанавливать и сбрасывать ошибки
 */
export const authSlice = createSlice({
  name: "auth",

  /**
   * Начальное состояние.
   * Пытаемся восстановить userId из localStorage,
   * чтобы сохранять авторизацию между перезагрузками сайта.
   */
  initialState: {
    userId: localStorage.getItem("userId"),
  } as AuthState,

  /**
   * Селекторы — удобные функции для получения состояния из store.
   * Используются как:
   *   const userId = useAppSelector(authSlice.selectors.userId);
   */
  selectors: {
    userId: (state) => state.userId,
    loginError: (state) => state.loginError,
  },

  /**
   * Редьюсеры — функции, которые изменяют состояние.
   *
   * Redux Toolkit позволяет мутировать state напрямую
   * (immer генерирует неизменяемый результат).
   */
  reducers: {
    /**
     * Авторизация пользователя.
     * Сохраняет userId и очищает возможную ошибку логина.
     */
    addUser(state, action: PayloadAction<{ userId: string }>) {
      state.userId = action.payload.userId;
      state.loginError = undefined;
    },

    /**
     * Разлогинивание пользователя.
     * Просто удаляет userId, loginError остаётся как есть.
     */
    removeUser(state) {
      state.userId = undefined;
    },

    /**
     * Устанавливает или сбрасывает ошибку авторизации.
     */
    setError(state, action: PayloadAction<string | undefined>) {
      state.loginError = action.payload;
    },
  },
}).injectInto(rootReducer);
