import { type FC } from "react";
import { Loader } from "../../shared/components/loader";
import { useTodoList } from "./use-todo-list";

export const TodoList: FC = () => {
  const {
    data,
    isPlaceholderData,
    hasNextPage,
    error,
    isLoading,
    sentinelCursor,
    cursor,
  } = useTodoList();

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
            {index === sentinelIndex && hasNextPage && sentinelCursor}
          </li>
        ))}
      </ul>

      {cursor}
    </div>
  );
};
