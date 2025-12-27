import { TodoList } from "../modules/todo-list/todo-list";
import { useUser } from "../modules/auth/use-user";
import { Login } from "../modules/auth/login";
import { LogoutButton } from "../modules/auth/logout-button";
import { prefetchTodoList } from "../modules/todo-list/prefetch-todo-list";

export function App() {
  const user = useUser();

  if (user.isLoading) {
    return <div>Loading</div>;
  }

  if (user.data) {
    prefetchTodoList();

    return (
      <>
        <LogoutButton />
        <TodoList />
      </>
    );
  }

  return <Login />;
}
