import { useAppDispath } from "../../shared/redux";
import { logoutThunk } from "./logout-thunk";

export function LogoutButton() {
  const dispatch = useAppDispath();

  return (
    <button
      onClick={() => dispatch(logoutThunk())}
      className="border border-rose-500 p-3 rounded"
    >
      Выход
    </button>
  );
}
