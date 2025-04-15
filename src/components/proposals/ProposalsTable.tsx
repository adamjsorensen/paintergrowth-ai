
import { formatDistanceToNow } from "date-fns";
import { Eye, Trash2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Proposal } from "@/hooks/useSavedProposals";

interface ProposalsTableProps {
  proposals: Proposal[];
  onView: (proposal: Proposal) => void;
  onDelete: (id: string) => void;
  onPrint: (id: string) => void;
}

const ProposalsTable = ({ proposals, onView, onDelete, onPrint }: ProposalsTableProps) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {proposals.map((proposal) => (
            <TableRow key={proposal.id}>
              <TableCell className="font-medium">{proposal.title}</TableCell>
              <TableCell>{proposal.client_name || 'N/A'}</TableCell>
              <TableCell className="capitalize">{proposal.job_type || 'N/A'}</TableCell>
              <TableCell>{formatDistanceToNow(new Date(proposal.created_at), { addSuffix: true })}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button variant="ghost" size="sm" onClick={() => onView(proposal)}>
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">View</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onPrint(proposal.id)}>
                  <FileText className="h-4 w-4" />
                  <span className="sr-only">Print</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(proposal.id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                  <span className="sr-only">Delete</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProposalsTable;
