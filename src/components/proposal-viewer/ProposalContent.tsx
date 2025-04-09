
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatProposalText } from "@/utils/formatProposalText";
import EditableProposal from "./EditableProposal";
import FloatingActionButtons from "./FloatingActionButtons";
import { useToast } from "@/hooks/use-toast";

interface ProposalContentProps {
  proposal: string;
  onCopy: () => void;
  onSave: (updatedProposal?: string) => void;
}

const ProposalContent: React.FC<ProposalContentProps> = ({
  proposal,
  onCopy,
  onSave,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState(proposal);
  const { toast } = useToast();

  const handleToggleEdit = () => {
    if (isEditing) {
      // If we're exiting edit mode without saving, revert changes
      setEditableContent(proposal);
    }
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    onSave(editableContent);
    setIsEditing(false);
    toast({
      title: "Changes saved",
      description: "Your proposal has been updated.",
    });
  };

  const handleContentChange = (html: string) => {
    setEditableContent(html);
  };

  return (
    <Card className="border-none shadow-md relative">
      <CardHeader className="bg-gray-50 border-b border-gray-100 rounded-t-lg p-6">
        <CardTitle className="text-2xl">Generated Proposal</CardTitle>
      </CardHeader>
      <CardContent className="p-8 relative min-h-[500px]">
        {isEditing ? (
          <EditableProposal
            content={editableContent}
            onChange={handleContentChange}
          />
        ) : (
          <div className="prose prose-blue max-w-none">
            {formatProposalText(proposal)}
          </div>
        )}
      </CardContent>
      
      <FloatingActionButtons
        onCopy={onCopy}
        onSave={handleSave}
        isEditing={isEditing}
        onToggleEdit={handleToggleEdit}
      />
    </Card>
  );
};

export default ProposalContent;
