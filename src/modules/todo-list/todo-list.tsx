import { type FC, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { todoListApi } from "./api";

export const TodoList: FC = () => {
  const [page, setPage] = useState<number>(1);
  const { data, error, isPending } = useQuery({
    queryKey: ["tasks", "list", page],
    queryFn: (meta) => todoListApi.getTodoList({ page }, meta),
  });
  if (isPending) {
    return <p>load</p>;
  }
  if (error) {
    return <>{JSON.stringify(error)}</>;
  }

  return (
    <div className="max-w-[1240px] w-full mx-auto ">
      <h1 className="my-10 text-3xl">TODO LIST</h1>
      <ul className="space-y-3 mb-5">
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

      {data && (
        <div className="flex gap-6 align-center justify-center ">
          <button
            onClick={() => setPage(data?.prev ?? data?.first ?? 1)}
            className="px-4 py-2 bg-red-200 rounded-[8px] cursor-pointer"
          >
            prev
          </button>
          <button
            onClick={() => setPage(data?.next ?? data?.first ?? 1)}
            className="px-4 py-2 bg-blue-200 rounded-[8px] cursor-pointer"
          >
            next
          </button>
        </div>
      )}
    </div>
  );
};
