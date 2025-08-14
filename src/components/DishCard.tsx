
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Zap, Beef, Wheat, Droplet } from "lucide-react";

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
  cardBackgroundColor?: string;
  cardSize?: string;
  fontFamily?: string;
}

const DishCard = ({ dish, onViewDetails, cardBackgroundColor, cardSize, fontFamily }: DishCardProps) => {
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

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    // Check if clicked element or its parent is a button
    if (target.closest('button')) {
      return;
    }
    onViewDetails(dish);
  };

  const cardStyle = {
    backgroundColor: cardBackgroundColor || undefined,
    fontFamily: fontFamily ? `${fontFamily}, sans-serif` : undefined,
  };
  
  const isLarge = cardSize === 'large';
  const isSmall = cardSize === 'small';

  // Ajustar largura máxima baseado no tamanho do card
  const getCardMaxWidth = () => {
    if (isLarge) return 'max-w-none w-full'; // Ocupa toda a largura disponível
    if (isSmall) return 'max-w-sm w-full'; // Largura pequena mas consistente
    return 'max-w-md w-full'; // Largura média
  };

  return (
    <Card 
      className={`group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 hover:border-primary/30 bg-white/95 backdrop-blur-sm ${getCardMaxWidth()} ${
        isLarge ? 'p-6' : isSmall ? 'p-3' : 'p-4'
      }`}
      style={cardStyle}
      onClick={handleCardClick}
    >
      <div className={`${isLarge ? 'flex gap-6' : 'space-y-4'}`}>
        {/* Image */}
        <div className={`relative overflow-hidden rounded-xl ${
          isLarge ? 'w-64 h-48 flex-shrink-0' : 
          isSmall ? 'h-32' : 'h-48'
        } bg-gradient-to-br from-primary/10 to-secondary/10`}>
          {dish.image_url ? (
            <img 
              src={dish.image_url} 
              alt={dish.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`${isSmall ? 'text-4xl' : 'text-6xl'} opacity-30`}>🍽️</div>
            </div>
          )}
          
          {/* Price Badge */}
          <div className="absolute top-3 right-3">
            <div 
              className={`${isSmall ? 'text-sm px-2 py-1' : 'text-lg px-3 py-2'} font-bold text-white bg-black/50 rounded-lg backdrop-blur-sm`}
              style={{ fontFamily: fontFamily ? `${fontFamily}, sans-serif` : undefined }}
            >
              R$ {dish.price.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className={`flex-1 ${isLarge ? '' : 'space-y-3'}`}>
          <CardHeader className="p-0">
            <CardTitle 
              className={`${isSmall ? 'text-lg' : isLarge ? 'text-2xl' : 'text-xl'} font-bold line-clamp-2 group-hover:text-primary transition-colors`}
              style={{ fontFamily: fontFamily ? `${fontFamily}, sans-serif` : undefined }}
            >
              {dish.name}
            </CardTitle>
            <CardDescription 
              className={`${isSmall ? 'text-xs' : 'text-sm'} line-clamp-3 leading-relaxed`}
              style={{ fontFamily: fontFamily ? `${fontFamily}, sans-serif` : undefined }}
            >
              {dish.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0 space-y-3">
            {/* Diet Tags */}
            {dish.diet_tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {dish.diet_tags.slice(0, isSmall ? 2 : 3).map((tag) => {
                  const tagDisplay = getDietTagDisplay(tag);
                  return (
                    <Badge 
                      key={tag} 
                      className={`${tagDisplay.color} border-0 ${isSmall ? 'text-xs px-2 py-1' : 'text-xs'}`}
                      style={{ fontFamily: fontFamily ? `${fontFamily}, sans-serif` : undefined }}
                    >
                      {tagDisplay.label}
                    </Badge>
                  );
                })}
                {dish.diet_tags.length > (isSmall ? 2 : 3) && (
                  <Badge 
                    variant="outline" 
                    className={`${isSmall ? 'text-xs px-2 py-1' : 'text-xs'}`}
                    style={{ fontFamily: fontFamily ? `${fontFamily}, sans-serif` : undefined }}
                  >
                    +{dish.diet_tags.length - (isSmall ? 2 : 3)}
                  </Badge>
                )}
              </div>
            )}

            {/* Nutritional Info */}
            {!isSmall && (dish.calories || dish.protein || dish.carbs || dish.fat) && (
              <div 
                className="grid grid-cols-2 gap-2 text-xs text-muted-foreground"
                style={{ fontFamily: fontFamily ? `${fontFamily}, sans-serif` : undefined }}
              >
                {dish.calories && (
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-primary" />
                    <span>{dish.calories} kcal</span>
                  </div>
                )}
                {dish.protein && (
                  <div className="flex items-center gap-1">
                    <Beef className="w-3 h-3 text-primary" />
                    <span>{dish.protein}g prot.</span>
                  </div>
                )}
                {dish.carbs && (
                  <div className="flex items-center gap-1">
                    <Wheat className="w-3 h-3 text-primary" />
                    <span>{dish.carbs}g carb.</span>
                  </div>
                )}
                {dish.fat && (
                  <div className="flex items-center gap-1">
                    <Droplet className="w-3 h-3 text-blue-600" />
                    <span>{dish.fat}g gord.</span>
                  </div>
                )}
              </div>
            )}

            {/* View Details Button */}
            <Button 
              className={`w-full mt-3 ${isSmall ? 'h-8 text-xs' : 'h-10'} shadow-lg hover:shadow-xl transition-all duration-300`}
              style={{ fontFamily: fontFamily ? `${fontFamily}, sans-serif` : undefined }}
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(dish);
              }}
            >
              <Eye className={`${isSmall ? 'w-3 h-3' : 'w-4 h-4'} mr-2`} />
              Ver Detalhes
            </Button>
          </CardContent>
        </div>
      </div>
    </Card>
  );
};

export default DishCard;
