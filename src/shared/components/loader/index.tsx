import React, { Suspense } from "react";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";

/**
 * Компонент Loader:
 * Оборачивает детей сразу в три механизма:
 *
 * 1. QueryErrorResetBoundary  — связывает ошибки React Query с ErrorBoundary
 * 2. ErrorBoundary            — ловит ошибки рендера и ошибки запросов
 * 3. Suspense                 — показывает fallback, пока данные загружаются
 *
 * В итоге это единая точка:
 * - отображения загрузки
 * - восстановления после ошибок
 * - перезапуска запросов React Query
 */
export function Loader({ children }: { children: React.ReactNode }) {
  return (
    /**
     * QueryErrorResetBoundary:
     * -------------------------
     * Позволяет ErrorBoundary "сбрасывать" состояние ошибок в React Query.
     *
     * Передаёт функцию reset, которая очищает ошибки useQuery/useMutation.
     */
    <QueryErrorResetBoundary>
      {({ reset }) => (
        /**
         * ErrorBoundary:
         * --------------
         * Ловит ошибки:
         * - синхронного рендера компонентов
         * - Suspense-её ошибок
         * - ошибок React Query (если они bubbling up)
         *
         * onReset вызывает reset из QueryErrorResetBoundary,
         * тем самым повторно активируя запросы React Query.
         */
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ resetErrorBoundary }) => (
            /**
             * Кастомный UI при ошибке:
             * - сообщение
             * - кнопка "Try again"
             *
             * resetErrorBoundary() сбрасывает состояние ErrorBoundary,
             * а onReset() сбрасывает ошибки React Query.
             */
            <div>
              There was an error!
              <button onClick={() => resetErrorBoundary()}>Try again</button>
            </div>
          )}
        >
          {/**
           * Suspense:
           * ----------
           * Показывает fallback, пока React Query загружает данные
           * (актуально для useSuspenseQuery или enabled: false → true).
           *
           * Тут показывается полноэкранный loader.
           */}
          <Suspense
            fallback={
              <div className="fixed inset-0 bg-white flex justify-center items-center">
                <div className="text-teal-500 font-bold text-2xl">
                  Loading...
                </div>
              </div>
            }
          >
            {children}
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
