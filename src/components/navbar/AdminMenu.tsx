import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const AdminMenu = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 px-3">
          Admin
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuItem asChild>
          <Link to="/admin" className="w-full">Admin Dashboard</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/admin/prompt-builder" className="w-full">Prompt Builder</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/admin/ai-settings" className="w-full">AI Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/admin/vector-upload" className="w-full">Vector Upload</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/admin/logs/activity" className="w-full">Activity Logs</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/admin/boilerplate" className="w-full">Boilerplate Manager</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/admin/estimate-prompts" className="w-full">Estimate Prompts</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
