
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, Beef, Wheat, Droplet, Image } from "lucide-react";

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
  const getDietTagDisplay = (tag: string) => {
    const tagMap: { [key: string]: { label: string; color: string } } = {
      'vegano': { label: 'Vegano', color: 'bg-green-100 text-green-800 border-green-200' },
      'vegetariano': { label: 'Vegetariano', color: 'bg-green-100 text-green-800 border-green-200' },
      'low-carb': { label: 'Low Carb', color: 'bg-blue-100 text-blue-800 border-blue-200' },
      'sem-gluten': { label: 'Sem Glúten', color: 'bg-purple-100 text-purple-800 border-purple-200' },
      'sem-lactose': { label: 'Sem Lactose', color: 'bg-orange-100 text-orange-800 border-orange-200' },
      'keto': { label: 'Keto', color: 'bg-red-100 text-red-800 border-red-200' }
    };
    
    return tagMap[tag] || { label: tag, color: 'bg-gray-100 text-gray-800 border-gray-200' };
  };

  return (
    <Card className="dish-card overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-2 hover:border-primary/30 bg-white/95 backdrop-blur-sm shadow-lg" onClick={() => onViewDetails(dish)}>
      {/* Image Section - Enhanced */}
      <div className="relative h-52 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
        {dish.image_url ? (
          <img 
            src={dish.image_url} 
            alt={dish.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              // Show fallback when image fails to load
              const fallback = e.target.parentElement?.querySelector('.image-fallback');
              if (fallback) {
                (fallback as HTMLElement).style.display = 'flex';
              }
            }}
          />
        ) : null}
        
        {/* Fallback when no image or image fails */}
        {!dish.image_url && (
          <div className="absolute inset-0 flex items-center justify-center image-fallback">
            <div className="text-center">
              <Image className="w-12 h-12 mx-auto mb-2 text-slate-400" />
              <p className="text-xs text-slate-500">Sem imagem</p>
            </div>
          </div>
        )}
        
        {/* Fallback for failed images */}
        <div className="absolute inset-0 flex items-center justify-center image-fallback" style={{ display: 'none' }}>
          <div className="text-center">
            <Image className="w-12 h-12 mx-auto mb-2 text-slate-400" />
            <p className="text-xs text-slate-500">Erro na imagem</p>
          </div>
        </div>

        {/* Availability Badge */}
        {!dish.is_available && (
          <div className="absolute top-3 left-3">
            <Badge variant="destructive" className="text-xs">
              Indisponível
            </Badge>
          </div>
        )}
      </div>

      {/* Content Section - Enhanced */}
      <div className="p-5">
        {/* Price and Title Row */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-bold text-xl line-clamp-1 text-gray-900 flex-1 mr-3">
            {dish.name}
          </h3>
          <Badge className="bg-primary text-white font-bold text-sm px-3 py-1 shadow-lg border-0">
            R$ {dish.price.toFixed(2)}
          </Badge>
        </div>
        
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2 leading-relaxed">
          {dish.description}
        </p>

        {/* Nutritional Info - Enhanced */}
        {(dish.calories || dish.protein || dish.carbs || dish.fat) && (
          <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-slate-50/80 rounded-lg backdrop-blur-sm">
            {dish.calories && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Zap className="w-4 h-4 text-yellow-600" />
                  <span className="text-xs text-muted-foreground font-medium">kcal</span>
                </div>
                <div className="font-bold text-lg text-gray-900">{dish.calories}</div>
              </div>
            )}
            
            {dish.protein && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Beef className="w-4 h-4 text-red-600" />
                  <span className="text-xs text-muted-foreground font-medium">prot</span>
                </div>
                <div className="font-bold text-lg text-gray-900">{dish.protein}g</div>
              </div>
            )}
            
            {dish.carbs && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Wheat className="w-4 h-4 text-amber-600" />
                  <span className="text-xs text-muted-foreground font-medium">carb</span>
                </div>
                <div className="font-bold text-lg text-gray-900">{dish.carbs}g</div>
              </div>
            )}

            {dish.fat && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Droplet className="w-4 h-4 text-blue-600" />
                  <span className="text-xs text-muted-foreground font-medium">gordura</span>
                </div>
                <div className="font-bold text-lg text-gray-900">{dish.fat}g</div>
              </div>
            )}
          </div>
        )}

        {/* Diet Tags - Enhanced */}
        {dish.diet_tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {dish.diet_tags.slice(0, 3).map((tag) => {
              const tagDisplay = getDietTagDisplay(tag);
              return (
                <Badge 
                  key={tag} 
                  variant="outline" 
                  className={`text-xs font-medium border ${tagDisplay.color}`}
                >
                  {tagDisplay.label}
                </Badge>
              );
            })}
            {dish.diet_tags.length > 3 && (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                +{dish.diet_tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Action Button - Enhanced */}
        <Button 
          className="w-full font-semibold py-3 text-sm bg-primary hover:bg-primary/90 transition-colors"
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
