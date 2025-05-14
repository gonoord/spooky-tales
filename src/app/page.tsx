
"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "@/components/core/Header";
import StoryCardDisplay from "@/components/core/StoryCardDisplay";
import CardControls from "@/components/core/CardControls";
import AddCardDialog from "@/components/core/AddCardDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateStoryStarter } from "@/ai/flows/generate-story-starter";
import { generateCardImage } from "@/ai/flows/generate-card-image";
import type { StoryCardData } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const phrases: string[] = [
  "Footsteps in the void", "The old clock chimed thirteen", "A whisper from the well",
  "The doll's eyes followed", "Rustling in the cornfield", "A face in the window",
  "The locked room upstairs", "Shadows danced alone", "A forgotten grave",
  "The last train's whistle", "Chills down the spine", "The forest path beckons",
  "An ancient, dusty tome", "The mirror showed too much", "A sudden, cold breeze",
  "Unseen hands touched", "The attic's secrets", "A child's eerie laughter",
  "The road less traveled", "Deep in the woods", "The creaking floorboards",
  "A single, black feather", "The flickering gaslight", "Something under the bed",
  "The abandoned asylum", "A distant, mournful song", "The scarecrow moved",
  "A cryptic message", "The swamp's strange glow", "Through the keyhole",
  "The painting watched", "Echoes in the silence", "The grandfather clock stopped",
  "A lone wolf howled", "The cellar door creaked", "Mysterious fog rolled in",
  "A strange, old photograph", "The hidden passage", "Knocking from inside walls",
  "The spectral figure", "A broken music box", "The seaside cave",
  "Whispers in the library", "The moon turned blood red", "A lonely lighthouse beam",
  "The haunted carnival", "Footprints in the dust", "The silent telephone rang",
  "An old, gnarled tree", "The empty swing set"
];

const imageHints: string[] = [
  "empty void", "old clock", "deep well", "creepy doll", "corn field", "window face",
  "locked door", "dancing shadows", "old grave", "ghost train", "icy chill", "forest path",
  "ancient book", "dark mirror", "cold wind", "ghostly touch", "attic cobwebs", "eerie child",
  "hidden road", "deep woods", "creaking floor", "black feather", "gas lamp", "under bed",
  "old asylum", "mournful song", "moving scarecrow", "cryptic note", "swamp glow", "key hole",
  "watching painting", "empty echo", "stopped clock", "howling wolf", "cellar door", "thick fog",
  "old photo", "secret passage", "wall knocking", "spectral form", "music box", "sea cave",
  "dusty library", "blood moon", "lighthouse beam", "haunted fair", "dusty prints", "ringing phone",
  "gnarled tree", "empty swing"
];

const generateInitialCards = (count: number): StoryCardData[] => {
  const cards: StoryCardData[] = [];
  const usedPhrases = new Set<string>();
  const usedImageHints = new Set<string>();

  for (let i = 0; i < count; i++) {
    let phrase = phrases[i % phrases.length];
    let hint = imageHints[i % imageHints.length];
    let attempt = 0;

    // Ensure unique enough phrases/hints if lists are shorter than count
    while ((usedPhrases.has(phrase) || usedImageHints.has(hint)) && attempt < phrases.length) {
        phrase = phrases[(i + attempt) % phrases.length];
        hint = imageHints[(i + attempt) % imageHints.length];
        attempt++;
    }
    usedPhrases.add(phrase);
    usedImageHints.add(hint);
    
    // Ensure imageHint is two words max
    const hintWords = hint.split(" ");
    const finalHint = hintWords.slice(0, 2).join(" ");

    cards.push({
      id: String(i + 1),
      imageUrl: `https://placehold.co/400x600.png`, // Standard placeholder
      phrase: phrase,
      imageHint: finalHint,
    });
  }
  return cards;
};


const initialCardsData: StoryCardData[] = generateInitialCards(50);

const CARDS_STORAGE_KEY = "spookyTalesCards_v2"; // Changed key to ensure users get new set

export default function HomePage() {
  const [cards, setCards] = useState<StoryCardData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [storyStarter, setStoryStarter] = useState<string | null>(null);
  const [isLoadingAIStory, setIsLoadingAIStory] = useState(false);
  const [isGeneratingCardImage, setIsGeneratingCardImage] = useState(false);
  const [isAddCardDialogOpen, setIsAddCardDialogOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      // Ensure Math.random is only called client-side
      const j = isMounted ? Math.floor(Math.random() * (i + 1)) : 0;
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };
  
  useEffect(() => {
    setIsMounted(true);
    const storedCardsRaw = localStorage.getItem(CARDS_STORAGE_KEY);
    let loadedCards: StoryCardData[];
    if (storedCardsRaw) {
      try {
        loadedCards = JSON.parse(storedCardsRaw);
         if (!Array.isArray(loadedCards) || loadedCards.length === 0) {
          loadedCards = initialCardsData; // Fallback to new initial data
        }
      } catch (error) {
        console.error("Failed to parse cards from localStorage", error);
        loadedCards = initialCardsData; // Fallback to new initial data
      }
    } else {
      loadedCards = initialCardsData; // New users get the 50 cards
    }
    // Shuffle on initial load
    setCards(shuffleArray(loadedCards));
    setCurrentIndex(0);
  }, []); // isMounted will be set after this effect, shuffleArray check for isMounted prevents SSR Math.random

  useEffect(() => {
    if (isMounted && cards.length > 0) {
      localStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(cards));
    }
  }, [cards, isMounted]);

  const generateImageForCardAtIndex = useCallback(async (index: number) => {
    if (index < 0 || index >= cards.length) return;
    const cardToUpdate = cards[index];

    if (!cardToUpdate.imageUrl.startsWith('https://placehold.co')) {
      return; // Already has a generated or uploaded image
    }

    setIsGeneratingCardImage(true);
    try {
      const result = await generateCardImage({ imageHint: cardToUpdate.imageHint });
      const updatedCards = cards.map((card, i) =>
        i === index ? { ...card, imageUrl: result.imageDataUri } : card
      );
      setCards(updatedCards);
    } catch (error) {
      console.error("Error generating card image:", error);
      toast({
        title: "Card Image Error",
        description: "Could not generate an image for the card. Placeholder will be used.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingCardImage(false);
    }
  }, [cards, toast]); 

  useEffect(() => {
    if (!isMounted || cards.length === 0 || currentIndex >= cards.length || isGeneratingCardImage) {
      return;
    }
    const currentCard = cards[currentIndex];
    if (currentCard && currentCard.imageUrl.startsWith('https://placehold.co')) {
      generateImageForCardAtIndex(currentIndex);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, isMounted, cards.length, generateImageForCardAtIndex]); // Removed 'cards' from deps, added cards.length

  const handleNextCard = useCallback(() => {
    if (cards.length === 0) return;
    setStoryStarter(null); 
    setCurrentIndex((prevIndex) => (prevIndex + 1) % cards.length);
  }, [cards.length]);

  const handleShuffleCards = useCallback(() => {
    if (cards.length === 0) return;
    setCards((prevCards) => shuffleArray(prevCards));
    setCurrentIndex(0);
    setStoryStarter(null);
    toast({ title: "Deck Shuffled", description: "The cards have been reordered." });
  }, [cards.length, toast, shuffleArray]); // Added shuffleArray to deps

  const handleGetStoryStarter = useCallback(async () => {
    if (cards.length === 0 || currentIndex >= cards.length) return;

    const currentCard = cards[currentIndex];
    setIsLoadingAIStory(true);
    setStoryStarter(null);

    try {
      let imageBase64 = currentCard.imageUrl;
      if (currentCard.imageUrl.startsWith('http') && !currentCard.imageUrl.startsWith('data:')) { // Check if it's a remote URL and not already a data URI
        const response = await fetch(currentCard.imageUrl);
        if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
        const blob = await response.blob();
        imageBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(blob);
        });
      }
      
      const result = await generateStoryStarter({
        image: imageBase64,
        phrase: currentCard.phrase,
      });
      setStoryStarter(result.storyStarter);
    } catch (error) {
      console.error("Error generating story starter:", error);
      toast({
        title: "AI Story Error",
        description: "Could not generate a story starter. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAIStory(false);
    }
  }, [cards, currentIndex, toast]);

  const handleAddCard = (newCard: StoryCardData) => {
    const uniqueNewCard = { ...newCard, id: Date.now().toString() + Math.random().toString(36).substring(2,9) };
    setCards((prevCards) => {
        const updatedCards = [uniqueNewCard, ...prevCards]; 
        return updatedCards;
    });
    setCurrentIndex(0); 
    setStoryStarter(null);
    // Image for new card will be generated if it's a placeholder when it becomes current.
    // The new card is now at index 0, so the image generation useEffect for currentIndex will trigger for it.
  };

  if (!isMounted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <p className="text-xl font-gothic">Summoning Spooky Tales...</p>
      </div>
    );
  }
  
  const currentCard = cards.length > 0 ? cards[currentIndex] : null;
  const showImageGenerationLoader = !!currentCard && currentCard.imageUrl.startsWith('https://placehold.co') && isGeneratingCardImage;


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header onAddCardClick={() => setIsAddCardDialogOpen(true)} />
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center">
        {currentCard ? (
          <StoryCardDisplay
            key={currentCard.id} 
            imageUrl={currentCard.imageUrl}
            phrase={currentCard.phrase}
            imageHint={currentCard.imageHint}
            isGeneratingImage={showImageGenerationLoader}
          />
        ) : (
          <Card className="w-full max-w-sm mx-auto bg-card shadow-xl flex flex-col items-center justify-center aspect-[2/3]">
            <CardContent className="text-center p-6">
              <h2 className="text-2xl font-gothic text-muted-foreground">No Cards in Deck</h2>
              <p className="text-muted-foreground mt-2">Add some cards to begin your spooky tale!</p>
              <Button onClick={() => setIsAddCardDialogOpen(true)} className="mt-4">Add Card</Button>
            </CardContent>
          </Card>
        )}

        <CardControls
          onNext={handleNextCard}
          onShuffle={handleShuffleCards}
          onGetStoryStarter={handleGetStoryStarter}
          isAILoading={isLoadingAIStory || isGeneratingCardImage} // Combine loading states for AI button
          canGetStory={!!currentCard}
        />

        {storyStarter && (
          <Card className="mt-8 w-full max-w-xl mx-auto bg-card shadow-lg animate-in fade-in-0 duration-500">
            <CardHeader>
              <CardTitle className="font-gothic text-primary text-2xl">Story Starter</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-foreground whitespace-pre-line leading-relaxed">{storyStarter}</p>
            </CardContent>
          </Card>
        )}
      </main>
      <footer className="text-center py-4 border-t border-border text-sm text-muted-foreground">
        © {new Date().getFullYear()} Spooky Tales Prompt. All rights reserved.
      </footer>
      <AddCardDialog
        isOpen={isAddCardDialogOpen}
        onOpenChange={setIsAddCardDialogOpen}
        onAddCard={handleAddCard}
      />
    </div>
  );
}

