"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useLanguageStore } from "@/context/store";

const LANGUAGES = [
  "Python",
  "Java",
  "JavaScript",
  "TypeScript",
  "C",
  "C++",
  "C#",
  "Go",
  "Rust",
  "Kotlin",
  "Swift",
  "Dart",
  "PHP",
  "Ruby",
  "Scala",
  "Haskell",
  "Elixir",
  "R",
  "MATLAB",
  "SQL",
  "Bash",
  "Shell",
  "Perl",
  "Lua",
  "Julia",
  "Objective-C",
  "Assembly",
  "Solidity",
];

export function DropdownMenuDemo({ onSelect,disabled }: { onSelect?: (lang: string) => void,
  disabled?:boolean }) {
  const { language, setLanguage } = useLanguageStore(); 
  const handleSelect = (lang: string) => {
    setLanguage(lang)
    onSelect?.(lang);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <Button variant="outline">{language || "Select Language"}</Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>Select Programming Language</DropdownMenuLabel>

        {LANGUAGES.map((lang) => (
          <DropdownMenuItem key={lang} onClick={() => handleSelect(lang)}>
            {lang}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
