
import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';

type StoryCardDisplayProps = {
  imageUrl: string;
  phrase: string;
  imageHint: string;
  className?: string;
  isGeneratingImage?: boolean;
};

export default function StoryCardDisplay({ imageUrl, phrase, imageHint, className, isGeneratingImage }: StoryCardDisplayProps) {
  return (
    <Card
      className={`w-full max-w-sm mx-auto bg-card shadow-xl overflow-hidden animate-in fade-in-0 duration-700 relative ${className}`}
      aria-label={`Story card with phrase: ${phrase}`}
    >
      {isGeneratingImage && (
        <div className="absolute inset-0 bg-card/80 backdrop-blur-sm flex items-center justify-center z-20">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      )}
      <CardContent className="p-0">
        <div className="aspect-[2/3] relative">
          <Image
            src={imageUrl}
            alt={imageHint || `Image for: ${phrase}`}
            fill
            style={{ objectFit: 'cover' }}
            data-ai-hint={imageHint}
            className="transition-transform duration-300 ease-in-out group-hover:scale-105"
            priority 
            sizes="(max-width: 640px) 100vw, 384px" // Adjusted based on max-w-sm
          />
        </div>
        <div className="p-6 bg-card/80 backdrop-blur-sm absolute bottom-0 left-0 right-0 z-10">
          <p className="text-2xl font-gothic text-center text-foreground leading-tight">
            {phrase}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
