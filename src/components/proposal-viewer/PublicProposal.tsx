
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PublicProposalProps {
  id: string;
}

const PublicProposal: React.FC<PublicProposalProps> = ({ id }) => {
  const [snapshotHtml, setSnapshotHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSnapshot = async () => {
      try {
        const { data, error } = await supabase
          .from("saved_proposals")
          .select("snapshot_html")
          .eq("id", id)
          .single();

        if (error) {
          throw error;
        }

        if (!data?.snapshot_html) {
          setError("Proposal snapshot not found");
          setLoading(false);
          return;
        }

        setSnapshotHtml(data.snapshot_html);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching proposal snapshot:", err);
        setError("Failed to load proposal");
        setLoading(false);
      }
    };

    fetchSnapshot();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-8 rounded-lg border border-gray-200 shadow-sm text-center">
          <h2 className="text-xl font-medium mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  // Render the snapshot HTML directly
  // Note: This is a simple implementation, in a real app you might want to sanitize the HTML
  return (
    <div dangerouslySetInnerHTML={{ __html: snapshotHtml || '' }} />
  );
};

export default PublicProposal;
