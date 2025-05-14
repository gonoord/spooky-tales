"use client";

import { useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { StoryCardData } from "@/types";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

type AddCardDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddCard: (newCard: Omit<StoryCardData, 'id'>) => void; // ID will be generated in HomePage
};

export default function AddCardDialog({ isOpen, onOpenChange, onAddCard }: AddCardDialogProps) {
  const [phrase, setPhrase] = useState("");
  const [imageHint, setImageHint] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          title: "Image Too Large",
          description: "Please select an image smaller than 2MB.",
          variant: "destructive",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
        setImagePreview(reader.result as string);
      };
      reader.onerror = () => {
        toast({
          title: "Error Reading File",
          description: "Could not read the selected image.",
          variant: "destructive",
        });
      }
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!phrase.trim()) {
       toast({
        title: "Missing Phrase",
        description: "Please provide a phrase for your card.",
        variant: "destructive",
      });
      return;
    }
    if (!imageBase64) {
       toast({
        title: "Missing Image",
        description: "Please upload an image for your card.",
        variant: "destructive",
      });
      return;
    }
     if (!imageHint.trim()) {
      toast({
        title: "Missing Image Hint",
        description: "Please provide an image hint (for AI & alt text).",
        variant: "destructive",
      });
      return;
    }
    
    // Ensure imageHint is max two words if longer
    const hintWords = imageHint.trim().split(" ");
    const finalImageHint = hintWords.slice(0, 2).join(" ");


    const newCardData: Omit<StoryCardData, 'id'> = {
      imageUrl: imageBase64,
      phrase: phrase.trim(),
      imageHint: finalImageHint,
    };
    onAddCard(newCardData);
    toast({
      title: "Card Created!",
      description: "Your spooky new card has been added to the deck.",
    });
    // Reset form and close dialog
    setPhrase("");
    setImageHint("");
    setImageBase64(null);
    setImagePreview(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) { // Reset form if dialog is closed without submitting
        setPhrase("");
        setImageHint("");
        setImageBase64(null);
        setImagePreview(null);
      }
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[480px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-gothic text-primary">Create a New Spooky Card</DialogTitle>
          <DialogDescription>
            Add your own creepy image and phrase to the game. Image hint should be 1-2 words.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="phrase" className="text-foreground">Phrase</Label>
            <Textarea
              id="phrase"
              value={phrase}
              onChange={(e) => setPhrase(e.target.value)}
              placeholder="E.g., The walls whispered..."
              className="bg-input placeholder:text-muted-foreground"
              maxLength={100}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="imageHint" className="text-foreground">Image Hint (1-2 words for AI & alt text)</Label>
            <Input
              id="imageHint"
              value={imageHint}
              onChange={(e) => setImageHint(e.target.value)}
              placeholder="E.g., abandoned house"
              className="bg-input placeholder:text-muted-foreground"
              maxLength={30}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="image" className="text-foreground">Creepy Image (max 2MB)</Label>
            <Input
              id="image"
              type="file"
              accept="image/png, image/jpeg, image/webp, image/gif"
              onChange={handleImageChange}
              className="text-foreground file:text-primary file:font-semibold file:mr-2 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:bg-primary/10 hover:file:bg-primary/20"
            />
            {imagePreview && (
              <div className="mt-2 rounded-md overflow-hidden border border-border aspect-[2/3] max-w-[150px] mx-auto">
                <Image src={imagePreview} alt="Image preview" width={150} height={225} style={{ objectFit: "cover" }} />
              </div>
            )}
             {!imageBase64 && (
              <div className="mt-2 rounded-md border border-dashed border-border aspect-[2/3] max-w-[150px] mx-auto flex flex-col items-center justify-center text-muted-foreground p-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 mb-2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M20.4 14.5L16 10 4 20"/></svg>
                <span className="text-xs text-center">Image Preview</span>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" onClick={handleSubmit} className="bg-primary hover:bg-accent">Add Card</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

