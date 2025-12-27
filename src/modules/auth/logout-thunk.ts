import { queryClient } from "../../shared/api/query-client";
import { type AppThunk } from "../../shared/redux";
import { authSlice } from "./auth.slice";

export const logoutThunk = (

): AppThunk => async dispatch => {
    dispatch(authSlice.actions.removeUser());
    queryClient.removeQueries();
    localStorage.removeItem("userId");
};