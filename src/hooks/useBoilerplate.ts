
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BoilerplateText, BoilerplateType, PlaceholderDefault } from '@/types/boilerplate';
import { useToast } from '@/hooks/use-toast';

export const useBoilerplateTexts = () => {
  return useQuery({
    queryKey: ['boilerplate-texts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('boilerplate_texts')
        .select('*')
        .order('type')
        .order('locale');
      
      if (error) throw error;
      return data as BoilerplateText[];
    },
  });
};

export const useBoilerplateText = (id: string) => {
  return useQuery({
    queryKey: ['boilerplate-texts', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('boilerplate_texts')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as BoilerplateText;
    },
    enabled: !!id,
  });
};

export const useBoilerplateByType = (type: BoilerplateType, locale: string = 'en-US') => {
  return useQuery({
    queryKey: ['boilerplate-texts', type, locale],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('boilerplate_texts')
        .select('*')
        .eq('type', type)
        .eq('locale', locale)
        .single();
      
      if (error) throw error;
      return data as BoilerplateText;
    },
  });
};

export const usePlaceholderDefaults = () => {
  return useQuery({
    queryKey: ['placeholder-defaults'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('placeholder_defaults')
        .select('*');
      
      if (error) throw error;
      
      // Transform array to Record for easier lookup
      const defaultsMap: Record<string, string> = {};
      (data as PlaceholderDefault[]).forEach(item => {
        defaultsMap[item.placeholder] = item.default_value;
      });
      
      return defaultsMap;
    },
  });
};

export const useBoilerplateMutations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createBoilerplate = useMutation({
    mutationFn: async (boilerplate: Omit<BoilerplateText, 'id' | 'version' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('boilerplate_texts')
        .insert(boilerplate)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boilerplate-texts'] });
      toast({
        title: "Success",
        description: "Boilerplate text created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create boilerplate text",
        variant: "destructive",
      });
    },
  });

  const updateBoilerplate = useMutation({
    mutationFn: async ({ id, ...boilerplate }: Partial<BoilerplateText> & { id: string }) => {
      const { data, error } = await supabase
        .from('boilerplate_texts')
        .update(boilerplate)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boilerplate-texts'] });
      toast({
        title: "Success",
        description: "Boilerplate text updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update boilerplate text",
        variant: "destructive",
      });
    },
  });

  const deleteBoilerplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('boilerplate_texts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boilerplate-texts'] });
      toast({
        title: "Success",
        description: "Boilerplate text deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete boilerplate text",
        variant: "destructive",
      });
    },
  });

  const createPlaceholderDefault = useMutation({
    mutationFn: async (placeholderDefault: PlaceholderDefault) => {
      const { data, error } = await supabase
        .from('placeholder_defaults')
        .insert(placeholderDefault)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['placeholder-defaults'] });
      toast({
        title: "Success",
        description: "Placeholder default created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create placeholder default",
        variant: "destructive",
      });
    },
  });

  return {
    createBoilerplate,
    updateBoilerplate,
    deleteBoilerplate,
    createPlaceholderDefault
  };
};
