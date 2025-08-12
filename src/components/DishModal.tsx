
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Zap, Beef, Wheat, Droplet, Heart, X } from "lucide-react";

interface Dish {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  tags: string[];
  dietTags: string[];
  fullDescription: string;
}

interface DishModalProps {
  dish: Dish;
  isOpen: boolean;
  onClose: () => void;
}

const DishModal = ({ dish, isOpen, onClose }: DishModalProps) => {
  const getDietTagDisplay = (tag: string) => {
    const tagMap: { [key: string]: { label: string; color: string } } = {
      'vegano': { label: 'Vegano', color: 'bg-nutrition-100 text-nutrition-800' },
      'vegetariano': { label: 'Vegetariano', color: 'bg-nutrition-100 text-nutrition-800' },
      'low-carb': { label: 'Low Carb', color: 'bg-appetite-100 text-appetite-800' },
      'sem-gluten': { label: 'Sem Glúten', color: 'bg-blue-100 text-blue-800' },
      'sem-lactose': { label: 'Sem Lactose', color: 'bg-purple-100 text-purple-800' },
      'keto': { label: 'Keto', color: 'bg-orange-100 text-orange-800' }
    };
    
    return tagMap[tag] || { label: tag, color: 'bg-gray-100 text-gray-800' };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-0">
        {/* Header Image */}
        <div className="relative h-48 bg-gradient-to-br from-appetite-100 to-nutrition-100">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-8xl opacity-30">🍽️</div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute top-3 right-3 bg-white/90 hover:bg-white"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
          <div className="absolute bottom-3 left-3">
            <div className="text-3xl font-bold text-white bg-black/20 px-3 py-1 rounded-lg backdrop-blur-sm">
              R$ {dish.price.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Title and Description */}
          <DialogHeader className="text-left mb-4">
            <DialogTitle className="text-xl font-bold mb-2">
              {dish.name}
            </DialogTitle>
            <p className="text-muted-foreground leading-relaxed">
              {dish.fullDescription}
            </p>
          </DialogHeader>

          {/* Diet Tags */}
          {dish.dietTags.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold mb-2 text-sm">Adequado para:</h4>
              <div className="flex flex-wrap gap-2">
                {dish.dietTags.map((tag) => {
                  const tagDisplay = getDietTagDisplay(tag);
                  return (
                    <Badge 
                      key={tag} 
                      className={`${tagDisplay.color} border-0`}
                    >
                      {tagDisplay.label}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Nutritional Information */}
          <div className="mb-6">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Heart className="w-4 h-4 text-nutrition-600" />
              Informações Nutricionais
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-appetite-600" />
                  <span className="text-sm font-medium">Calorias</span>
                </div>
                <div className="text-lg font-bold text-appetite-600">
                  {dish.calories} <span className="text-sm text-muted-foreground">kcal</span>
                </div>
              </Card>

              <Card className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Beef className="w-4 h-4 text-nutrition-600" />
                  <span className="text-sm font-medium">Proteína</span>
                </div>
                <div className="text-lg font-bold text-nutrition-600">
                  {dish.protein} <span className="text-sm text-muted-foreground">g</span>
                </div>
              </Card>

              <Card className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Wheat className="w-4 h-4 text-appetite-600" />
                  <span className="text-sm font-medium">Carboidratos</span>
                </div>
                <div className="text-lg font-bold text-appetite-600">
                  {dish.carbs} <span className="text-sm text-muted-foreground">g</span>
                </div>
              </Card>

              <Card className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Droplet className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">Gorduras</span>
                </div>
                <div className="text-lg font-bold text-blue-600">
                  {dish.fat} <span className="text-sm text-muted-foreground">g</span>
                </div>
              </Card>
            </div>
          </div>

          {/* Additional Tags */}
          {dish.tags.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold mb-2 text-sm">Características:</h4>
              <div className="flex flex-wrap gap-2">
                {dish.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Action Button */}
          <Button className="btn-hero w-full" size="lg">
            Solicitar ao Garçom
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DishModal;
