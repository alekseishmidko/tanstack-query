import { type FC } from "react";

import { useTodoListPagination } from "./use-todo-list";

import { useCreateTodo } from "./use-create-todo";
import { useDeleteTodo } from "./use-delete-todo";
import { useToggleTodo } from "./use-toggle-todo";

export const TodoList: FC = () => {
  const { data, error } = useTodoListPagination();
  const createTodo = useCreateTodo();
  const toggleTodo = useToggleTodo();
  const deleteTodo = useDeleteTodo();

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
          className="rounded p-2 border border-teal-500 disabled:opacity-50 cursor-pointer"
        >
          Создать
        </button>
      </form>

      <ul className={"space-y-3 mb-5 "}>
        {data?.data?.map((todo) => (
          <li
            key={todo.id}
            className="flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm border border-gray-100"
          >
            <input
              type="checkbox"
              checked={todo.done}
              onClick={() => toggleTodo.toggleTodo(todo)}
              readOnly
              className="h-5 w-5 rounded border-gray-300 text-blue-500 focus:ring-blue-400 cursor-pointer"
            />
            <div className="flex items-center justify-between w-full">
              <span
                className={`text-lg ${todo.done ? "line-through text-gray-400" : "text-navy-500"}`}
              >
                {todo.text}
              </span>

              <button
                disabled={deleteTodo.getIsItemPending(todo.id)}
                onClick={() => deleteTodo.handleDelete(todo.id)}
                className="rounded p-2 border border-teal-500 disabled:opacity-50 cursor-pointer"
              >
                Удалить
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
