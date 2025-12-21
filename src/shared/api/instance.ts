export const BASE_URL = import.meta.env.VITE_BASE_URL;
if (!BASE_URL) {
  throw Error("no BASE_URL environment variable");
}

/**
 * Кастомная ошибка для API-запросов.
 * Хранит объект Response, чтобы можно было посмотреть статус, headers и т.д.
 *
 * @example
 * try {
 *   await jsonApiInstance('/users');
 * } catch (e) {
 *   if (e instanceof ApiError) {
 *     console.log(e.response.status);
 *   }
 * }
 */
class ApiError extends Error {
  constructor(public response: Response) {
    super("ApiError:" + response.status);
  }
}

/**
 * Универсальный JSON-клиент для выполнения HTTP-запросов.
 * Оборачивает fetch:
 * - добавляет JSON body (если указан init.json)
 * - сериализует тело запроса
 * - проставляет Content-Type: application/json
 * - преобразует ответ в JSON
 * - выбрасывает ApiError при неуспешном статусе
 *
 * @template T — тип ожидаемого JSON-ответа
 *
 * @param url - относительный путь запроса (например, "/tasks")
 * @param init - расширенный RequestInit с дополнительным полем json
 *
 * @example
 * // GET запрос
 * const users = await jsonApiInstance<UserDto[]>('/users');
 *
 * @example
 * // POST запрос
 * const created = await jsonApiInstance<UserDto>('/users', {
 *   method: 'POST',
 *   json: { name: 'John' }
 * });
 *
 * @returns Promise<T> — JSON-ответ, автоматически типизированный
 */
export const jsonApiInstance = async <T>(
  url: string,
  init?: RequestInit & { json?: unknown },
) => {
  let headers = init?.headers ?? {};
  // Если передали json-поле — сериализуем тело и добавляем нужный заголовок
  if (init?.json) {
    headers = {
      "Content-Type": "application/json",
      ...headers,
    };

    init.body = JSON.stringify(init.json);
  }

  const result = await fetch(`${BASE_URL}${url}`, {
    ...init,
    headers,
  });
  // Ошибочный статус → выбрасываем ApiError
  if (!result.ok) {
    throw new ApiError(result);
  }
  // Возвращаем JSON с типизацией
  const data = (await result.json()) as Promise<T>;
  return data;
};
