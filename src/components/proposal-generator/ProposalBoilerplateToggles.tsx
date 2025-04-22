
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FileText } from "lucide-react";

interface ProposalBoilerplateTogglesProps {
  includeBoilerplate: boolean;
  setIncludeBoilerplate: (v: boolean) => void;
  includeTerms: boolean;
  setIncludeTerms: (v: boolean) => void;
  includeWarranty: boolean;
  setIncludeWarranty: (v: boolean) => void;
}

const ProposalBoilerplateToggles: React.FC<ProposalBoilerplateTogglesProps> = ({
  includeBoilerplate,
  setIncludeBoilerplate,
  includeTerms,
  setIncludeTerms,
  includeWarranty,
  setIncludeWarranty,
}) => {
  return (
    <div className="mt-6 border-t border-gray-200 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="h-4 w-4 text-gray-500" />
          <h3 className="text-sm font-medium">Include Standard Content</h3>
        </div>
        <Switch
          checked={includeBoilerplate}
          onCheckedChange={setIncludeBoilerplate}
          id="include-boilerplate"
        />
      </div>

      {includeBoilerplate && (
        <div className="mt-4 pl-6 space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="include-terms" className="text-sm">Terms & Conditions</Label>
            <Switch
              checked={includeTerms}
              onCheckedChange={setIncludeTerms}
              id="include-terms"
              disabled={!includeBoilerplate}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="include-warranty" className="text-sm">Warranty Information</Label>
            <Switch
              checked={includeWarranty}
              onCheckedChange={setIncludeWarranty}
              id="include-warranty"
              disabled={!includeBoilerplate}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProposalBoilerplateToggles;
