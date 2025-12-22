import { type FC } from "react";
import { Loader } from "../../shared/components/loader";
import { useTodoListPagination } from "./use-todo-list";

import { useCreateTodo } from "./use-create-todo";

export const TodoList: FC = () => {
  const { data, isPlaceholderData, error, isLoading } = useTodoListPagination();
  const createTodo = useCreateTodo();
  if (isLoading) {
    return <Loader />;
  }
  if (error) {
    return <>{JSON.stringify(error)}</>;
  }

  return (
    <div className="max-w-[1240px] w-full mx-auto ">
      <h1 className="my-10 text-3xl">TODO LIST</h1>

      <form className="flex gap-2 mb-5" onSubmit={createTodo.handleCreate}>
        <input
          className="rounded p-2 border border-teal-500"
          type="text"
          name="text"
        />
        <button
          disabled={createTodo.isLoading}
          className="rounded p-2 border border-teal-500 disabled:opacity-50"
        >
          Создать
        </button>
      </form>

      <ul
        className={"space-y-3 mb-5 " + (isPlaceholderData ? " opacity-50" : "")}
      >
        {data?.data?.map((todo) => (
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
          </li>
        ))}
      </ul>
    </div>
  );
};
