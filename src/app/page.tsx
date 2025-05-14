
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

const initialCardsData: StoryCardData[] = [
  { id: '1', imageUrl: 'https://placehold.co/400x600/101218/e0e0e0.png', phrase: 'Whispering Shadows', imageHint: 'dark forest' },
  { id: '2', imageUrl: 'https://placehold.co/400x600/121015/d0d0d0.png', phrase: 'The Attic Door Creaks', imageHint: 'attic door' },
  { id: '3', imageUrl: 'https://placehold.co/400x600/0f1412/f0f0f0.png', phrase: 'Eyes in the Dark Mirror', imageHint: 'glowing eyes' },
  { id: '4', imageUrl: 'https://placehold.co/400x600/181010/e5e5e5.png', phrase: 'Forgotten Lullaby', imageHint: 'music box' },
  { id: '5', imageUrl: 'https://placehold.co/400x600/131313/cccccc.png', phrase: 'The Scarecrow Smiles', imageHint: 'eerie scarecrow' },
];

const CARDS_STORAGE_KEY = "spookyTalesCards";

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
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  useEffect(() => {
    const storedCardsRaw = localStorage.getItem(CARDS_STORAGE_KEY);
    let loadedCards: StoryCardData[];
    if (storedCardsRaw) {
      try {
        loadedCards = JSON.parse(storedCardsRaw);
         if (!Array.isArray(loadedCards) || loadedCards.length === 0) {
          loadedCards = initialCardsData;
        }
      } catch (error) {
        console.error("Failed to parse cards from localStorage", error);
        loadedCards = initialCardsData;
      }
    } else {
      loadedCards = initialCardsData;
    }
    setCards(shuffleArray(loadedCards));
    setCurrentIndex(0);
    setIsMounted(true);
  }, []);

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
  }, [cards, toast]); // generateImageForCardAtIndex depends on `cards` to correctly map and update

  useEffect(() => {
    if (!isMounted || cards.length === 0 || currentIndex >= cards.length || isGeneratingCardImage) {
      return;
    }
    const currentCard = cards[currentIndex];
    if (currentCard && currentCard.imageUrl.startsWith('https://placehold.co')) {
      generateImageForCardAtIndex(currentIndex);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, isMounted, cards, generateImageForCardAtIndex]); // Added generateImageForCardAtIndex, isGeneratingCardImage to deps

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
  }, [cards.length, toast]);

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
    setCards((prevCards) => {
      const updatedCards = [newCard, ...prevCards]; 
      return updatedCards;
    });
    setCurrentIndex(0); 
    setStoryStarter(null);
    // Image for new card will be generated if it's a placeholder when it becomes current.
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
