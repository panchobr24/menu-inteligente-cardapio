
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save, Upload, Store, Image, Palette, Type } from "lucide-react";
import QRCodeGenerator from "@/components/QRCodeGenerator";

interface Restaurant {
  id: string;
  name: string;
  description: string;
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  font_family?: string;
  header_style?: string;
}

interface RestaurantSettingsProps {
  restaurant: Restaurant;
  onUpdate: (restaurant: Restaurant) => void;
}

const RestaurantSettings = ({ restaurant, onUpdate }: RestaurantSettingsProps) => {
  const [formData, setFormData] = useState({
    name: restaurant.name,
    description: restaurant.description || "",
    logo_url: restaurant.logo_url || "",
    font_family: restaurant.font_family || "Inter",
    header_style: restaurant.header_style || "modern"
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fontOptions = [
    { value: "Inter", label: "Inter (Moderno)", fallback: "sans-serif" },
    { value: "Playfair Display", label: "Playfair Display (Elegante)", fallback: "serif" },
    { value: "Roboto", label: "Roboto (Limpo)", fallback: "sans-serif" },
    { value: "Open Sans", label: "Open Sans (Clássico)", fallback: "sans-serif" },
    { value: "Lora", label: "Lora (Serif)", fallback: "serif" },
    { value: "Montserrat", label: "Montserrat (Geométrico)", fallback: "sans-serif" },
    { value: "Poppins", label: "Poppins (Amigável)", fallback: "sans-serif" },
    { value: "Source Sans Pro", label: "Source Sans Pro (Profissional)", fallback: "sans-serif" }
  ];

  const headerStyleOptions = [
    { value: "modern", label: "Moderno (Logo centralizada)" },
    { value: "classic", label: "Clássico (Logo à esquerda)" },
    { value: "banner", label: "Banner (Logo em destaque)" },
    { value: "minimal", label: "Minimalista (Apenas texto)" }
  ];

  const handleSave = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .update(formData)
        .eq('id', restaurant.id)
        .select()
        .single();

      if (error) throw error;

      onUpdate(data);
      toast.success("Configurações salvas com sucesso!");
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Por favor, selecione um arquivo de imagem");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 5MB");
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${restaurant.id}-logo-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('restaurant-logos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('restaurant-logos')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, logo_url: publicUrl }));
      toast.success("Logo enviada com sucesso!");
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error("Erro ao fazer upload da logo");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="w-5 h-5" />
            Informações do Restaurante
          </CardTitle>
          <CardDescription>
            Configure as informações básicas do seu restaurante
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Restaurante</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nome do seu restaurante"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva seu restaurante..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Logo do Restaurante</Label>
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex-1"
              >
                <Image className="w-4 h-4 mr-2" />
                {uploading ? "Enviando..." : "Selecionar Imagem"}
              </Button>
            </div>
            {formData.logo_url && (
              <div className="mt-2">
                <img
                  src={formData.logo_url}
                  alt="Preview da logo"
                  className="w-20 h-20 object-cover rounded-lg border"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Personalização Visual
          </CardTitle>
          <CardDescription>
            Customize a aparência do seu cardápio público
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="font_family">Fonte Principal</Label>
            <Select
              value={formData.font_family}
              onValueChange={(value) => setFormData({ ...formData, font_family: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma fonte" />
              </SelectTrigger>
              <SelectContent>
                {fontOptions.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    <div className="flex items-center gap-3 w-full p-1">
                      <span 
                        className="text-lg font-medium bg-muted px-2 py-1 rounded"
                        style={{ 
                          fontFamily: `${font.value}, ${font.fallback}`,
                          minWidth: '2rem',
                          textAlign: 'center'
                        }}
                      >
                        Aa
                      </span>
                      <span className="flex-1">{font.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Preview da fonte selecionada */}
            <div className="mt-2 p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Preview da fonte selecionada:</p>
              <div 
                className="text-lg font-medium"
                style={{ 
                  fontFamily: `${formData.font_family}, ${fontOptions.find(f => f.value === formData.font_family)?.fallback || 'sans-serif'}`
                }}
              >
                {formData.name || "Nome do Restaurante"}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="header_style">Estilo do Cabeçalho</Label>
            <Select
              value={formData.header_style}
              onValueChange={(value) => setFormData({ ...formData, header_style: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um estilo" />
              </SelectTrigger>
              <SelectContent>
                {headerStyleOptions.map((style) => (
                  <SelectItem key={style.value} value={style.value}>
                    <div className="flex items-center gap-3 w-full p-1">
                      <div className="w-8 h-6 bg-primary/20 rounded border flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-primary">
                          {style.value === 'modern' && 'M'}
                          {style.value === 'classic' && 'C'}
                          {style.value === 'banner' && 'B'}
                          {style.value === 'minimal' && 'Mi'}
                        </span>
                      </div>
                      <span className="flex-1">{style.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Preview do estilo de cabeçalho */}
            <div className="mt-2 p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-2">Preview do estilo selecionado:</p>
              <div className="border rounded-lg p-3 bg-background">
                {formData.header_style === 'modern' && (
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold">
                      {formData.name?.charAt(0) || 'R'}
                    </div>
                    <h3 className="font-bold text-lg">{formData.name || "Nome do Restaurante"}</h3>
                  </div>
                )}
                {formData.header_style === 'classic' && (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
                      {formData.name?.charAt(0) || 'R'}
                    </div>
                    <h3 className="font-bold text-lg">{formData.name || "Nome do Restaurante"}</h3>
                  </div>
                )}
                {formData.header_style === 'banner' && (
                  <div className="bg-primary text-white p-3 rounded-lg text-center">
                    <h3 className="font-bold text-lg">{formData.name || "Nome do Restaurante"}</h3>
                  </div>
                )}
                {formData.header_style === 'minimal' && (
                  <div className="text-center">
                    <h3 className="font-bold text-lg border-b-2 border-primary pb-1">
                      {formData.name || "Nome do Restaurante"}
                    </h3>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-start gap-3">
              <Type className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <h4 className="font-medium mb-1">Preview Completo</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Veja como ficará o cabeçalho do seu cardápio
                </p>
                <div className="border rounded-lg p-4 bg-background">
                  {formData.header_style === 'modern' && (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-primary rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-xl">
                        {formData.name?.charAt(0) || 'R'}
                      </div>
                      <div 
                        className="text-2xl font-bold text-foreground"
                        style={{ 
                          fontFamily: `${formData.font_family}, ${fontOptions.find(f => f.value === formData.font_family)?.fallback || 'sans-serif'}`
                        }}
                      >
                        {formData.name || "Nome do Restaurante"}
                      </div>
                    </div>
                  )}
                  {formData.header_style === 'classic' && (
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">
                        {formData.name?.charAt(0) || 'R'}
                      </div>
                      <div 
                        className="text-2xl font-bold text-foreground"
                        style={{ 
                          fontFamily: `${formData.font_family}, ${fontOptions.find(f => f.value === formData.font_family)?.fallback || 'sans-serif'}`
                        }}
                      >
                        {formData.name || "Nome do Restaurante"}
                      </div>
                    </div>
                  )}
                  {formData.header_style === 'banner' && (
                    <div className="bg-primary text-white p-4 rounded-lg text-center">
                      <div 
                        className="text-2xl font-bold"
                        style={{ 
                          fontFamily: `${formData.font_family}, ${fontOptions.find(f => f.value === formData.font_family)?.fallback || 'sans-serif'}`
                        }}
                      >
                        {formData.name || "Nome do Restaurante"}
                      </div>
                    </div>
                  )}
                  {formData.header_style === 'minimal' && (
                    <div className="text-center">
                      <div 
                        className="text-2xl font-bold border-b-2 border-primary pb-2"
                        style={{ 
                          fontFamily: `${formData.font_family}, ${fontOptions.find(f => f.value === formData.font_family)?.fallback || 'sans-serif'}`
                        }}
                      >
                        {formData.name || "Nome do Restaurante"}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button onClick={handleSave} disabled={loading} className="flex-1">
          <Save className="w-4 h-4 mr-2" />
          {loading ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>QR Code do Cardápio</CardTitle>
          <CardDescription>
            Gere um QR Code para que os clientes acessem seu cardápio facilmente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QRCodeGenerator 
            restaurantId={restaurant.id}
            restaurantName={restaurant.name}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default RestaurantSettings;
