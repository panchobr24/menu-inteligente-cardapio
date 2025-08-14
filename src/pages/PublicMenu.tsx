
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Search, Filter, ArrowLeft, Settings } from "lucide-react";
import DishCard from "@/components/DishCard";
import DishModal from "@/components/DishModal";
import ModernFilterPanel from "@/components/ModernFilterPanel";

interface Restaurant {
  id: string;
  name: string;
  description: string;
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  background_color?: string;
  background_image_url?: string;
  header_style: string;
  font_family?: string;
  card_background_color?: string;
  card_size?: string;
}

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

const PublicMenu = () => {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [filteredDishes, setFilteredDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [user, setUser] = useState(null);

  // Filtering states
  const [selectedDietTags, setSelectedDietTags] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [calorieRange, setCalorieRange] = useState([0, 1000]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    if (restaurantId) {
      fetchRestaurant();
      fetchDishes();
      checkOwnership();
    }
  }, [restaurantId]);

  useEffect(() => {
    filterDishes();
  }, [dishes, searchTerm, selectedDietTags, priceRange, calorieRange, selectedTags]);

  const checkOwnership = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        const { data } = await supabase
          .from('restaurant_owners')
          .select('restaurant_id')
          .eq('user_id', user.id)
          .eq('restaurant_id', restaurantId)
          .single();
        
        setIsOwner(!!data);
      }
    } catch (error) {
      console.log('Not owner or not logged in');
    }
  };

  const fetchRestaurant = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', restaurantId)
        .single();

      if (error) throw error;
      setRestaurant(data);
    } catch (error) {
      console.error('Erro ao buscar restaurante:', error);
      toast.error("Restaurante não encontrado");
    }
  };

  const fetchDishes = async () => {
    try {
      const { data, error } = await supabase
        .from('dishes')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('is_available', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDishes(data || []);
      
      // Set initial price and calorie ranges based on actual data
      if (data && data.length > 0) {
        const maxPrice = Math.max(...data.map(d => d.price), 100);
        const maxCalories = Math.max(...data.map(d => d.calories || 0), 1000);
        setPriceRange([0, maxPrice]);
        setCalorieRange([0, maxCalories]);
      }
    } catch (error) {
      console.error('Erro ao buscar pratos:', error);
      toast.error("Erro ao carregar cardápio");
    } finally {
      setLoading(false);
    }
  };

  const filterDishes = () => {
    let filtered = dishes;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(dish =>
        dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dish.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Diet tags filter
    if (selectedDietTags.length > 0) {
      filtered = filtered.filter(dish =>
        selectedDietTags.some(tag => dish.diet_tags.includes(tag))
      );
    }

    // Tags filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(dish =>
        selectedTags.some(tag => dish.tags.includes(tag))
      );
    }

    // Price range filter
    filtered = filtered.filter(dish =>
      dish.price >= priceRange[0] && dish.price <= priceRange[1]
    );

    // Calorie range filter (only if dish has calorie info)
    filtered = filtered.filter(dish =>
      !dish.calories || (dish.calories >= calorieRange[0] && dish.calories <= calorieRange[1])
    );

    setFilteredDishes(filtered);
  };

  const clearFilters = () => {
    setSelectedDietTags([]);
    setSelectedTags([]);
    const maxPrice = Math.max(...dishes.map(d => d.price), 100);
    const maxCalories = Math.max(...dishes.map(d => d.calories || 0), 1000);
    setPriceRange([0, maxPrice]);
    setCalorieRange([0, maxCalories]);
    setSearchTerm("");
  };

  const getUniqueValues = (key: keyof Dish) => {
    const values = dishes.flatMap(dish => dish[key] as string[]).filter(Boolean);
    return [...new Set(values)];
  };

  const renderHeader = () => {
    const headerStyle = restaurant?.header_style || 'logo-name';
    const fontFamily = restaurant?.font_family ? `${restaurant.font_family}, sans-serif` : undefined;
    
    switch (headerStyle) {
      case 'logo-only':
        return restaurant.logo_url ? (
          <div className="text-center">
            <img
              src={restaurant.logo_url}
              alt={`${restaurant.name} logo`}
              className="h-32 w-auto object-contain drop-shadow-2xl mx-auto mb-4"
            />
          </div>
        ) : (
          <h1 
            className="text-5xl font-bold mb-4"
            style={{ 
              color: restaurant.primary_color || '#1f2937',
              fontFamily: fontFamily
            }}
          >
            {restaurant.name}
          </h1>
        );
        
      case 'name-only':
        return (
          <h1 
            className="text-5xl font-bold mb-4"
            style={{ 
              color: restaurant.primary_color || '#1f2937',
              fontFamily: fontFamily
            }}
          >
            {restaurant.name}
          </h1>
        );
        
      case 'logo-name':
        return (
          <div className="text-center">
            {restaurant.logo_url && (
              <img
                src={restaurant.logo_url}
                alt={`${restaurant.name} logo`}
                className="h-24 w-auto object-contain drop-shadow-2xl mx-auto mb-4"
              />
            )}
            <h1 
              className="text-5xl font-bold mb-4"
              style={{ 
                color: restaurant.primary_color || '#1f2937',
                fontFamily: fontFamily
              }}
            >
              {restaurant.name}
            </h1>
          </div>
        );
        
      case 'name-logo':
        return (
          <div className="text-center">
            <h1 
              className="text-5xl font-bold mb-4"
              style={{ 
                color: restaurant.primary_color || '#1f2937',
                fontFamily: fontFamily
              }}
            >
              {restaurant.name}
            </h1>
            {restaurant.logo_url && (
              <img
                src={restaurant.logo_url}
                alt={`${restaurant.name} logo`}
                className="h-24 w-auto object-contain drop-shadow-2xl mx-auto"
              />
            )}
          </div>
        );
        
      case 'side-by-side':
        return (
          <div className="flex items-center justify-center gap-6 mb-4">
            {restaurant.logo_url && (
              <img
                src={restaurant.logo_url}
                alt={`${restaurant.name} logo`}
                className="h-20 w-auto object-contain drop-shadow-2xl"
              />
            )}
            <h1 
              className="text-5xl font-bold"
              style={{ 
                color: restaurant.primary_color || '#1f2937',
                fontFamily: fontFamily
              }}
            >
              {restaurant.name}
            </h1>
          </div>
        );
        
      case 'banner':
        return (
          <div 
            className="bg-gradient-to-r from-primary/20 to-secondary/20 p-6 rounded-2xl border border-primary/30"
            style={{
              background: `linear-gradient(135deg, ${restaurant.primary_color || '#3b82f6'}20 0%, ${restaurant.secondary_color || '#8b5cf6'}20 100%)`
            }}
          >
            <div className="text-center">
              {restaurant.logo_url && (
                <img
                  src={restaurant.logo_url}
                  alt={`${restaurant.name} logo`}
                  className="h-20 w-auto object-contain drop-shadow-2xl mx-auto mb-3"
                />
              )}
              <h1 
                className="text-4xl font-bold"
                style={{ 
                  color: restaurant.primary_color || '#1f2937',
                  fontFamily: fontFamily
                }}
              >
                {restaurant.name}
              </h1>
            </div>
          </div>
        );
        
      default:
        return (
          <h1 
            className="text-5xl font-bold mb-4"
            style={{ 
              color: restaurant.primary_color || '#1f2937',
              fontFamily: fontFamily
            }}
          >
            {restaurant.name}
          </h1>
        );
    }
  };

  const getCardGridClasses = () => {
    const cardSize = restaurant?.card_size || 'medium';
    switch (cardSize) {
      case 'small':
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'; // 3 por fileira em telas grandes
      case 'medium':
        return 'grid-cols-1 lg:grid-cols-2'; // 2 por fileira em telas grandes
      case 'large':
        return 'grid-cols-1'; // 1 por fileira
      default:
        return 'grid-cols-1 lg:grid-cols-2';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-48 w-full rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Restaurante não encontrado</h2>
            <p className="text-muted-foreground mb-4">
              O restaurante que você está procurando não existe ou não está disponível.
            </p>
            <Link to="/">
              <Button>Voltar ao início</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const containerStyle = {
    backgroundColor: restaurant.background_color || undefined,
    backgroundImage: restaurant.background_image_url ? `url(${restaurant.background_image_url})` : undefined,
    backgroundSize: restaurant.background_image_url ? 'cover' : undefined,
    backgroundPosition: restaurant.background_image_url ? 'center' : undefined,
    backgroundAttachment: restaurant.background_image_url ? 'fixed' : undefined,
    backgroundRepeat: restaurant.background_image_url ? 'no-repeat' : undefined,
    fontFamily: restaurant.font_family ? `${restaurant.font_family}, sans-serif` : undefined,
  };

  return (
    <div className="min-h-screen w-full" style={containerStyle}>
      {/* Background overlay for better readability when using background image */}
      {restaurant.background_image_url && (
        <div className="fixed inset-0 bg-black/20 pointer-events-none z-0" />
      )}
      
      {/* Enhanced Header with Better Logo Placement */}
      <div className="bg-white/95 backdrop-blur-sm border-b shadow-sm relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Restaurant Info Section - Enhanced */}
          <div className="p-8">
            <div className="text-center mb-8">
              {/* Dynamic Header based on header_style */}
              {renderHeader()}
              
              {restaurant.description && (
                <p 
                  className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
                  style={{ 
                    fontFamily: restaurant.font_family ? `${restaurant.font_family}, sans-serif` : undefined 
                  }}
                >
                  {restaurant.description}
                </p>
              )}
              {/* Decorative line */}
              <div 
                className="w-24 h-1 mx-auto mt-6 rounded-full"
                style={{ backgroundColor: restaurant.secondary_color || '#8b5cf6' }}
              />
            </div>

            {/* Search and Filter Controls - Enhanced */}
            <div className="flex flex-col sm:flex-row gap-4 max-w-3xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Buscar pratos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-lg border-2 focus:border-primary transition-colors"
                  style={{ 
                    fontFamily: restaurant.font_family ? `${restaurant.font_family}, sans-serif` : undefined 
                  }}
                />
              </div>
              <Button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 h-12 px-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                style={{ 
                  backgroundColor: restaurant.primary_color || '#3b82f6',
                  borderColor: restaurant.primary_color || '#3b82f6',
                  fontFamily: restaurant.font_family ? `${restaurant.font_family}, sans-serif` : undefined
                }}
              >
                <Filter className="w-5 h-5" />
                Filtrar
              </Button>
            </div>

            {/* Modern Filter Panel */}
            {showFilters && (
              <div className="mt-8 max-w-4xl mx-auto">
                <ModernFilterPanel
                  availableDietTags={getUniqueValues('diet_tags')}
                  availableTags={getUniqueValues('tags')}
                  selectedDietTags={selectedDietTags}
                  selectedTags={selectedTags}
                  priceRange={priceRange}
                  calorieRange={calorieRange}
                  onDietTagsChange={setSelectedDietTags}
                  onTagsChange={setSelectedTags}
                  onPriceRangeChange={setPriceRange}
                  onCalorieRangeChange={setCalorieRange}
                  onClearFilters={clearFilters}
                  maxPrice={Math.max(...dishes.map(d => d.price), 100)}
                  maxCalories={Math.max(...dishes.map(d => d.calories || 0), 1000)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Menu Content - Enhanced */}
      <div className="max-w-6xl mx-auto p-8 relative z-10">
        {filteredDishes.length === 0 ? (
          <Card className="text-center py-16 border-2 border-dashed bg-white/95 backdrop-blur-sm">
            <CardContent>
              <div 
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: (restaurant.primary_color || '#3b82f6') + '20' }}
              >
                <Search className="w-8 h-8" style={{ color: restaurant.primary_color || '#3b82f6' }} />
              </div>
              <h3 
                className="text-xl font-semibold mb-3"
                style={{ 
                  fontFamily: restaurant.font_family ? `${restaurant.font_family}, sans-serif` : undefined 
                }}
              >
                Nenhum prato encontrado
              </h3>
              <p 
                className="text-muted-foreground mb-6 text-lg"
                style={{ 
                  fontFamily: restaurant.font_family ? `${restaurant.font_family}, sans-serif` : undefined 
                }}
              >
                {dishes.length === 0 
                  ? "Este restaurante ainda não possui pratos cadastrados."
                  : "Tente ajustar os filtros para ver mais opções."
                }
              </p>
              {dishes.length > 0 && (
                <Button 
                  onClick={clearFilters} 
                  variant="outline"
                  className="px-6 py-3 text-lg"
                  style={{ 
                    borderColor: restaurant.primary_color || '#3b82f6',
                    color: restaurant.primary_color || '#3b82f6',
                    fontFamily: restaurant.font_family ? `${restaurant.font_family}, sans-serif` : undefined
                  }}
                >
                  Limpar Filtros
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Results count */}
            <div className="mb-6 text-center">
              <p 
                className="text-lg text-muted-foreground bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full inline-block"
                style={{ 
                  fontFamily: restaurant.font_family ? `${restaurant.font_family}, sans-serif` : undefined 
                }}
              >
                {filteredDishes.length} prato{filteredDishes.length !== 1 ? 's' : ''} encontrado{filteredDishes.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            {/* Dishes Grid - Corrigido com classes centralizadas */}
            <div className={`grid gap-8 justify-items-center ${getCardGridClasses()}`}>
              {filteredDishes.map((dish) => (
                <DishCard
                  key={dish.id}
                  dish={dish}
                  onViewDetails={(dish) => setSelectedDish(dish)}
                  cardBackgroundColor={restaurant.card_background_color}
                  cardSize={restaurant.card_size}
                  fontFamily={restaurant.font_family}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Dish Modal */}
      <DishModal
        dish={selectedDish}
        isOpen={!!selectedDish}
        onClose={() => setSelectedDish(null)}
      />
    </div>
  );
};

export default PublicMenu;
