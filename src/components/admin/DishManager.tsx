import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Edit, Trash2 } from "lucide-react";
import DishForm from "@/components/admin/DishForm";

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

interface DishManagerProps {
  restaurant: Restaurant;
}

const DishManager = ({ restaurant }: DishManagerProps) => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const initialDishData = {
    name: "",
    description: "",
    full_description: "",
    price: 0,
    image_url: "",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    tags: [],
    diet_tags: [],
    is_available: true
  };

  useEffect(() => {
    fetchDishes();
  }, [restaurant.id]);

  const fetchDishes = async () => {
    try {
      const { data } = await supabase
        .from('dishes')
        .select('*')
        .eq('restaurant_id', restaurant.id)
        .order('created_at', { ascending: false });

      setDishes(data || []);
    } catch (error) {
      console.error('Erro ao buscar pratos:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveDish = async (dishData: Partial<Dish>) => {
    try {
      // Ensure required fields are present
      if (!dishData.name || dishData.name.trim() === '') {
        toast.error("Nome do prato é obrigatório");
        return false;
      }

      if (!dishData.price || dishData.price <= 0) {
        toast.error("Preço deve ser maior que zero");
        return false;
      }

      if (editingDish?.id) {
        // Update existing dish
        const updateData = {
          name: dishData.name,
          description: dishData.description || '',
          full_description: dishData.full_description || '',
          price: dishData.price,
          image_url: dishData.image_url || null,
          calories: dishData.calories || null,
          protein: dishData.protein || null,
          carbs: dishData.carbs || null,
          fat: dishData.fat || null,
          tags: dishData.tags || [],
          diet_tags: dishData.diet_tags || [],
          is_available: dishData.is_available !== false
        };

        const { error } = await supabase
          .from('dishes')
          .update(updateData)
          .eq('id', editingDish.id);

        if (error) throw error;
        toast.success("Prato atualizado com sucesso!");
      } else {
        // Create new dish - ensure required fields are present
        const insertData = {
          name: dishData.name,
          description: dishData.description || '',
          full_description: dishData.full_description || '',
          price: dishData.price,
          image_url: dishData.image_url || null,
          calories: dishData.calories || null,
          protein: dishData.protein || null,
          carbs: dishData.carbs || null,
          fat: dishData.fat || null,
          tags: dishData.tags || [],
          diet_tags: dishData.diet_tags || [],
          is_available: dishData.is_available !== false,
          restaurant_id: restaurant.id
        };

        const { error } = await supabase
          .from('dishes')
          .insert(insertData);

        if (error) throw error;
        toast.success("Prato criado com sucesso!");
      }

      await fetchDishes();
      closeDialog();
      return true;
    } catch (error) {
      console.error('Erro ao salvar prato:', error);
      toast.error("Erro ao salvar prato");
      return false;
    }
  };

  const deleteDish = async (dishId: string) => {
    if (!confirm("Tem certeza que deseja excluir este prato?")) return;

    try {
      const { error } = await supabase
        .from('dishes')
        .delete()
        .eq('id', dishId);

      if (error) throw error;

      toast.success("Prato excluído com sucesso!");
      fetchDishes();
    } catch (error) {
      toast.error("Erro ao excluir prato");
    }
  };

  const toggleAvailability = async (dish: Dish) => {
    try {
      const { error } = await supabase
        .from('dishes')
        .update({ is_available: !dish.is_available })
        .eq('id', dish.id);

      if (error) throw error;

      fetchDishes();
    } catch (error) {
      toast.error("Erro ao atualizar disponibilidade");
    }
  };

  const openAddDialog = () => {
    console.log('Opening add dialog');
    setEditingDish(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (dish: Dish) => {
    console.log('Opening edit dialog for dish:', dish.id);
    setEditingDish(dish);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    console.log('Closing dialog');
    setIsDialogOpen(false);
    setEditingDish(null);
  };

  // Add debugging for dialog state
  console.log('Dialog state:', { isDialogOpen, editingDish: editingDish?.id });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gerenciar Pratos</h2>
          <p className="text-muted-foreground">Adicione, edite ou remova pratos do seu cardápio</p>
        </div>
        
        <Button onClick={openAddDialog} type="button">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Prato
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {dishes.map((dish) => (
          <Card key={dish.id} className={`${!dish.is_available ? 'opacity-60' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{dish.name}</CardTitle>
                  <CardDescription className="mt-1">{dish.description}</CardDescription>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Switch
                    checked={dish.is_available}
                    onCheckedChange={() => toggleAvailability(dish)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-primary">
                    R$ {dish.price.toFixed(2)}
                  </span>
                  <div className="flex gap-2">
                    {dish.calories && (
                      <Badge variant="outline">{dish.calories} kcal</Badge>
                    )}
                    {!dish.is_available && (
                      <Badge variant="destructive">Indisponível</Badge>
                    )}
                  </div>
                </div>

                {dish.diet_tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {dish.diet_tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(dish)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteDish(dish.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {dishes.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <h3 className="text-lg font-semibold mb-2">Nenhum prato cadastrado</h3>
            <p className="text-muted-foreground mb-4">
              Comece adicionando o primeiro prato ao seu cardápio
            </p>
            <Button onClick={openAddDialog} type="button">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeiro Prato
            </Button>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {editingDish ? "Editar Prato" : "Adicionar Novo Prato"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {editingDish ? "Modifique as informações do prato abaixo." : "Preencha as informações do novo prato abaixo."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <DishForm
            dish={editingDish}
            initialData={initialDishData}
            onSave={saveDish}
            onCancel={closeDialog}
          />
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DishManager;
