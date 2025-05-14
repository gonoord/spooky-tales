import { Button } from "@/components/ui/button";
import { SkipForward, Shuffle, Sparkles } from "lucide-react";

type CardControlsProps = {
  onNext: () => void;
  onShuffle: () => void;
  onGetStoryStarter: () => void;
  isAILoading: boolean;
  canGetStory: boolean; // To disable AI button if no card is present
};

export default function CardControls({ onNext, onShuffle, onGetStoryStarter, isAILoading, canGetStory }: CardControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
      <Button onClick={onShuffle} variant="outline" size="lg" aria-label="Shuffle cards">
        <Shuffle className="mr-2 h-5 w-5" />
        Shuffle
      </Button>
      <Button onClick={onNext} variant="default" size="lg" className="bg-primary hover:bg-accent" aria-label="Next card">
        Next Card
        <SkipForward className="ml-2 h-5 w-5" />
      </Button>
      <Button 
        onClick={onGetStoryStarter} 
        variant="outline" 
        size="lg" 
        disabled={isAILoading || !canGetStory} 
        className="border-primary text-primary hover:bg-primary/10 disabled:opacity-70"
        aria-label="Get AI story starter"
      >
        {isAILoading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2"></div>
        ) : (
          <Sparkles className="mr-2 h-5 w-5" />
        )}
        {isAILoading ? "Conjuring..." : "Story Starter"}
      </Button>
    </div>
  );
}
