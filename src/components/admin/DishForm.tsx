
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Save, X } from "lucide-react";

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

interface DishFormProps {
  dish: Dish | null;
  initialData: any;
  onSave: (data: any) => Promise<boolean>;
  onCancel: () => void;
}

const DishForm = ({ dish, initialData, onSave, onCancel }: DishFormProps) => {
  const [formData, setFormData] = useState(dish || initialData);
  const [tags, setTags] = useState<string>(dish?.tags.join(', ') || '');
  const [dietTags, setDietTags] = useState<string>(dish?.diet_tags.join(', ') || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const data = {
      ...formData,
      tags: tags.split(',').map(t => t.trim()).filter(t => t),
      diet_tags: dietTags.split(',').map(t => t.trim()).filter(t => t)
    };
    
    const success = await onSave(data);
    setSaving(false);
    
    // Only close if save was successful
    if (!success) {
      return;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome do Prato *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ex: Salmão Grelhado"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Preço (R$) *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
            placeholder="0.00"
            required
            min="0"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição Breve</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Descrição que aparece no card"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="full_description">Descrição Completa</Label>
        <Textarea
          id="full_description"
          value={formData.full_description}
          onChange={(e) => setFormData({ ...formData, full_description: e.target.value })}
          placeholder="Descrição detalhada que aparece no modal"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image_url">URL da Imagem</Label>
        <Input
          id="image_url"
          value={formData.image_url || ''}
          onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
          placeholder="https://exemplo.com/imagem.jpg"
        />
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="calories">Calorias</Label>
          <Input
            id="calories"
            type="number"
            value={formData.calories || ''}
            onChange={(e) => setFormData({ ...formData, calories: parseInt(e.target.value) || 0 })}
            placeholder="kcal"
            min="0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="protein">Proteína (g)</Label>
          <Input
            id="protein"
            type="number"
            value={formData.protein || ''}
            onChange={(e) => setFormData({ ...formData, protein: parseInt(e.target.value) || 0 })}
            placeholder="g"
            min="0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="carbs">Carboidratos (g)</Label>
          <Input
            id="carbs"
            type="number"
            value={formData.carbs || ''}
            onChange={(e) => setFormData({ ...formData, carbs: parseInt(e.target.value) || 0 })}
            placeholder="g"
            min="0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fat">Gorduras (g)</Label>
          <Input
            id="fat"
            type="number"
            value={formData.fat || ''}
            onChange={(e) => setFormData({ ...formData, fat: parseInt(e.target.value) || 0 })}
            placeholder="g"
            min="0"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
        <Input
          id="tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Ex: Low Carb, Rico em Proteína"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="diet_tags">Restrições Alimentares (separadas por vírgula)</Label>
        <Input
          id="diet_tags"
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
        <Button type="submit" disabled={saving} className="flex-1">
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Salvando..." : "Salvar"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          <X className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
      </div>
    </form>
  );
};

export default DishForm;
