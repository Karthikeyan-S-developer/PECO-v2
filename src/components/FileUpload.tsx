import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Paperclip, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface FileUploadProps {
  onFileUploaded: (fileUrl: string, fileName: string, fileType: string) => void;
  externalPreview?: { url: string; name: string; type: string } | null;
}

const FileUpload = ({ onFileUploaded, externalPreview }: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<{ url: string; name: string; type: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (50MB limit)
    if (file.size > 52428800) {
      toast({
        title: "File too large",
        description: "Maximum file size is 50MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(7)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('chat-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('chat-files')
        .getPublicUrl(data.path);

      setPreview({
        url: publicUrl,
        name: file.name,
        type: file.type,
      });

      onFileUploaded(publicUrl, file.name, file.type);

      toast({
        title: "File uploaded!",
        description: "File ready to send",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Could not upload file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const clearPreview = () => {
    setPreview(null);
  };

  // Sync local preview with external preview from parent (e.g. when message is sent)
  useEffect(() => {
    if (!externalPreview) {
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setPreview({ url: externalPreview.url, name: externalPreview.name, type: externalPreview.type });
  }, [externalPreview]);

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        className="hidden"
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
      />
      
      {preview ? (
        <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border border-border/50 max-w-[60%] md:max-w-[40%]">
          {/* limit max width so long filenames don't push other UI elements */}
          <span className="text-sm text-muted-foreground truncate flex-1 min-w-0">
            {preview.name}
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={clearPreview}
            className="h-6 w-6 p-0"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="h-10 w-10 p-0"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Paperclip className="w-4 h-4" />
          )}
        </Button>
      )}
    </>
  );
};

export default FileUpload;
