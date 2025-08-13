import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Edit, Trash2, X } from "lucide-react";

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
  const [showDialog, setShowDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    full_description: "",
    price: "",
    image_url: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    tags: "",
    diet_tags: "",
    is_available: true
  });

  const initialFormData = {
    name: "",
    description: "",
    full_description: "",
    price: "",
    image_url: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    tags: "",
    diet_tags: "",
    is_available: true
  };

  useEffect(() => {
    fetchDishes();
  }, [restaurant.id]);

  const fetchDishes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('dishes')
        .select('*')
        .eq('restaurant_id', restaurant.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDishes(data || []);
    } catch (error) {
      console.error('Erro ao buscar pratos:', error);
      toast.error("Erro ao carregar pratos");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const parseTags = (tagsString: string): string[] => {
    return tagsString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
        toast.error("Nome do prato é obrigatório");
        return false;
      }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      toast.error("Preço deve ser um número maior que zero");
      return false;
    }

    if (formData.calories && (isNaN(parseFloat(formData.calories)) || parseFloat(formData.calories) < 0)) {
      toast.error("Calorias deve ser um número válido");
      return false;
    }

    if (formData.protein && (isNaN(parseFloat(formData.protein)) || parseFloat(formData.protein) < 0)) {
      toast.error("Proteína deve ser um número válido");
      return false;
    }

    if (formData.carbs && (isNaN(parseFloat(formData.carbs)) || parseFloat(formData.carbs) < 0)) {
      toast.error("Carboidratos deve ser um número válido");
      return false;
    }

    if (formData.fat && (isNaN(parseFloat(formData.fat)) || parseFloat(formData.fat) < 0)) {
      toast.error("Gordura deve ser um número válido");
        return false;
      }

    return true;
  };

  const saveDish = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      const dishData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        full_description: formData.full_description.trim(),
        price: parseFloat(formData.price),
        image_url: formData.image_url.trim() || null,
        calories: formData.calories ? parseFloat(formData.calories) : null,
        protein: formData.protein ? parseFloat(formData.protein) : null,
        carbs: formData.carbs ? parseFloat(formData.carbs) : null,
        fat: formData.fat ? parseFloat(formData.fat) : null,
        tags: parseTags(formData.tags),
        diet_tags: parseTags(formData.diet_tags),
        is_available: formData.is_available
      };

      if (editingDish?.id) {
        // Update existing dish
        const { error } = await supabase
          .from('dishes')
          .update(dishData)
          .eq('id', editingDish.id);

        if (error) throw error;
        toast.success("Prato atualizado com sucesso!");
      } else {
        // Create new dish
        const { error } = await supabase
          .from('dishes')
          .insert({
            ...dishData,
            restaurant_id: restaurant.id
          });

        if (error) throw error;
        toast.success("Prato criado com sucesso!");
      }

      await fetchDishes();
      closeDialog();
    } catch (error) {
      console.error('Erro ao salvar prato:', error);
      toast.error("Erro ao salvar prato");
    } finally {
      setSaving(false);
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
      await fetchDishes();
    } catch (error) {
      console.error('Erro ao excluir prato:', error);
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

      await fetchDishes();
    } catch (error) {
      console.error('Erro ao atualizar disponibilidade:', error);
      toast.error("Erro ao atualizar disponibilidade");
    }
  };

  const openAddDialog = () => {
    setEditingDish(null);
    setFormData(initialFormData);
    setShowDialog(true);
  };

  const openEditDialog = (dish: Dish) => {
    setEditingDish(dish);
    setFormData({
      name: dish.name,
      description: dish.description || "",
      full_description: dish.full_description || "",
      price: dish.price.toString(),
      image_url: dish.image_url || "",
      calories: dish.calories?.toString() || "",
      protein: dish.protein?.toString() || "",
      carbs: dish.carbs?.toString() || "",
      fat: dish.fat?.toString() || "",
      tags: dish.tags.join(", "),
      diet_tags: dish.diet_tags.join(", "),
      is_available: dish.is_available
    });
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setEditingDish(null);
    setFormData(initialFormData);
    setSaving(false);
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
        
        <Button 
          onClick={openAddDialog} 
          type="button"
        >
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

      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
              {editingDish ? "Editar Prato" : "Adicionar Novo Prato"}
            </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeDialog}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Prato *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Ex: X-Burger"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Preço *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição Curta</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Descrição breve do prato"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_description">Descrição Completa</Label>
                <Textarea
                  id="full_description"
                  value={formData.full_description}
                  onChange={(e) => handleInputChange('full_description', e.target.value)}
                  placeholder="Descrição detalhada, ingredientes, etc."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">URL da Imagem</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => handleInputChange('image_url', e.target.value)}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="calories">Calorias</Label>
                  <Input
                    id="calories"
                    type="number"
                    min="0"
                    value={formData.calories}
                    onChange={(e) => handleInputChange('calories', e.target.value)}
                    placeholder="kcal"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="protein">Proteína (g)</Label>
                  <Input
                    id="protein"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.protein}
                    onChange={(e) => handleInputChange('protein', e.target.value)}
                    placeholder="0.0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="carbs">Carboidratos (g)</Label>
                  <Input
                    id="carbs"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.carbs}
                    onChange={(e) => handleInputChange('carbs', e.target.value)}
                    placeholder="0.0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fat">Gordura (g)</Label>
                  <Input
                    id="fat"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.fat}
                    onChange={(e) => handleInputChange('fat', e.target.value)}
                    placeholder="0.0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                    placeholder="Ex: hambúrguer, carne, queijo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="diet_tags">Tags Dietéticas (separadas por vírgula)</Label>
                  <Input
                    id="diet_tags"
                    value={formData.diet_tags}
                    onChange={(e) => handleInputChange('diet_tags', e.target.value)}
                    placeholder="Ex: vegetariano, sem glúten, low-carb"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_available"
                  checked={formData.is_available}
                  onCheckedChange={(checked) => handleInputChange('is_available', checked)}
                />
                <Label htmlFor="is_available">Disponível para pedidos</Label>
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-6">
              <Button variant="outline" onClick={closeDialog} disabled={saving}>
                Cancelar
              </Button>
              <Button onClick={saveDish} disabled={saving}>
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  editingDish ? "Atualizar" : "Criar"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DishManager;
