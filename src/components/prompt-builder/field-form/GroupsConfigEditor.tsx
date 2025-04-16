
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, GripVertical, Plus } from "lucide-react";
import { MatrixGroup, MatrixRow } from "@/types/prompt-templates";

interface GroupsConfigEditorProps {
  groups: MatrixGroup[];
  rows: MatrixRow[];
  onChange: (groups: MatrixGroup[]) => void;
}

const GroupsConfigEditor: React.FC<GroupsConfigEditorProps> = ({ groups, rows, onChange }) => {
  const [newGroupLabel, setNewGroupLabel] = useState("");

  const handleAddGroup = () => {
    if (!newGroupLabel.trim()) return;
    
    // Generate ID from label (slug)
    const id = newGroupLabel.trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    
    // Ensure ID is unique
    const uniqueId = groups.find(g => g.id === id) 
      ? `${id}-${Date.now()}`
      : id;
    
    const newGroup: MatrixGroup = {
      id: uniqueId,
      label: newGroupLabel.trim(),
      rowIds: [],
    };
    
    onChange([...groups, newGroup]);
    setNewGroupLabel("");
  };

  const handleDeleteGroup = (groupId: string) => {
    onChange(groups.filter(group => group.id !== groupId));
  };

  const handleUpdateGroupLabel = (groupId: string, newLabel: string) => {
    onChange(groups.map(group => 
      group.id === groupId 
        ? { ...group, label: newLabel } 
        : group
    ));
  };

  const handleMoveGroup = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= groups.length) return;
    
    const newGroups = [...groups];
    const [movedGroup] = newGroups.splice(fromIndex, 1);
    newGroups.splice(toIndex, 0, movedGroup);
    
    onChange(newGroups);
  };

  const handleAddRowToGroup = (groupId: string, rowId: string) => {
    // Remove row from any other group it might be in
    const updatedGroups = groups.map(group => ({
      ...group,
      rowIds: group.id === groupId 
        ? [...group.rowIds, rowId] 
        : group.rowIds.filter(id => id !== rowId)
    }));
    
    onChange(updatedGroups);
  };

  const handleRemoveRowFromGroup = (groupId: string, rowId: string) => {
    onChange(groups.map(group => 
      group.id === groupId 
        ? { ...group, rowIds: group.rowIds.filter(id => id !== rowId) }
        : group
    ));
  };

  // Find rows that don't belong to any group
  const getUnassignedRows = () => {
    const assignedRowIds = groups.flatMap(group => group.rowIds);
    return rows.filter(row => !assignedRowIds.includes(row.id));
  };

  const unassignedRows = getUnassignedRows();

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <Label htmlFor="groups-editor">Room Groups</Label>
        <p className="text-sm text-muted-foreground mb-2">
          Create groups to categorize rooms (e.g., Main Floor, Upstairs, Basement).
        </p>
      </div>

      {/* Group list */}
      <div className="space-y-3">
        {groups.map((group, index) => (
          <Card key={group.id} className="relative">
            <div className="absolute left-2 top-1/2 -translate-y-1/2 cursor-move opacity-50 hover:opacity-100">
              <GripVertical className="h-5 w-5" />
            </div>
            <CardContent className="p-3 pl-8 space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  value={group.label}
                  onChange={(e) => handleUpdateGroupLabel(group.id, e.target.value)}
                  className="flex-1"
                  placeholder="Group name"
                />
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleDeleteGroup(group.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div>
                <Label className="text-xs">Assigned Rooms:</Label>
                <div className="flex flex-wrap gap-1 mt-1 min-h-8">
                  {group.rowIds.length > 0 ? (
                    group.rowIds.map(rowId => {
                      const row = rows.find(r => r.id === rowId);
                      return row ? (
                        <Badge 
                          key={rowId} 
                          className="flex items-center gap-1 bg-muted text-muted-foreground hover:bg-muted/80"
                        >
                          {row.label}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => handleRemoveRowFromGroup(group.id, rowId)}
                          />
                        </Badge>
                      ) : null;
                    })
                  ) : (
                    <span className="text-xs text-muted-foreground italic">No rooms assigned</span>
                  )}
                </div>
              </div>
              
              {unassignedRows.length > 0 && (
                <div>
                  <Label className="text-xs">Add Rooms:</Label>
                  <ScrollArea className="h-20 mt-1 border rounded-md p-1">
                    <div className="flex flex-wrap gap-1 p-1">
                      {unassignedRows.map(row => (
                        <Badge 
                          key={row.id} 
                          variant="outline"
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                          onClick={() => handleAddRowToGroup(group.id, row.id)}
                        >
                          {row.label}
                        </Badge>
                      ))}
                      
                      {/* Show rows from other groups with special styling */}
                      {rows
                        .filter(row => !unassignedRows.includes(row) && !group.rowIds.includes(row.id))
                        .map(row => (
                          <Badge 
                            key={row.id} 
                            variant="outline"
                            className="cursor-pointer border-dashed hover:bg-primary hover:text-primary-foreground"
                            onClick={() => handleAddRowToGroup(group.id, row.id)}
                          >
                            {row.label} <span className="text-xs opacity-70">(reassign)</span>
                          </Badge>
                        ))
                      }
                    </div>
                  </ScrollArea>
                </div>
              )}
              
              <div className="flex justify-between text-xs text-muted-foreground pt-1">
                <span>ID: {group.id}</span>
                {index > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => handleMoveGroup(index, index - 1)}
                  >
                    Move Up
                  </Button>
                )}
                {index < groups.length - 1 && (
                  <Button
                    variant="ghost" 
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => handleMoveGroup(index, index + 1)}
                  >
                    Move Down
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add new group */}
      <div className="flex gap-2 items-center">
        <Input
          value={newGroupLabel}
          onChange={(e) => setNewGroupLabel(e.target.value)}
          placeholder="New group name"
          className="flex-1"
          onKeyDown={(e) => e.key === "Enter" && handleAddGroup()}
        />
        <Button onClick={handleAddGroup} disabled={!newGroupLabel.trim()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Group
        </Button>
      </div>
    </div>
  );
};

export default GroupsConfigEditor;
