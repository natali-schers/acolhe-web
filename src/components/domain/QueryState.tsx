import type { ReactNode } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import { ErrorState, Loading } from "@/components/ui";

interface QueryStateProps<T> {
  query: UseQueryResult<T>;
  children: (data: T) => ReactNode;
  loadingLabel?: string;
}

/** Mostra carregando/erro automaticamente e só renderiza o conteúdo quando os dados chegam. */
export function QueryState<T>({ query, children, loadingLabel }: QueryStateProps<T>) {
  if (query.isPending) return <Loading label={loadingLabel} />;
  if (query.isError) return <ErrorState message={query.error.message} onRetry={() => query.refetch()} />;
  return <>{children(query.data)}</>;
}
