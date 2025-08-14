
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Zap, Beef, Wheat, Droplet, Heart, X } from "lucide-react";

interface Dish {
  id: string;
  name: string;
  description: string;
  full_description: string;
  price: number;
  image_url?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  tags: string[];
  diet_tags: string[];
  is_available: boolean;
}

interface DishModalProps {
  dish: Dish | null;
  isOpen: boolean;
  onClose: () => void;
}

const DishModal = ({ dish, isOpen, onClose }: DishModalProps) => {
  if (!dish) return null;

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
        <div className="relative h-48 bg-gradient-to-br from-primary/20 to-secondary/20">
          {dish.image_url ? (
            <img 
              src={dish.image_url} 
              alt={dish.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-8xl opacity-30">🍽️</div>
            </div>
          )}
          {/* Price Badge - Moved to top right for better visibility */}
          <div className="absolute top-3 right-3">
            <div className="text-2xl font-bold text-white bg-black/30 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/20 shadow-lg">
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
              {dish.full_description || dish.description}
            </p>
          </DialogHeader>

          {/* Diet Tags */}
          {dish.diet_tags.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold mb-2 text-sm">Adequado para:</h4>
              <div className="flex flex-wrap gap-2">
                {dish.diet_tags.map((tag) => {
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
          {(dish.calories || dish.protein || dish.carbs || dish.fat) && (
            <div className="mb-6">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Heart className="w-4 h-4 text-primary" />
                Informações Nutricionais
              </h4>
              
              <div className="grid grid-cols-2 gap-3">
                {dish.calories && (
                  <Card className="p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Calorias</span>
                    </div>
                    <div className="text-lg font-bold text-primary">
                      {dish.calories} <span className="text-sm text-muted-foreground">kcal</span>
                    </div>
                  </Card>
                )}

                {dish.protein && (
                  <Card className="p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Beef className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Proteína</span>
                    </div>
                    <div className="text-lg font-bold text-primary">
                      {dish.protein} <span className="text-sm text-muted-foreground">g</span>
                    </div>
                  </Card>
                )}

                {dish.carbs && (
                  <Card className="p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Wheat className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Carboidratos</span>
                    </div>
                    <div className="text-lg font-bold text-primary">
                      {dish.carbs} <span className="text-sm text-muted-foreground">g</span>
                    </div>
                  </Card>
                )}

                {dish.fat && (
                  <Card className="p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Droplet className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">Gorduras</span>
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      {dish.fat} <span className="text-sm text-muted-foreground">g</span>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          )}

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
          <Button className="w-full" size="lg">
            Solicitar ao Garçom
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DishModal;
