"use client";

import { cn } from "@/lib/utils";
import {
  Code,
  Server,
  Layers,
  Palette,
  Brain,
  ClipboardList,
  Briefcase,
} from "lucide-react";

const ROLE_ICONS: Record<string, React.ElementType> = {
  "Frontend Developer": Code,
  "Backend Developer": Server,
  "Full-Stack Developer": Layers,
  "UI/UX Designer": Palette,
  "Data Scientist / ML Engineer": Brain,
  "Project Manager": ClipboardList,
  "Business / Strategy": Briefcase,
};

interface RoleSelectorProps {
  roles: readonly string[];
  selectedRole: string;
  onChange: (role: string) => void;
}

export function RoleSelector({
  roles,
  selectedRole,
  onChange,
}: RoleSelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {roles.map((role) => {
        const isSelected = selectedRole === role;
        const Icon = ROLE_ICONS[role] || Code;

        return (
          <button
            key={role}
            type="button"
            onClick={() => onChange(role)}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 text-center",
              isSelected
                ? "border-[#006241] bg-[#006241]/5 text-[#006241] shadow-md"
                : "border-gray-200 bg-white text-gray-600 hover:border-[#006241]/40 hover:shadow-sm"
            )}
          >
            <Icon
              className={cn(
                "h-6 w-6 transition-colors",
                isSelected ? "text-[#006241]" : "text-gray-400"
              )}
            />
            <span className="text-sm font-medium leading-tight">{role}</span>
          </button>
        );
      })}
    </div>
  );
}
