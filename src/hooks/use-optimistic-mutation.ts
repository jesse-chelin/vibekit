import { useCallback, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UseOptimisticMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  queryKey: unknown[];
  updater: (old: TData | undefined, variables: TVariables) => TData;
}

export function useOptimisticMutation<TData, TVariables>({
  mutationFn,
  queryKey,
  updater,
}: UseOptimisticMutationOptions<TData, TVariables>) {
  const queryClient = useQueryClient();
  const previousDataRef = useRef<TData | undefined>(undefined);

  const mutation = useMutation({
    mutationFn,
    onMutate: async (variables: TVariables) => {
      await queryClient.cancelQueries({ queryKey });
      previousDataRef.current = queryClient.getQueryData<TData>(queryKey);
      queryClient.setQueryData<TData>(queryKey, (old) => updater(old, variables));
    },
    onError: () => {
      queryClient.setQueryData(queryKey, previousDataRef.current);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const mutate = useCallback(
    (variables: TVariables) => mutation.mutate(variables),
    [mutation]
  );

  return { ...mutation, mutate };
}
