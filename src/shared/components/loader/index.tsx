import { type FC } from "react";

type LoaderProps = { size?: number; className?: string };

export const Loader: FC<LoaderProps> = ({ size = 64, className = "" }) => {
  return (
    <span
      className={
        "inline-block animate-spin rounded-full border-3 border-solid border-blue-400 border-t-transparent " +
        className
      }
      style={{ width: size, height: size }}
      aria-label="Loading"
      role="status"
    />
  );
};
