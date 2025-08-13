
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, Beef, Wheat } from "lucide-react";

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

interface DishCardProps {
  dish: Dish;
  onViewDetails: (dish: Dish) => void;
}

const DishCard = ({ dish, onViewDetails }: DishCardProps) => {
  return (
    <Card className="dish-card overflow-hidden cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onViewDetails(dish)}>
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200">
        {dish.image_url ? (
          <img 
            src={dish.image_url} 
            alt={dish.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl opacity-20">🍽️</div>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Badge className="bg-white/90 text-foreground hover:bg-white">
            R$ {dish.price.toFixed(2)}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">
          {dish.name}
        </h3>
        
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
          {dish.description}
        </p>

        {/* Nutritional Info */}
        {(dish.calories || dish.protein || dish.carbs) && (
          <div className="grid grid-cols-3 gap-2 mb-3">
            {dish.calories && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Zap className="w-3 h-3 text-primary" />
                  <span className="text-xs text-muted-foreground">kcal</span>
                </div>
                <div className="font-semibold text-sm">{dish.calories}</div>
              </div>
            )}
            
            {dish.protein && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Beef className="w-3 h-3 text-primary" />
                  <span className="text-xs text-muted-foreground">prot</span>
                </div>
                <div className="font-semibold text-sm">{dish.protein}g</div>
              </div>
            )}
            
            {dish.carbs && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Wheat className="w-3 h-3 text-primary" />
                  <span className="text-xs text-muted-foreground">carb</span>
                </div>
                <div className="font-semibold text-sm">{dish.carbs}g</div>
              </div>
            )}
          </div>
        )}

        {/* Diet Tags */}
        {dish.diet_tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {dish.diet_tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {dish.diet_tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{dish.diet_tags.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Action Button */}
        <Button 
          variant="outline" 
          className="w-full text-sm hover:bg-accent hover:text-accent-foreground"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(dish);
          }}
        >
          Ver detalhes
        </Button>
      </div>
    </Card>
  );
};

export default DishCard;
