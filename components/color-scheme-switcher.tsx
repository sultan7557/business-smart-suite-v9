"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Palette } from "lucide-react"
import { useTheme } from "next-themes"

const colorSchemes = [
  {
    name: "Default",
    colors: {
      primary: "222.2 47.4% 11.2%",
      secondary: "210 40% 96.1%",
      accent: "210 40% 96.1%",
    },
  },
  {
    name: "Black & Gold",
    colors: {
      primary: "45 100% 50%",
      secondary: "0 0% 0%",
      accent: "45 100% 50%",
    },
  },
  {
    name: "Ocean Blue",
    colors: {
      primary: "210 100% 50%",
      secondary: "210 40% 96.1%",
      accent: "210 100% 50%",
    },
  },
  {
    name: "Forest Green",
    colors: {
      primary: "142 76% 36%",
      secondary: "210 40% 96.1%",
      accent: "142 76% 36%",
    },
  },
]

export function ColorSchemeSwitcher() {
  const { setTheme } = useTheme()

  const applyColorScheme = (scheme: typeof colorSchemes[0]) => {
    const root = document.documentElement
    root.style.setProperty("--primary", scheme.colors.primary)
    root.style.setProperty("--secondary", scheme.colors.secondary)
    root.style.setProperty("--accent", scheme.colors.accent)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8">
          <Palette className="h-4 w-4" />
          <span className="sr-only">Switch color scheme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {colorSchemes.map((scheme) => (
          <DropdownMenuItem
            key={scheme.name}
            onClick={() => applyColorScheme(scheme)}
          >
            {scheme.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 