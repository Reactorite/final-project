import React, { ReactNode, useContext } from "react";
import { AppContext } from "../state/app.context";
import { Navigate, useLocation } from "react-router";

interface AuthenticatedProps {
  children: ReactNode;
}

export default function Authenticated({ children }: AuthenticatedProps) {
  const { user } = useContext(AppContext);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} />;
  }

  return (
    <>
      {children}
    </>
  )
}