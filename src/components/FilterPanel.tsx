
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { X, Zap, Beef, Wheat } from "lucide-react";

interface DietFilter {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
}

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  dietFilters: DietFilter[];
  selectedDietFilters: string[];
  onToggleDietFilter: (filterId: string) => void;
  calorieLimit: number[];
  onCalorieLimitChange: (value: number[]) => void;
  minProtein: number[];
  onMinProteinChange: (value: number[]) => void;
  maxCarbs: number[];
  onMaxCarbsChange: (value: number[]) => void;
  onApplyFilters: () => void;
}

const FilterPanel = ({
  isOpen,
  onClose,
  dietFilters,
  selectedDietFilters,
  onToggleDietFilter,
  calorieLimit,
  onCalorieLimitChange,
  minProtein,
  onMinProteinChange,
  maxCarbs,
  onMaxCarbsChange,
  onApplyFilters
}: FilterPanelProps) => {
  const clearAllFilters = () => {
    selectedDietFilters.forEach(filterId => onToggleDietFilter(filterId));
    onCalorieLimitChange([800]);
    onMinProteinChange([0]);
    onMaxCarbsChange([100]);
  };

  const hasActiveFilters = selectedDietFilters.length > 0 || 
    calorieLimit[0] < 800 || 
    minProtein[0] > 0 || 
    maxCarbs[0] < 100;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
        <SheetHeader className="text-left">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-bold">Busca Inteligente</SheetTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-muted-foreground">
            Configure suas preferências para encontrar pratos ideais
          </p>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Dietary Preferences */}
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              🥗 Preferências Alimentares
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {dietFilters.map((filter) => {
                const Icon = filter.icon;
                const isSelected = selectedDietFilters.includes(filter.id);
                
                return (
                  <Button
                    key={filter.id}
                    variant="outline"
                    className={`p-4 h-auto flex flex-col gap-2 ${
                      isSelected 
                        ? 'bg-accent text-accent-foreground border-accent' 
                        : 'hover:bg-accent/10'
                    }`}
                    onClick={() => onToggleDietFilter(filter.id)}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{filter.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Nutritional Goals */}
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              🎯 Metas Nutricionais
            </h3>
            
            <div className="space-y-6">
              {/* Calories */}
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-5 h-5 text-appetite-600" />
                  <span className="font-medium">Máximo de Calorias</span>
                </div>
                <div className="mb-2">
                  <span className="text-2xl font-bold text-appetite-600">
                    {calorieLimit[0]}
                  </span>
                  <span className="text-muted-foreground ml-1">kcal</span>
                </div>
                <Slider
                  value={calorieLimit}
                  onValueChange={onCalorieLimitChange}
                  max={1200}
                  min={200}
                  step={50}
                  className="slider-track"
                />
              </Card>

              {/* Protein */}
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Beef className="w-5 h-5 text-nutrition-600" />
                  <span className="font-medium">Mínimo de Proteína</span>
                </div>
                <div className="mb-2">
                  <span className="text-2xl font-bold text-nutrition-600">
                    {minProtein[0]}
                  </span>
                  <span className="text-muted-foreground ml-1">g</span>
                </div>
                <Slider
                  value={minProtein}
                  onValueChange={onMinProteinChange}
                  max={60}
                  min={0}
                  step={5}
                  className="slider-track"
                />
              </Card>

              {/* Carbs */}
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Wheat className="w-5 h-5 text-appetite-600" />
                  <span className="font-medium">Máximo de Carboidratos</span>
                </div>
                <div className="mb-2">
                  <span className="text-2xl font-bold text-appetite-600">
                    {maxCarbs[0]}
                  </span>
                  <span className="text-muted-foreground ml-1">g</span>
                </div>
                <Slider
                  value={maxCarbs}
                  onValueChange={onMaxCarbsChange}
                  max={100}
                  min={5}
                  step={5}
                  className="slider-track"
                />
              </Card>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearAllFilters} className="flex-1">
              Limpar Filtros
            </Button>
          )}
          <Button onClick={onApplyFilters} className="btn-nutrition flex-1">
            Aplicar Filtros
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default FilterPanel;
