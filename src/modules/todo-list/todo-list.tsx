import { type FC, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { todoListApi } from "./api";
import { Loader } from "../../shared/components/loader";
import { useIntersection } from "../../shared/hooks/use-intersection";

export const TodoList: FC = () => {
  const [enabled, setEnabled] = useState<boolean>(true);
  const {
    data,
    error,
    isLoading,
    isPlaceholderData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    ...todoListApi.getTodoListInfinityQueryOptions(),
    enabled,
  });

  const cursorRef = useIntersection(() => {
    fetchNextPage();
  });

  if (isLoading) {
    return <Loader />;
  }
  if (error) {
    return <>{JSON.stringify(error)}</>;
  }
  //Чтобы cursorRef срабатывал не в самом конце списка, а «за 5 элементов до конца»
  const sentinelIndex = data ? data.length - 5 : 0;

  return (
    <div className="max-w-[1240px] w-full mx-auto ">
      <h1 className="my-10 text-3xl">TODO LIST</h1>

      <button
        className="bg-orange-400 px-4 py-2 cursor-pointer rounded-[8px] mb-8"
        onClick={() => setEnabled((e) => !e)}
      >
        Enable query
      </button>
      <ul
        className={"space-y-3 mb-5 " + (isPlaceholderData ? " opacity-50" : "")}
      >
        {data?.map((todo, index) => (
          <li
            key={todo.id}
            className="flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm border border-gray-100"
          >
            <input
              type="checkbox"
              checked={todo.done}
              readOnly
              className="h-5 w-5 rounded border-gray-300 text-blue-500 focus:ring-blue-400 cursor-pointer"
            />

            <span
              className={`text-lg ${todo.done ? "line-through text-gray-400" : "text-navy-500"}`}
            >
              {todo.text}
            </span>
            {/* sentinel вставляется за 5 элементов до конца */}
            {index === sentinelIndex && hasNextPage && (
              <div ref={cursorRef} className="h-1 w-full">
                {isFetchingNextPage && <Loader />}
              </div>
            )}
          </li>
        ))}
      </ul>

      <div ref={cursorRef} className="w-full h-[100px]">
        {!hasNextPage && <p>Долистал до конца списка</p>}
      </div>
    </div>
  );
};
