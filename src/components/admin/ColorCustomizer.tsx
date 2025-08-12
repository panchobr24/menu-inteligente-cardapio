
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Palette, Save, RefreshCw } from "lucide-react";

interface Restaurant {
  id: string;
  name: string;
  description: string;
  logo_url: string;
  primary_color: string;
  secondary_color: string;
}

interface ColorCustomizerProps {
  restaurant: Restaurant;
  onUpdate: (restaurant: Restaurant) => void;
}

const ColorCustomizer = ({ restaurant, onUpdate }: ColorCustomizerProps) => {
  const [colors, setColors] = useState({
    primary_color: restaurant.primary_color,
    secondary_color: restaurant.secondary_color
  });
  const [loading, setLoading] = useState(false);

  const presetThemes = [
    { name: "Verde Natureza", primary: "#16a34a", secondary: "#f97316" },
    { name: "Azul Oceano", primary: "#0ea5e9", secondary: "#8b5cf6" },
    { name: "Vermelho Elegante", primary: "#dc2626", secondary: "#fbbf24" },
    { name: "Roxo Moderno", primary: "#7c3aed", secondary: "#06b6d4" },
    { name: "Rosa Delicado", primary: "#ec4899", secondary: "#10b981" },
    { name: "Laranja Vibrante", primary: "#ea580c", secondary: "#3b82f6" }
  ];

  const handleSave = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .update(colors)
        .eq('id', restaurant.id)
        .select()
        .single();

      if (error) throw error;

      onUpdate(data);
      toast.success("Cores personalizadas salvas!");
    } catch (error) {
      toast.error("Erro ao salvar cores");
    } finally {
      setLoading(false);
    }
  };

  const applyTheme = (theme: typeof presetThemes[0]) => {
    setColors({
      primary_color: theme.primary,
      secondary_color: theme.secondary
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Personalização de Cores
          </CardTitle>
          <CardDescription>
            Customize as cores do seu menu para refletir a identidade visual do seu restaurante
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Preview */}
          <div className="space-y-4">
            <Label>Pré-visualização</Label>
            <div 
              className="p-6 rounded-xl border-2 transition-all"
              style={{ 
                backgroundColor: colors.primary_color + '10',
                borderColor: colors.primary_color + '30'
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: colors.primary_color }}
                >
                  R
                </div>
                <div>
                  <h3 className="font-bold text-lg">{restaurant.name}</h3>
                  <p className="text-sm text-muted-foreground">Exemplo de prato delicioso</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  className="px-4 py-2 rounded-lg text-white font-medium"
                  style={{ backgroundColor: colors.primary_color }}
                >
                  Cor Primária
                </button>
                <button 
                  className="px-4 py-2 rounded-lg text-white font-medium"
                  style={{ backgroundColor: colors.secondary_color }}
                >
                  Cor Secundária
                </button>
              </div>
            </div>
          </div>

          {/* Color Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primary">Cor Primária</Label>
              <div className="flex gap-2">
                <Input
                  id="primary"
                  type="color"
                  value={colors.primary_color}
                  onChange={(e) => setColors({ ...colors, primary_color: e.target.value })}
                  className="w-16 h-12 p-1 border-2"
                />
                <Input
                  value={colors.primary_color}
                  onChange={(e) => setColors({ ...colors, primary_color: e.target.value })}
                  placeholder="#16a34a"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondary">Cor Secundária</Label>
              <div className="flex gap-2">
                <Input
                  id="secondary"
                  type="color"
                  value={colors.secondary_color}
                  onChange={(e) => setColors({ ...colors, secondary_color: e.target.value })}
                  className="w-16 h-12 p-1 border-2"
                />
                <Input
                  value={colors.secondary_color}
                  onChange={(e) => setColors({ ...colors, secondary_color: e.target.value })}
                  placeholder="#f97316"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* Preset Themes */}
          <div className="space-y-4">
            <Label>Temas Predefinidos</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {presetThemes.map((theme) => (
                <button
                  key={theme.name}
                  onClick={() => applyTheme(theme)}
                  className="p-3 rounded-lg border-2 hover:border-primary/50 transition-all text-left"
                >
                  <div className="flex gap-2 mb-2">
                    <div 
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: theme.primary }}
                    />
                    <div 
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: theme.secondary }}
                    />
                  </div>
                  <p className="text-sm font-medium">{theme.name}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={loading} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Salvando..." : "Salvar Cores"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setColors({
                primary_color: restaurant.primary_color,
                secondary_color: restaurant.secondary_color
              })}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Resetar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ColorCustomizer;
