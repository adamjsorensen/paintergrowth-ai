
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { PlusCircle, FileText, Archive, AlignLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface ProfileData {
  full_name: string | null;
  company_name: string | null;
  business_name: string | null;
  location: string | null;
  created_at: string;
}

interface Proposal {
  id: string;
  title: string;
  created_at: string;
  status: string;
  client_name?: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [recentProposals, setRecentProposals] = useState<Proposal[]>([]);
  const [proposalMetrics, setProposalMetrics] = useState({
    thisMonth: 0,
    total: 0,
    avgWordCount: 0
  });
  const [isLoadingProposals, setIsLoadingProposals] = useState(true);
  
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 
    profileData?.full_name?.split(' ')[0] || 'Painter';
  
  // Fetch user profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
          
        if (error) {
          console.error("Error fetching profile data:", error);
        } else {
          setProfileData(data);
        }
      } catch (error) {
        console.error("Unexpected error fetching profile data:", error);
      } finally {
        setIsLoadingProfile(false);
      }
    };
    
    fetchProfileData();
  }, [user]);
  
  // Fetch proposal data
  useEffect(() => {
    const fetchRecentProposals = async () => {
      if (!user) return;
      
      try {
        // Get recent proposals
        const { data: recentData, error: recentError } = await supabase
          .from("saved_proposals")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5);
          
        if (recentError) {
          console.error("Error fetching recent proposals:", recentError);
        } else {
          setRecentProposals(recentData);
        }
        
        // Get this month's proposal count
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        const { count: thisMonthCount, error: monthError } = await supabase
          .from("saved_proposals")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .gte("created_at", startOfMonth.toISOString());
          
        if (monthError) {
          console.error("Error fetching monthly proposal count:", monthError);
        }
        
        // Get total proposal count
        const { count: totalCount, error: totalError } = await supabase
          .from("saved_proposals")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);
          
        if (totalError) {
          console.error("Error fetching total proposal count:", totalError);
        }
        
        // Calculate average word count
        const { data: allProposals, error: avgError } = await supabase
          .from("saved_proposals")
          .select("content")
          .eq("user_id", user.id)
          .not("content", "is", null);
          
        if (avgError) {
          console.error("Error fetching proposals for word count:", avgError);
        } else {
          let totalWords = 0;
          if (allProposals && allProposals.length > 0) {
            totalWords = allProposals.reduce((sum, proposal) => {
              const wordCount = proposal.content ? proposal.content.trim().split(/\s+/).length : 0;
              return sum + wordCount;
            }, 0);
          }
          
          const avgWords = allProposals.length > 0 ? Math.round(totalWords / allProposals.length) : 0;
          
          setProposalMetrics({
            thisMonth: thisMonthCount || 0,
            total: totalCount || 0,
            avgWordCount: avgWords
          });
        }
      } catch (error) {
        console.error("Unexpected error fetching proposals:", error);
      } finally {
        setIsLoadingProposals(false);
      }
    };
    
    fetchRecentProposals();
  }, [user]);
  
  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return "Unknown date";
    }
  };
  
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "generating":
      case "pending":
        return "secondary";
      default:
        return "outline";
    }
  };
  
  const getMemberSince = () => {
    if (!profileData?.created_at) return "";
    
    try {
      return format(new Date(profileData.created_at), "MMMM yyyy");
    } catch (error) {
      return "";
    }
  };
  
  return (
    <PageLayout title="Dashboard">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* User Welcome Card */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome back, {firstName}</CardTitle>
            {isLoadingProfile ? (
              <Skeleton className="h-5 w-2/3" />
            ) : (
              <CardDescription className="text-base">
                {profileData?.business_name || profileData?.company_name ? 
                  `Helping ${profileData?.business_name || profileData?.company_name}` : ""}
                {profileData?.location ? ` in ${profileData.location}` : ""}
                {getMemberSince() ? ` build better proposals since ${getMemberSince()}.` : ""}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate("/generate")}
              className="w-full sm:w-auto py-6 text-lg bg-paintergrowth-600 hover:bg-paintergrowth-700 transition-all duration-300 rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-3"
            >
              <PlusCircle className="h-6 w-6" />
              <span>Create New Content</span>
            </Button>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="text-center py-6">
            <CardHeader className="items-center pb-2">
              <FileText className="h-6 w-6 text-muted-foreground mb-2" />
              {isLoadingProposals ? (
                <Skeleton className="h-8 w-12 mx-auto" />
              ) : (
                <CardTitle className="text-2xl">{proposalMetrics.thisMonth}</CardTitle>
              )}
              <CardDescription>This Month</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Proposals Generated</p>
            </CardContent>
          </Card>
          <Card className="text-center py-6">
            <CardHeader className="items-center pb-2">
              <Archive className="h-6 w-6 text-muted-foreground mb-2" />
              {isLoadingProposals ? (
                <Skeleton className="h-8 w-12 mx-auto" />
              ) : (
                <CardTitle className="text-2xl">{proposalMetrics.total}</CardTitle>
              )}
              <CardDescription>All-Time</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Saved Proposals</p>
            </CardContent>
          </Card>
          <Card className="text-center py-6">
            <CardHeader className="items-center pb-2">
              <AlignLeft className="h-6 w-6 text-muted-foreground mb-2" />
              {isLoadingProposals ? (
                <Skeleton className="h-8 w-12 mx-auto" />
              ) : (
                <CardTitle className="text-2xl">{proposalMetrics.avgWordCount}</CardTitle>
              )}
              <CardDescription>Words</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Avg. Proposal Length</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Feed */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingProposals ? (
              // Skeleton loaders for activity feed
              Array(3).fill(0).map((_, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              ))
            ) : recentProposals.length > 0 ? (
              recentProposals.map((proposal) => (
                <div key={proposal.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium">{proposal.title}</p>
                    <p className="text-xs text-muted-foreground">{formatTimeAgo(proposal.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusBadgeVariant(proposal.status)}>
                      {proposal.status === "generating" ? "Generating" : 
                       proposal.status === "pending" ? "Pending" : "Completed"}
                    </Badge>
                    <Button size="sm" variant="outline" asChild>
                      <Link to={`/generate/proposal/${proposal.id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No recent proposals found</p>
                <Button 
                  variant="outline" 
                  className="mt-4" 
                  onClick={() => navigate("/generate")}
                >
                  Create your first proposal
                </Button>
              </div>
            )}
          </CardContent>
          {recentProposals.length > 0 && (
            <CardFooter>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-auto"
                onClick={() => navigate("/saved")}
              >
                View all proposals
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </PageLayout>
  );
};

export default Dashboard;
