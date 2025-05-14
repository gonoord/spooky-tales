import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card";

type StoryCardDisplayProps = {
  imageUrl: string;
  phrase: string;
  imageHint: string;
  className?: string;
};

export default function StoryCardDisplay({ imageUrl, phrase, imageHint, className }: StoryCardDisplayProps) {
  return (
    <Card
      className={`w-full max-w-sm mx-auto bg-card shadow-xl overflow-hidden animate-in fade-in-0 duration-700 ${className}`}
      aria-label={`Story card with phrase: ${phrase}`}
    >
      <CardContent className="p-0">
        <div className="aspect-[2/3] relative">
          <Image
            src={imageUrl}
            alt={imageHint || `Image for: ${phrase}`}
            fill
            style={{ objectFit: 'cover' }}
            data-ai-hint={imageHint}
            className="transition-transform duration-300 ease-in-out group-hover:scale-105"
            priority // For LCP element
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Example sizes, adjust as needed
          />
        </div>
        <div className="p-6 bg-card/80 backdrop-blur-sm">
          <p className="text-2xl font-gothic text-center text-foreground leading-tight">
            {phrase}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
