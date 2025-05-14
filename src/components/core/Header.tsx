import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

type HeaderProps = {
  onAddCardClick: () => void;
};

export default function Header({ onAddCardClick }: HeaderProps) {
  return (
    <header className="py-6 px-4 md:px-8 flex justify-between items-center border-b border-border">
      <h1 className="text-3xl md:text-4xl font-bold font-gothic text-primary">Spooky Tales Prompt</h1>
      <Button onClick={onAddCardClick} variant="outline" className="border-primary text-primary hover:bg-primary/10">
        <PlusCircle className="mr-2 h-5 w-5" />
        Add New Card
      </Button>
    </header>
  );
}
