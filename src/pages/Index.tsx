
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Search, Filter, ChefHat, Leaf, Heart, Zap } from "lucide-react";
import DishCard from "@/components/DishCard";
import FilterPanel from "@/components/FilterPanel";
import DishModal from "@/components/DishModal";

// Mock data for the pilot restaurant
const RESTAURANT_DATA = {
  name: "Bistrô Verde",
  logo: "🌿",
  description: "Culinária saudável e saborosa"
};

const MOCK_DISHES = [
  {
    id: 1,
    name: "Salmão Grelhado com Quinoa",
    description: "Salmão fresco grelhado servido com quinoa orgânica e legumes salteados",
    price: 42.90,
    image: "/placeholder.svg",
    calories: 420,
    protein: 35,
    carbs: 25,
    fat: 18,
    tags: ["Low Carb", "Rico em Proteína"],
    dietTags: ["sem-gluten"],
    fullDescription: "Delicioso salmão grelhado no ponto perfeito, acompanhado de quinoa orgânica e mix de legumes frescos salteados no azeite de oliva extra virgem. Rico em ômega-3 e proteínas de alta qualidade."
  },
  {
    id: 2,
    name: "Bowl Vegano Power",
    description: "Tigela nutritiva com grão-de-bico, abacate, tomate cereja e tahine",
    price: 28.50,
    image: "/placeholder.svg",
    calories: 380,
    protein: 15,
    carbs: 35,
    fat: 22,
    tags: ["Vegano", "Rico em Fibras"],
    dietTags: ["vegano", "vegetariano", "sem-gluten", "sem-lactose"],
    fullDescription: "Bowl completo e nutritivo com grão-de-bico temperado, abacate cremoso, tomate cereja, folhas verdes e molho de tahine artesanal. Uma explosão de sabores e nutrientes."
  },
  {
    id: 3,
    name: "Frango Keto com Brócolis",
    description: "Peito de frango suculento com brócolis no vapor e manteiga de ervas",
    price: 35.80,
    image: "/placeholder.svg",
    calories: 310,
    protein: 42,
    carbs: 8,
    fat: 12,
    tags: ["Keto", "High Protein"],
    dietTags: ["keto", "low-carb", "sem-gluten", "sem-lactose"],
    fullDescription: "Peito de frango grelhado temperado com ervas finas, acompanhado de brócolis cozido no vapor e finalizado com manteiga de ervas aromáticas. Ideal para dieta cetogênica."
  },
  {
    id: 4,
    name: "Salada Caesar Vegetariana",
    description: "Mix de folhas com croutons integrais, queijo parmesão e molho caesar",
    price: 24.90,
    image: "/placeholder.svg",
    calories: 280,
    protein: 12,
    carbs: 18,
    fat: 20,
    tags: ["Vegetariano", "Leve"],
    dietTags: ["vegetariano"],
    fullDescription: "Refrescante salada caesar com mix de folhas selecionadas, croutons artesanais integrais, queijo parmesão ralado na hora e nosso exclusivo molho caesar vegetariano."
  }
];

const DIET_FILTERS = [
  { id: "vegano", label: "Vegano", icon: Leaf },
  { id: "vegetariano", label: "Vegetariano", icon: Leaf },
  { id: "low-carb", label: "Low Carb", icon: Zap },
  { id: "sem-gluten", label: "Sem Glúten", icon: Heart },
  { id: "sem-lactose", label: "Sem Lactose", icon: Heart },
  { id: "keto", label: "Keto", icon: Zap }
];

const Index = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDietFilters, setSelectedDietFilters] = useState<string[]>([]);
  const [calorieLimit, setCalorieLimit] = useState([800]);
  const [minProtein, setMinProtein] = useState([0]);
  const [maxCarbs, setMaxCarbs] = useState([100]);
  const [selectedDish, setSelectedDish] = useState<typeof MOCK_DISHES[0] | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  const toggleDietFilter = (filterId: string) => {
    setSelectedDietFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  const applyFilters = () => {
    setShowFilters(false);
    setHasStarted(true);
  };

  const filteredDishes = MOCK_DISHES.filter(dish => {
    // Diet filter logic
    if (selectedDietFilters.length > 0) {
      const hasMatchingDiet = selectedDietFilters.some(filter => 
        dish.dietTags.includes(filter)
      );
      if (!hasMatchingDiet) return false;
    }

    // Nutritional filters
    if (dish.calories > calorieLimit[0]) return false;
    if (dish.protein < minProtein[0]) return false;
    if (dish.carbs > maxCarbs[0]) return false;

    return true;
  });

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-appetite-50 to-nutrition-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">{RESTAURANT_DATA.logo}</div>
                <h1 className="text-2xl font-bold text-foreground">{RESTAURANT_DATA.name}</h1>
                <p className="text-muted-foreground">{RESTAURANT_DATA.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="container mx-auto px-4 py-12">
          <div className="text-center max-w-2xl mx-auto">
            <div className="mb-8">
              <ChefHat className="w-20 h-20 mx-auto mb-6 text-primary" />
              <h2 className="text-4xl font-bold mb-4 text-gradient">
                Cardápio Inteligente
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Encontre pratos perfeitos para suas preferências alimentares e metas nutricionais
              </p>
            </div>

            <div className="space-y-4">
              <Button 
                onClick={() => setHasStarted(true)}
                className="btn-hero w-full max-w-sm"
                size="lg"
              >
                Começar
              </Button>
              
              <Button 
                onClick={() => setShowFilters(true)}
                variant="outline"
                className="w-full max-w-sm flex items-center gap-2"
                size="lg"
              >
                <Search className="w-5 h-5" />
                Busca Inteligente
              </Button>
            </div>
          </div>
        </div>

        {/* Features Preview */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 text-center">
              <Filter className="w-12 h-12 mx-auto mb-4 text-accent" />
              <h3 className="font-semibold mb-2">Filtros Inteligentes</h3>
              <p className="text-sm text-muted-foreground">
                Encontre pratos baseados em suas restrições alimentares
              </p>
            </Card>
            
            <Card className="p-6 text-center">
              <Heart className="w-12 h-12 mx-auto mb-4 text-accent" />
              <h3 className="font-semibold mb-2">Metas Nutricionais</h3>
              <p className="text-sm text-muted-foreground">
                Configure calorias e macronutrientes ideais
              </p>
            </Card>
            
            <Card className="p-6 text-center">
              <Zap className="w-12 h-12 mx-auto mb-4 text-accent" />
              <h3 className="font-semibold mb-2">Resultados Instantâneos</h3>
              <p className="text-sm text-muted-foreground">
                Veja o cardápio filtrado em tempo real
              </p>
            </Card>
          </div>
        </div>

        {/* Filter Panel */}
        <FilterPanel 
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          dietFilters={DIET_FILTERS}
          selectedDietFilters={selectedDietFilters}
          onToggleDietFilter={toggleDietFilter}
          calorieLimit={calorieLimit}
          onCalorieLimitChange={setCalorieLimit}
          minProtein={minProtein}
          onMinProteinChange={setMinProtein}
          maxCarbs={maxCarbs}
          onMaxCarbsChange={setMaxCarbs}
          onApplyFilters={applyFilters}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with filters */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{RESTAURANT_DATA.logo}</span>
              <div>
                <h1 className="font-bold text-lg">{RESTAURANT_DATA.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {filteredDishes.length} pratos encontrados
                </p>
              </div>
            </div>
            
            <Button 
              onClick={() => setShowFilters(true)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtros
            </Button>
          </div>
          
          {/* Active filters display */}
          {(selectedDietFilters.length > 0 || calorieLimit[0] < 800 || minProtein[0] > 0 || maxCarbs[0] < 100) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedDietFilters.map(filterId => {
                const filter = DIET_FILTERS.find(f => f.id === filterId);
                return (
                  <Badge key={filterId} variant="secondary" className="filter-tag-active">
                    {filter?.label}
                  </Badge>
                );
              })}
              {calorieLimit[0] < 800 && (
                <Badge variant="secondary" className="filter-tag-active">
                  Até {calorieLimit[0]} kcal
                </Badge>
              )}
              {minProtein[0] > 0 && (
                <Badge variant="secondary" className="filter-tag-active">
                  Min {minProtein[0]}g proteína
                </Badge>
              )}
              {maxCarbs[0] < 100 && (
                <Badge variant="secondary" className="filter-tag-active">
                  Max {maxCarbs[0]}g carbs
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Menu Grid */}
      <div className="container mx-auto px-4 py-6">
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
              <div key={dish.id} className="animate-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <DishCard 
                  dish={dish} 
                  onClick={() => setSelectedDish(dish)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter Panel */}
      <FilterPanel 
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        dietFilters={DIET_FILTERS}
        selectedDietFilters={selectedDietFilters}
        onToggleDietFilter={toggleDietFilter}
        calorieLimit={calorieLimit}
        onCalorieLimitChange={setCalorieLimit}
        minProtein={minProtein}
        onMinProteinChange={setMinProtein}
        maxCarbs={maxCarbs}
        onMaxCarbsChange={setMaxCarbs}
        onApplyFilters={applyFilters}
      />

      {/* Dish Modal */}
      {selectedDish && (
        <DishModal 
          dish={selectedDish}
          isOpen={!!selectedDish}
          onClose={() => setSelectedDish(null)}
        />
      )}
    </div>
  );
};

export default Index;
