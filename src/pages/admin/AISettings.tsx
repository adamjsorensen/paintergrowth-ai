import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { supabase, AISettings } from "@/integrations/supabase/client";
import PageLayout from "@/components/PageLayout";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";

const AISettingsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<AISettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("ai_settings")
          .select("*")
          .limit(1)
          .single();
          
        if (error) {
          console.error("Error fetching AI settings:", error);
        } else if (data) {
          setSettings({
            id: data.id,
            model: data.model,
            temperature: data.temperature,
            max_tokens: data.max_tokens,
            default_system_prompt: data.default_system_prompt,
            default_user_prompt: data.default_user_prompt,
            created_at: data.created_at,
            updated_at: data.updated_at
          });
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, []);
  
  const handleSave = async () => {
    if (!settings) return;
    
    try {
      setSaving(true);
      
      if (settings.id) {
        const { error } = await supabase
          .from("ai_settings")
          .update({
            updated_at: new Date().toISOString(),
            model: settings.model,
            temperature: settings.temperature,
            max_tokens: settings.max_tokens,
            default_system_prompt: settings.default_system_prompt,
            default_user_prompt: settings.default_user_prompt
          })
          .eq("id", settings.id);
          
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("ai_settings")
          .insert({
            model: settings.model || "gpt-4o-mini",
            temperature: settings.temperature || 0.7,
            max_tokens: settings.max_tokens || 1024,
            default_system_prompt: settings.default_system_prompt,
            default_user_prompt: settings.default_user_prompt
          });
          
        if (error) throw error;
      }
      
      toast({
        title: "Settings saved",
        description: "Your AI settings have been updated successfully.",
      });
      
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "There was a problem saving your settings.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageLayout title="AI Settings">
      <div className="max-w-3xl mx-auto pb-10">
        <Breadcrumb className="mb-6 ml-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink as={Link} to="/dashboard">
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink as={Link} to="/admin">
                Admin
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbPage>AI Settings</BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>
        
        <Card>
          <CardHeader>
            <CardTitle>AI Configuration</CardTitle>
            <CardDescription>
              Configure the AI model settings for content generation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="model">AI Model</Label>
                  <Select 
                    value={settings?.model || "gpt-4o-mini"} 
                    onValueChange={(value) => setSettings(prev => prev ? {...prev, model: value} : null)}
                  >
                    <SelectTrigger id="model">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                      <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                      <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                      <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="temperature">Temperature: {settings?.temperature?.toFixed(1) || "0.7"}</Label>
                  </div>
                  <Slider 
                    id="temperature"
                    min={0} 
                    max={1} 
                    step={0.1} 
                    value={settings?.temperature ? [settings.temperature] : [0.7]}
                    onValueChange={(values) => setSettings(prev => prev ? {...prev, temperature: values[0]} : null)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Lower values produce more focused, deterministic results. Higher values produce more creative, varied results.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maxTokens">Max Tokens</Label>
                  <Input 
                    id="maxTokens"
                    type="number" 
                    value={settings?.max_tokens || 1024}
                    min={1}
                    max={4096}
                    onChange={(e) => setSettings(prev => prev ? {...prev, max_tokens: parseInt(e.target.value)} : null)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum number of tokens that can be generated in the completion.
                  </p>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label htmlFor="systemPrompt">Default System Prompt</Label>
                  <Textarea 
                    id="systemPrompt"
                    rows={5}
                    placeholder="You are a helpful assistant..."
                    value={settings?.default_system_prompt || ""}
                    onChange={(e) => setSettings(prev => prev ? {...prev, default_system_prompt: e.target.value} : null)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="userPrompt">Default User Prompt Template</Label>
                  <Textarea 
                    id="userPrompt"
                    rows={5}
                    placeholder="Write a proposal for {{client}} about {{topic}}..."
                    value={settings?.default_user_prompt || ""}
                    onChange={(e) => setSettings(prev => prev ? {...prev, default_user_prompt: e.target.value} : null)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Use double curly braces {{"{{"}}variable{{"}}"}} for template variables.
                  </p>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={handleSave} 
                    disabled={saving || loading}
                  >
                    {saving ? "Saving..." : "Save Settings"}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default AISettingsPage;
