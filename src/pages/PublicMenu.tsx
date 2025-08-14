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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Enhanced Header with Better Logo Placement */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto">
          {/* Logo Banner Section - Enhanced */}
          {restaurant.logo_url && (
            <div 
              className="relative h-40 bg-gradient-to-r from-primary/5 to-secondary/5 overflow-hidden border-b"
              style={{
                background: `linear-gradient(135deg, ${restaurant.primary_color || '#3b82f6'}08 0%, ${restaurant.secondary_color || '#8b5cf6'}08 100%)`
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="mb-4">
                    <img
                      src={restaurant.logo_url}
                      alt={`${restaurant.name} logo`}
                      className="h-28 w-auto object-contain drop-shadow-2xl transition-transform hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                  {/* Decorative elements */}
                  <div className="flex justify-center space-x-2">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: restaurant.primary_color || '#3b82f6' }}
                    />
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: restaurant.secondary_color || '#8b5cf6' }}
                    />
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: restaurant.primary_color || '#3b82f6' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Restaurant Info Section - Enhanced */}
          <div className="p-8">
            <div className="text-center mb-8">
              <h1 
                className="text-5xl font-bold mb-4"
                style={{ color: restaurant.primary_color || '#1f2937' }}
              >
                {restaurant.name}
              </h1>
              {restaurant.description && (
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
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
                />
              </div>
              <Button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 h-12 px-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                style={{ 
                  backgroundColor: restaurant.primary_color || '#3b82f6',
                  borderColor: restaurant.primary_color || '#3b82f6'
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
      <div className="max-w-6xl mx-auto p-8">
        {filteredDishes.length === 0 ? (
          <Card className="text-center py-16 border-2 border-dashed">
            <CardContent>
              <div 
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: (restaurant.primary_color || '#3b82f6') + '20' }}
              >
                <Search className="w-8 h-8" style={{ color: restaurant.primary_color || '#3b82f6' }} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Nenhum prato encontrado</h3>
              <p className="text-muted-foreground mb-6 text-lg">
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
                    color: restaurant.primary_color || '#3b82f6'
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
              <p className="text-lg text-muted-foreground">
                {filteredDishes.length} prato{filteredDishes.length !== 1 ? 's' : ''} encontrado{filteredDishes.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            {/* Dishes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredDishes.map((dish) => (
                <DishCard
                  key={dish.id}
                  dish={dish}
                  onViewDetails={(dish) => setSelectedDish(dish)}
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
