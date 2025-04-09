
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Save, Edit, Check, X } from "lucide-react";
import { formatProposalText } from "@/utils/formatProposalText";

interface EditableProposalContentProps {
  proposal: string;
  onCopy: () => void;
  onSave: () => void;
  onUpdate: (newContent: string) => void;
}

const EditableProposalContent: React.FC<EditableProposalContentProps> = ({
  proposal,
  onCopy,
  onSave,
  onUpdate,
}) => {
  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState(proposal);

  // Update local state when proposal changes from parent
  useEffect(() => {
    setEditedContent(proposal);
  }, [proposal]);

  const handleSaveChanges = () => {
    onUpdate(editedContent);
    setEditMode(false);
  };

  const handleCancelEdit = () => {
    setEditedContent(proposal);
    setEditMode(false);
  };

  return (
    <Card className="border-none shadow-md relative">
      <CardHeader className="bg-gray-50 border-b border-gray-100 rounded-t-lg p-6">
        <CardTitle className="text-2xl">Generated Proposal</CardTitle>
      </CardHeader>
      
      {!editMode && (
        <div className="absolute top-6 right-6 z-10">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setEditMode(true)}
            className="bg-white shadow-sm"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      )}
      
      <CardContent className="p-8">
        {editMode ? (
          <div className="transition-opacity duration-300">
            <p className="text-sm text-gray-500 italic mb-2">
              Tip: Use <strong>**double asterisks**</strong> for bold, <code>##</code> for headings, and <code>|</code> for tables.
            </p>
            <textarea
              className="w-full min-h-[400px] border border-gray-300 rounded-md p-4 font-mono bg-white"
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              placeholder="Edit your proposal..."
            />
          </div>
        ) : (
          <div className="prose prose-blue max-w-none transition-opacity duration-300">
            {formatProposalText(editedContent)}
          </div>
        )}
      </CardContent>
      
      {editMode ? (
        <div className="sticky bottom-0 bg-white border-t p-4 flex justify-end gap-2 shadow-lg">
          <Button variant="ghost" onClick={handleCancelEdit}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSaveChanges}>
            <Check className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      ) : (
        <CardFooter className="py-4 px-8 bg-gray-50 border-t border-gray-100 rounded-b-lg flex justify-end gap-3">
          <Button variant="outline" onClick={onCopy}>
            <Copy className="mr-2 h-4 w-4" />
            Copy
          </Button>
          <Button variant="secondary" onClick={onSave}>
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default EditableProposalContent;
