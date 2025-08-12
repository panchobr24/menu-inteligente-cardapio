
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, Beef, Wheat } from "lucide-react";

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
}

interface DishCardProps {
  dish: Dish;
  onClick: () => void;
}

const DishCard = ({ dish, onClick }: DishCardProps) => {
  return (
    <Card className="dish-card overflow-hidden" onClick={onClick}>
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-appetite-100 to-nutrition-100">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-6xl opacity-20">🍽️</div>
        </div>
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
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap className="w-3 h-3 text-appetite-600" />
              <span className="text-xs text-muted-foreground">kcal</span>
            </div>
            <div className="font-semibold text-sm">{dish.calories}</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Beef className="w-3 h-3 text-nutrition-600" />
              <span className="text-xs text-muted-foreground">prot</span>
            </div>
            <div className="font-semibold text-sm">{dish.protein}g</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Wheat className="w-3 h-3 text-appetite-600" />
              <span className="text-xs text-muted-foreground">carb</span>
            </div>
            <div className="font-semibold text-sm">{dish.carbs}g</div>
          </div>
        </div>

        {/* Diet Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {dish.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {dish.tags.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{dish.tags.length - 2}
            </Badge>
          )}
        </div>

        {/* Action Button */}
        <Button 
          variant="outline" 
          className="w-full text-sm hover:bg-accent hover:text-accent-foreground"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          Ver detalhes
        </Button>
      </div>
    </Card>
  );
};

export default DishCard;
