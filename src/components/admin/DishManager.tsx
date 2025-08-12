
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";

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
        return;
      }

      if (!dishData.price || dishData.price <= 0) {
        toast.error("Preço deve ser maior que zero");
        return;
      }

      if (editingDish?.id) {
        // Update existing dish
        const { error } = await supabase
          .from('dishes')
          .update(dishData)
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

      fetchDishes();
      setIsDialogOpen(false);
      setEditingDish(null);
    } catch (error) {
      console.error('Erro ao salvar prato:', error);
      toast.error("Erro ao salvar prato");
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
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingDish(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Prato
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingDish ? "Editar Prato" : "Adicionar Novo Prato"}
              </DialogTitle>
            </DialogHeader>
            <DishForm
              dish={editingDish}
              initialData={initialDishData}
              onSave={saveDish}
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingDish(null);
              }}
            />
          </DialogContent>
        </Dialog>
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
                    onClick={() => {
                      setEditingDish(dish);
                      setIsDialogOpen(true);
                    }}
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
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeiro Prato
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Dish Form Component
interface DishFormProps {
  dish: Dish | null;
  initialData: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}

const DishForm = ({ dish, initialData, onSave, onCancel }: DishFormProps) => {
  const [formData, setFormData] = useState(dish || initialData);
  const [tags, setTags] = useState<string>(dish?.tags.join(', ') || '');
  const [dietTags, setDietTags] = useState<string>(dish?.diet_tags.join(', ') || '');

  const handleSubmit = () => {
    const data = {
      ...formData,
      tags: tags.split(',').map(t => t.trim()).filter(t => t),
      diet_tags: dietTags.split(',').map(t => t.trim()).filter(t => t)
    };
    onSave(data);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Nome do Prato</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ex: Salmão Grelhado"
          />
        </div>
        <div className="space-y-2">
          <Label>Preço (R$)</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Descrição Breve</Label>
        <Input
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Descrição que aparece no card"
        />
      </div>

      <div className="space-y-2">
        <Label>Descrição Completa</Label>
        <Textarea
          value={formData.full_description}
          onChange={(e) => setFormData({ ...formData, full_description: e.target.value })}
          placeholder="Descrição detalhada que aparece no modal"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>URL da Imagem</Label>
        <Input
          value={formData.image_url || ''}
          onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
          placeholder="https://exemplo.com/imagem.jpg"
        />
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label>Calorias</Label>
          <Input
            type="number"
            value={formData.calories || ''}
            onChange={(e) => setFormData({ ...formData, calories: parseInt(e.target.value) || 0 })}
            placeholder="kcal"
          />
        </div>
        <div className="space-y-2">
          <Label>Proteína (g)</Label>
          <Input
            type="number"
            value={formData.protein || ''}
            onChange={(e) => setFormData({ ...formData, protein: parseInt(e.target.value) || 0 })}
            placeholder="g"
          />
        </div>
        <div className="space-y-2">
          <Label>Carboidratos (g)</Label>
          <Input
            type="number"
            value={formData.carbs || ''}
            onChange={(e) => setFormData({ ...formData, carbs: parseInt(e.target.value) || 0 })}
            placeholder="g"
          />
        </div>
        <div className="space-y-2">
          <Label>Gorduras (g)</Label>
          <Input
            type="number"
            value={formData.fat || ''}
            onChange={(e) => setFormData({ ...formData, fat: parseInt(e.target.value) || 0 })}
            placeholder="g"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Tags (separadas por vírgula)</Label>
        <Input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Ex: Low Carb, Rico em Proteína"
        />
      </div>

      <div className="space-y-2">
        <Label>Restrições Alimentares (separadas por vírgula)</Label>
        <Input
          value={dietTags}
          onChange={(e) => setDietTags(e.target.value)}
          placeholder="Ex: vegano, sem-gluten, sem-lactose"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          checked={formData.is_available}
          onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
        />
        <Label>Disponível no cardápio</Label>
      </div>

      <div className="flex gap-3 pt-4">
        <Button onClick={handleSubmit} className="flex-1">
          <Save className="w-4 h-4 mr-2" />
          Salvar
        </Button>
        <Button variant="outline" onClick={onCancel}>
          <X className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
      </div>
    </div>
  );
};

export default DishManager;
