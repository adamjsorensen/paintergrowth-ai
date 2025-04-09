
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import PageLayout from "@/components/PageLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Loader2, Info, Copy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";

// Properly define the interface to match the database table
interface GenerationLog {
  id: string;
  user_id: string | null;
  user_email: string;
  created_at: string;
  model_used: string;
  prompt_id: string | null;
  proposal_id: string | null;
  status: string;
  user_input: Record<string, any>;
  system_prompt: string;
  final_prompt: string;
  ai_response: string | null;
  rag_context: string | null;
}

const ActivityLog = () => {
  const [selectedLog, setSelectedLog] = useState<GenerationLog | null>(null);
  const { toast } = useToast();

  const {
    data: logs,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["generationLogs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("generation_logs")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data as GenerationLog[];
    }
  });

  const handleRowClick = (log: GenerationLog) => {
    setSelectedLog(log);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard.`,
      });
    });
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy h:mm a");
    } catch (e) {
      return dateString;
    }
  };

  const truncateText = (text: string, length = 10) => {
    if (!text) return "";
    return text.length > length ? `${text.substring(0, length)}...` : text;
  };

  if (isLoading) {
    return (
      <PageLayout title="Activity Log">
        <div className="container mx-auto py-8 px-4">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            <span className="ml-2 text-gray-500">Loading logs...</span>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title="Activity Log">
        <div className="container mx-auto py-8 px-4">
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
            <h3 className="text-lg font-medium">Error Loading Logs</h3>
            <p className="mt-1">{error instanceof Error ? error.message : 'An unknown error occurred'}</p>
            <Button onClick={() => refetch()} className="mt-4" variant="outline">
              Retry
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Activity Log">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Activity Log</h1>
          <p className="text-gray-600 mt-2">
            Review all AI generation requests and their outcomes.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Template ID</TableHead>
                  <TableHead>Proposal ID</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs && logs.length > 0 ? (
                  logs.map((log) => (
                    <TableRow 
                      key={log.id} 
                      onClick={() => setSelectedLog(log)}
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      <TableCell>{log.user_email}</TableCell>
                      <TableCell>{formatDate(log.created_at)}</TableCell>
                      <TableCell>{log.model_used.replace('openai/', '')}</TableCell>
                      <TableCell>{log.prompt_id ? truncateText(log.prompt_id) : '-'}</TableCell>
                      <TableCell>{log.proposal_id ? truncateText(log.proposal_id) : '-'}</TableCell>
                      <TableCell>
                        <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                          {log.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      <Info className="h-5 w-5 mx-auto mb-2" />
                      No activity logs found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white z-10 pb-4">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle>Generation Details</DialogTitle>
                  <DialogClose asChild>
                    <Button variant="ghost" size="icon">
                      <X className="h-4 w-4" />
                    </Button>
                  </DialogClose>
                </div>
              </DialogHeader>
              
              <div className="flex flex-wrap gap-2 mt-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => selectedLog && copyToClipboard(selectedLog.system_prompt, 'System prompt')}
                >
                  <Copy className="h-3 w-3 mr-1" /> Copy System Prompt
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => selectedLog && selectedLog.ai_response && copyToClipboard(selectedLog.ai_response, 'AI response')}
                >
                  <Copy className="h-3 w-3 mr-1" /> Copy Response
                </Button>
              </div>
            </div>

            {selectedLog && (
              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">User</h4>
                    <p className="mt-1">{selectedLog.user_email}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Timestamp</h4>
                    <p className="mt-1">{formatDate(selectedLog.created_at)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Model</h4>
                    <p className="mt-1">{selectedLog.model_used}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Proposal ID</h4>
                    <p className="mt-1 font-mono text-sm break-all">{selectedLog.proposal_id || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Prompt Template ID</h4>
                    <p className="mt-1 font-mono text-sm break-all">{selectedLog.prompt_id || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Status</h4>
                    <Badge variant={selectedLog.status === 'success' ? 'default' : 'destructive'} className="mt-1">
                      {selectedLog.status}
                    </Badge>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">System Prompt</h4>
                  <div className="bg-gray-50 p-4 rounded-md font-mono text-sm whitespace-pre-wrap">
                    {selectedLog.system_prompt}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Final Prompt</h4>
                  <div className="bg-gray-50 p-4 rounded-md font-mono text-sm">
                    {selectedLog.final_prompt}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">User Input</h4>
                  <div className="bg-gray-50 p-4 rounded-md font-mono text-sm whitespace-pre-wrap overflow-x-auto">
                    {JSON.stringify(selectedLog.user_input, null, 2)}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">AI Response</h4>
                  <div className="bg-gray-50 p-4 rounded-md font-mono text-sm whitespace-pre-wrap max-h-[500px] overflow-y-auto">
                    {selectedLog.ai_response || 'No response available'}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
};

export default ActivityLog;
