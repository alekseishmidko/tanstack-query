import { useInfiniteQuery, useSuspenseQuery } from "@tanstack/react-query";
import { todoListApi } from "./api";
import { useIntersection } from "../../shared/hooks/use-intersection";

export const useTodoListEternal = () => {
  const {
    data,
    error,
    isLoading,
    isPlaceholderData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(todoListApi.getTodoListInfinityQueryOptions());

  // Intersection Observer — вызываем fetchNextPage при попадании в viewport
  const cursorRef = useIntersection(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  });

  // Sentinel элемент, который ставится «в конце» списка
  const sentinelCursor = (
    <div ref={cursorRef} className="h-1 w-full">
      {isFetchingNextPage}
    </div>
  );

  // Курсор, который рендерится после всех элементов
  const cursor = (
    <div ref={cursorRef} className="w-full h-[100px]">
      {!hasNextPage && <p>Долистал до конца списка</p>}
      {isFetchingNextPage}
    </div>
  );

  return {
    data, // плоский массив задач
    error, // ошибка запроса
    isLoading, // первый запрос
    isPlaceholderData, // отображаются старые данные
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    cursorRef, // можно использовать самостоятельно
    sentinelCursor, // sentinel за списком
    cursor, // альтернативный курсор
  };
};
export const useTodoListPagination = () => {
  const { data, error, isLoading, refetch } = useSuspenseQuery(
    todoListApi.getTodoListQueryOptions(),
  );

  return {
    data,
    error, // ошибка запроса
    isLoading, // первый запрос

    refetch,
  };
};
