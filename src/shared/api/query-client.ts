import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      //время, пока данные считаются свежими, в этот период не будет автоматического refetch
      staleTime: 60 * 1000,
      //время, после которого кешированные данные удаляются,отсчитывается с момента, когда последний наблюдатель (компонент) отписался
      gcTime: 5 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});
