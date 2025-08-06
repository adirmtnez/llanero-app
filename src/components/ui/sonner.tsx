"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      toastOptions={{
        style: {
          background: "#000000",
          border: "1px solid #333333",
          color: "#ffffff !important",
        },
      }}
      style={{
        "--toast-color": "#000000",
        "--toast-description-color": "#727272",
      } as React.CSSProperties}
      {...props}
    />
  )
}

export { Toaster }
