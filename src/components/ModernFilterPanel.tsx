
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { X, Zap, Beef, DollarSign, Heart } from "lucide-react";

interface ModernFilterPanelProps {
  availableDietTags: string[];
  availableTags: string[];
  selectedDietTags: string[];
  selectedTags: string[];
  priceRange: number[];
  calorieRange: number[];
  onDietTagsChange: (tags: string[]) => void;
  onTagsChange: (tags: string[]) => void;
  onPriceRangeChange: (range: number[]) => void;
  onCalorieRangeChange: (range: number[]) => void;
  onClearFilters: () => void;
  maxPrice: number;
  maxCalories: number;
}

const ModernFilterPanel = ({
  availableDietTags,
  availableTags,
  selectedDietTags,
  selectedTags,
  priceRange,
  onPriceRangeChange,
  calorieRange,
  onCalorieRangeChange,
  onDietTagsChange,
  onTagsChange,
  maxPrice,
  maxCalories,
  onClearFilters
}: ModernFilterPanelProps) => {
  const hasActiveFilters = selectedDietTags.length > 0 || 
    selectedTags.length > 0 ||
    priceRange[0] > 0 || priceRange[1] < maxPrice ||
    calorieRange[0] > 0 || calorieRange[1] < maxCalories;

  const toggleDietTag = (tag: string) => {
    if (selectedDietTags.includes(tag)) {
      onDietTagsChange(selectedDietTags.filter(t => t !== tag));
    } else {
      onDietTagsChange([...selectedDietTags, tag]);
    }
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const getDietTagDisplay = (tag: string) => {
    const tagMap: { [key: string]: { label: string; color: string } } = {
      'vegano': { label: 'Vegano', color: 'bg-green-100 text-green-800' },
      'vegetariano': { label: 'Vegetariano', color: 'bg-green-100 text-green-800' },
      'low-carb': { label: 'Low Carb', color: 'bg-blue-100 text-blue-800' },
      'sem-gluten': { label: 'Sem Glúten', color: 'bg-purple-100 text-purple-800' },
      'sem-lactose': { label: 'Sem Lactose', color: 'bg-orange-100 text-orange-800' },
      'keto': { label: 'Keto', color: 'bg-red-100 text-red-800' }
    };
    
    return tagMap[tag] || { label: tag, color: 'bg-gray-100 text-gray-800' };
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Heart className="w-5 h-5 text-primary" />
          Filtros
        </h3>
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={onClearFilters}>
            <X className="w-4 h-4 mr-2" />
            Limpar
          </Button>
        )}
      </div>

      {/* Dietary Preferences */}
      {availableDietTags.length > 0 && (
        <div>
          <h4 className="font-medium mb-3 text-sm">Preferências Alimentares</h4>
          <div className="flex flex-wrap gap-2">
            {availableDietTags.map((tag) => {
              const tagDisplay = getDietTagDisplay(tag);
              const isSelected = selectedDietTags.includes(tag);
              
              return (
                <Badge
                  key={tag}
                  variant={isSelected ? "default" : "outline"}
                  className={`cursor-pointer transition-colors ${
                    isSelected ? tagDisplay.color : 'hover:bg-accent'
                  }`}
                  onClick={() => toggleDietTag(tag)}
                >
                  {tagDisplay.label}
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* General Tags */}
      {availableTags.length > 0 && (
        <div>
          <h4 className="font-medium mb-3 text-sm">Características</h4>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer transition-colors hover:bg-accent"
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div>
        <h4 className="font-medium mb-3 text-sm flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-primary" />
          Faixa de Preço: R$ {priceRange[0]} - R$ {priceRange[1]}
        </h4>
        <Slider
          value={priceRange}
          onValueChange={onPriceRangeChange}
          max={maxPrice}
          min={0}
          step={5}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>R$ 0</span>
          <span>R$ {maxPrice}</span>
        </div>
      </div>

      {/* Calorie Range */}
      <div>
        <h4 className="font-medium mb-3 text-sm flex items-center gap-2">
          <Zap className="w-4 h-4 text-orange-500" />
          Máximo de Calorias: {calorieRange[1]} kcal
        </h4>
        <Slider
          value={calorieRange}
          onValueChange={onCalorieRangeChange}
          max={maxCalories}
          min={0}
          step={50}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>0 kcal</span>
          <span>{maxCalories} kcal</span>
        </div>
      </div>
    </Card>
  );
};

export default ModernFilterPanel;
