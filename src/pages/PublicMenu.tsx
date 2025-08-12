
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Filter, Search, Zap, Beef, Wheat, Droplet, Heart, Settings } from "lucide-react";
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

const DIET_FILTERS = [
  { id: "vegano", label: "Vegano", icon: Heart },
  { id: "vegetariano", label: "Vegetariano", icon: Heart },
  { id: "low-carb", label: "Low Carb", icon: Zap },
  { id: "sem-gluten", label: "Sem Glúten", icon: Wheat },
  { id: "sem-lactose", label: "Sem Lactose", icon: Droplet },
  { id: "keto", label: "Keto", icon: Zap }
];

const PublicMenu = () => {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [filteredDishes, setFilteredDishes] = useState<Dish[]>([]);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  
  // Filter states
  const [selectedDietFilters, setSelectedDietFilters] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([100]);
  const [calorieRange, setCalorieRange] = useState([1000]);
  const [proteinRange, setProteinRange] = useState([50]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (restaurantId) {
      fetchRestaurantData();
      checkIfOwner();
    }
  }, [restaurantId]);

  useEffect(() => {
    applyFilters();
  }, [dishes, selectedDietFilters, priceRange, calorieRange, proteinRange, searchTerm]);

  const checkIfOwner = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: ownershipData } = await supabase
          .from('restaurant_owners')
          .select('restaurant_id')
          .eq('user_id', user.id)
          .eq('restaurant_id', restaurantId)
          .single();
        
        setIsOwner(!!ownershipData);
      }
    } catch (error) {
      console.error('Error checking ownership:', error);
    }
  };

  const fetchRestaurantData = async () => {
    try {
      // Fetch restaurant info
      const { data: restaurantData } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', restaurantId)
        .single();

      // Fetch dishes
      const { data: dishesData } = await supabase
        .from('dishes')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('is_available', true)
        .order('created_at', { ascending: false });

      setRestaurant(restaurantData);
      setDishes(dishesData || []);
      
      // Set initial filter ranges based on actual data
      if (dishesData?.length) {
        const maxPrice = Math.max(...dishesData.map(d => d.price));
        const maxCalories = Math.max(...dishesData.map(d => d.calories || 0));
        const maxProtein = Math.max(...dishesData.map(d => d.protein || 0));
        
        setPriceRange([maxPrice]);
        setCalorieRange([maxCalories]);
        setProteinRange([maxProtein]);
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = dishes;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(dish => 
        dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dish.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dish.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Diet filters
    if (selectedDietFilters.length > 0) {
      filtered = filtered.filter(dish =>
        selectedDietFilters.some(filter => dish.diet_tags.includes(filter))
      );
    }

    // Price filter
    filtered = filtered.filter(dish => dish.price <= priceRange[0]);

    // Calorie filter
    if (calorieRange[0] < 1000) {
      filtered = filtered.filter(dish => (dish.calories || 0) <= calorieRange[0]);
    }

    // Protein filter
    if (proteinRange[0] > 0) {
      filtered = filtered.filter(dish => (dish.protein || 0) >= proteinRange[0]);
    }

    setFilteredDishes(filtered);
  };

  const clearFilters = () => {
    setSelectedDietFilters([]);
    setSearchTerm("");
    if (dishes.length) {
      const maxPrice = Math.max(...dishes.map(d => d.price));
      const maxCalories = Math.max(...dishes.map(d => d.calories || 0));
      setPriceRange([maxPrice]);
      setCalorieRange([maxCalories]);
      setProteinRange([0]);
    }
  };

  const handleDishClick = (dish: Dish) => {
    setSelectedDish(dish);
    setIsDishModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDishModalOpen(false);
    setSelectedDish(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando cardápio...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Restaurante não encontrado</h2>
          <Button onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Início
          </Button>
        </div>
      </div>
    );
  }

  const customStyle = {
    '--primary-color': restaurant.primary_color,
    '--secondary-color': restaurant.secondary_color,
  } as React.CSSProperties;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100" style={customStyle}>
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Início
            </Button>
            
            <div className="flex items-center gap-3">
              {restaurant.logo_url ? (
                <img 
                  src={restaurant.logo_url} 
                  alt={restaurant.name}
                  className="w-10 h-10 object-cover rounded-xl"
                />
              ) : (
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: restaurant.primary_color }}
                >
                  {restaurant.name.charAt(0)}
                </div>
              )}
              <div>
                <h1 className="font-bold text-lg">{restaurant.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {filteredDishes.length} pratos disponíveis
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isOwner && (
                <Button 
                  onClick={() => navigate("/admin")}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Painel Admin
                </Button>
              )}
              <Button 
                onClick={() => setShowFilters(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filtros
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-4 relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar pratos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Active Filters */}
          {(selectedDietFilters.length > 0 || searchTerm || priceRange[0] < (dishes.length ? Math.max(...dishes.map(d => d.price)) : 100)) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {searchTerm && (
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  Busca: "{searchTerm}"
                </Badge>
              )}
              {selectedDietFilters.map(filterId => {
                const filter = DIET_FILTERS.find(f => f.id === filterId);
                return (
                  <Badge key={filterId} variant="secondary" className="bg-primary/10 text-primary">
                    {filter?.label}
                  </Badge>
                );
              })}
              {priceRange[0] < (dishes.length ? Math.max(...dishes.map(d => d.price)) : 100) && (
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  Até R$ {priceRange[0].toFixed(2)}
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Limpar filtros
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Menu Content */}
      <div className="container mx-auto px-4 py-8">
        {restaurant.description && (
          <div className="text-center mb-8">
            <p className="text-lg text-muted-foreground">{restaurant.description}</p>
          </div>
        )}

        {filteredDishes.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Nenhum prato encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Tente ajustar seus filtros para ver mais opções
            </p>
            <Button onClick={() => setShowFilters(true)} variant="outline">
              Ajustar Filtros
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDishes.map((dish, index) => (
              <Card 
                key={dish.id} 
                className="dish-card group cursor-pointer hover:shadow-xl transition-all duration-300"
                onClick={() => handleDishClick(dish)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="p-6">
                  {/* Image placeholder or actual image */}
                  <div 
                    className="h-32 rounded-xl mb-4 bg-gradient-to-br flex items-center justify-center"
                    style={{ 
                      backgroundColor: restaurant.primary_color + '20',
                      backgroundImage: dish.image_url ? `url(${dish.image_url})` : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    {!dish.image_url && (
                      <div className="text-4xl opacity-30">🍽️</div>
                    )}
                  </div>

                  <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                    {dish.name}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {dish.description}
                  </p>

                  {/* Nutritional info */}
                  {(dish.calories || dish.protein) && (
                    <div className="flex gap-2 mb-4">
                      {dish.calories && (
                        <Badge variant="outline" className="text-xs">
                          <Zap className="w-3 h-3 mr-1" />
                          {dish.calories} kcal
                        </Badge>
                      )}
                      {dish.protein && (
                        <Badge variant="outline" className="text-xs">
                          <Beef className="w-3 h-3 mr-1" />
                          {dish.protein}g
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Diet tags */}
                  {dish.diet_tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {dish.diet_tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {dish.diet_tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{dish.diet_tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span 
                      className="text-2xl font-bold"
                      style={{ color: restaurant.primary_color }}
                    >
                      R$ {dish.price.toFixed(2)}
                    </span>
                    <Button 
                      size="sm"
                      style={{ backgroundColor: restaurant.primary_color }}
                      className="text-white hover:opacity-90"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDishClick(dish);
                      }}
                    >
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Filter Panel */}
      <ModernFilterPanel 
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        dietFilters={DIET_FILTERS}
        selectedDietFilters={selectedDietFilters}
        onToggleDietFilter={(filterId) => {
          setSelectedDietFilters(prev => 
            prev.includes(filterId)
              ? prev.filter(id => id !== filterId)
              : [...prev, filterId]
          );
        }}
        priceRange={priceRange}
        onPriceRangeChange={setPriceRange}
        calorieRange={calorieRange}
        onCalorieRangeChange={setCalorieRange}
        proteinRange={proteinRange}
        onProteinRangeChange={setProteinRange}
        maxPrice={dishes.length ? Math.max(...dishes.map(d => d.price)) : 100}
        maxCalories={dishes.length ? Math.max(...dishes.map(d => d.calories || 0)) : 1000}
        onApplyFilters={() => setShowFilters(false)}
        onClearFilters={clearFilters}
      />

      {/* Dish Modal */}
      <DishModal 
        dish={selectedDish}
        isOpen={isDishModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default PublicMenu;
