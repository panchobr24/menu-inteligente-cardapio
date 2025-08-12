
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { X, Zap, Beef, DollarSign, Heart } from "lucide-react";

interface DietFilter {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
}

interface ModernFilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  dietFilters: DietFilter[];
  selectedDietFilters: string[];
  onToggleDietFilter: (filterId: string) => void;
  priceRange: number[];
  onPriceRangeChange: (value: number[]) => void;
  calorieRange: number[];
  onCalorieRangeChange: (value: number[]) => void;
  proteinRange: number[];
  onProteinRangeChange: (value: number[]) => void;
  maxPrice: number;
  maxCalories: number;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

const ModernFilterPanel = ({
  isOpen,
  onClose,
  dietFilters,
  selectedDietFilters,
  onToggleDietFilter,
  priceRange,
  onPriceRangeChange,
  calorieRange,
  onCalorieRangeChange,
  proteinRange,
  onProteinRangeChange,
  maxPrice,
  maxCalories,
  onApplyFilters,
  onClearFilters
}: ModernFilterPanelProps) => {
  const hasActiveFilters = selectedDietFilters.length > 0 || 
    priceRange[0] < maxPrice || 
    calorieRange[0] < maxCalories || 
    proteinRange[0] > 0;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
        <SheetHeader className="text-left">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl font-bold">Filtros Inteligentes</SheetTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-muted-foreground">
            Encontre exatamente o que você está procurando
          </p>
        </SheetHeader>

        <div className="space-y-8 py-6">
          {/* Dietary Preferences */}
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg">
              <Heart className="w-5 h-5 text-primary" />
              Preferências Alimentares
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {dietFilters.map((filter) => {
                const Icon = filter.icon;
                const isSelected = selectedDietFilters.includes(filter.id);
                
                return (
                  <Button
                    key={filter.id}
                    variant="outline"
                    className={`p-4 h-auto flex flex-col gap-3 transition-all ${
                      isSelected 
                        ? 'bg-primary text-primary-foreground border-primary shadow-md' 
                        : 'hover:bg-accent/50 hover:border-primary/30'
                    }`}
                    onClick={() => onToggleDietFilter(filter.id)}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-sm font-medium">{filter.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg">
              <DollarSign className="w-5 h-5 text-primary" />
              Faixa de Preço
            </h3>
            
            <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10">
              <div className="mb-4">
                <span className="text-3xl font-bold text-primary">
                  R$ {priceRange[0].toFixed(2)}
                </span>
                <span className="text-muted-foreground ml-2">máximo</span>
              </div>
              <Slider
                value={priceRange}
                onValueChange={onPriceRangeChange}
                max={maxPrice}
                min={0}
                step={5}
                className="slider-primary"
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span>R$ 0</span>
                <span>R$ {maxPrice.toFixed(2)}</span>
              </div>
            </Card>
          </div>

          {/* Nutritional Goals */}
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg">
              <Zap className="w-5 h-5 text-primary" />
              Metas Nutricionais
            </h3>
            
            <div className="space-y-6">
              {/* Calories */}
              <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-5 h-5 text-orange-600" />
                  <span className="font-medium">Máximo de Calorias</span>
                </div>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-orange-600">
                    {calorieRange[0]}
                  </span>
                  <span className="text-muted-foreground ml-2">kcal</span>
                </div>
                <Slider
                  value={calorieRange}
                  onValueChange={onCalorieRangeChange}
                  max={maxCalories}
                  min={0}
                  step={50}
                  className="slider-orange"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-2">
                  <span>0 kcal</span>
                  <span>{maxCalories} kcal</span>
                </div>
              </Card>

              {/* Protein */}
              <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100">
                <div className="flex items-center gap-2 mb-3">
                  <Beef className="w-5 h-5 text-green-600" />
                  <span className="font-medium">Mínimo de Proteína</span>
                </div>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-green-600">
                    {proteinRange[0]}
                  </span>
                  <span className="text-muted-foreground ml-2">g</span>
                </div>
                <Slider
                  value={proteinRange}
                  onValueChange={onProteinRangeChange}
                  max={80}
                  min={0}
                  step={5}
                  className="slider-green"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-2">
                  <span>0g</span>
                  <span>80g</span>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-6 border-t bg-white sticky bottom-0">
          {hasActiveFilters && (
            <Button variant="outline" onClick={onClearFilters} className="flex-1">
              Limpar Filtros
            </Button>
          )}
          <Button onClick={onApplyFilters} className="flex-1 bg-primary hover:bg-primary/90">
            Aplicar Filtros
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ModernFilterPanel;
