
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, Save, Eye, Palette, Type, Layout, ImageIcon, X } from "lucide-react";
import ColorCustomizer from "./ColorCustomizer";
import QRCodeGenerator from "../QRCodeGenerator";

interface Restaurant {
  id: string;
  name: string;
  description: string;
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  font_family: string;
  header_style: string;
  background_color: string;
  background_image_url: string;
  card_background_color: string;
  card_size: string;
}

interface RestaurantSettingsProps {
  restaurant: Restaurant;
  onUpdate: (restaurant: Restaurant) => void;
}

const RestaurantSettings = ({ restaurant, onUpdate }: RestaurantSettingsProps) => {
  const [formData, setFormData] = useState({
    name: restaurant.name || '',
    description: restaurant.description || '',
    logo_url: restaurant.logo_url || '',
    font_family: restaurant.font_family || '',
    header_style: restaurant.header_style || 'logo-name',
    background_color: restaurant.background_color || '',
    background_image_url: restaurant.background_image_url || '',
    card_background_color: restaurant.card_background_color || '',
    card_size: restaurant.card_size || 'medium'
  });

  const [colors, setColors] = useState({
    primary_color: restaurant.primary_color || '#3b82f6',
    secondary_color: restaurant.secondary_color || '#8b5cf6'
  });

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);

  useEffect(() => {
    setFormData({
      name: restaurant.name || '',
      description: restaurant.description || '',
      logo_url: restaurant.logo_url || '',
      font_family: restaurant.font_family || '',
      header_style: restaurant.header_style || 'logo-name',
      background_color: restaurant.background_color || '',
      background_image_url: restaurant.background_image_url || '',
      card_background_color: restaurant.card_background_color || '',
      card_size: restaurant.card_size || 'medium'
    });
    setColors({
      primary_color: restaurant.primary_color || '#3b82f6',
      secondary_color: restaurant.secondary_color || '#8b5cf6'
    });
  }, [restaurant]);

  const uploadFile = async (file: File, type: 'logo' | 'background') => {
    const bucket = type === 'logo' ? 'restaurant-logos' : 'restaurant-backgrounds';
    const fileExt = file.name.split('.').pop();
    const fileName = `${restaurant.id}-${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'background') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (type === 'logo') {
        setUploading(true);
      } else {
        setUploadingBg(true);
      }

      const url = await uploadFile(file, type);
      
      if (type === 'logo') {
        setFormData(prev => ({ ...prev, logo_url: url }));
      } else {
        setFormData(prev => ({ ...prev, background_image_url: url }));
      }
      
      toast.success(`${type === 'logo' ? 'Logo' : 'Imagem de fundo'} enviado com sucesso!`);
    } catch (error) {
      console.error('Erro no upload:', error);
      toast.error(`Erro ao enviar ${type === 'logo' ? 'logo' : 'imagem de fundo'}`);
    } finally {
      if (type === 'logo') {
        setUploading(false);
      } else {
        setUploadingBg(false);
      }
    }
  };

  const removeImage = (type: 'logo' | 'background') => {
    if (type === 'logo') {
      setFormData(prev => ({ ...prev, logo_url: '' }));
    } else {
      setFormData(prev => ({ ...prev, background_image_url: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updateData = {
        ...formData,
        ...colors
      };

      const { data, error } = await supabase
        .from('restaurants')
        .update(updateData)
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
      setSaving(false);
    }
  };

  const handleColorChange = (type: 'primary' | 'secondary', color: string) => {
    const colorKey = `${type}_color` as keyof typeof colors;
    setColors(prev => ({ ...prev, [colorKey]: color }));
  };

  const fontOptions = [
    { value: 'Inter', label: 'Inter (Padrão)' },
    { value: 'Roboto', label: 'Roboto' },
    { value: 'Open Sans', label: 'Open Sans' },
    { value: 'Montserrat', label: 'Montserrat' },
    { value: 'Poppins', label: 'Poppins' },
    { value: 'Playfair Display', label: 'Playfair Display' },
    { value: 'Dancing Script', label: 'Dancing Script' },
    { value: 'Merriweather', label: 'Merriweather' }
  ];

  const headerStyleOptions = [
    { value: 'logo-name', label: 'Logo + Nome' },
    { value: 'logo-only', label: 'Apenas Logo' },
    { value: 'name-only', label: 'Apenas Nome' },
    { value: 'name-logo', label: 'Nome + Logo' },
    { value: 'side-by-side', label: 'Lado a Lado' },
    { value: 'banner', label: 'Banner' }
  ];

  const cardSizeOptions = [
    { value: 'small', label: 'Pequeno' },
    { value: 'medium', label: 'Médio' },
    { value: 'large', label: 'Grande' }
  ];

  const handleColorPickerClick = (e: React.MouseEvent, type: 'primary' | 'secondary') => {
    const target = e.target as HTMLElement;
    const colorPicker = target.parentElement?.querySelector('input[type="color"]') as HTMLInputElement;
    colorPicker?.click();
  };

  const handleBackgroundColorPickerClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const colorPicker = target.parentElement?.querySelector('input[type="color"]') as HTMLInputElement;
    colorPicker?.click();
  };

  const handleCardBackgroundColorPickerClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const colorPicker = target.parentElement?.querySelector('input[type="color"]') as HTMLInputElement;
    colorPicker?.click();
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layout className="w-5 h-5" />
              Informações Básicas
            </CardTitle>
            <CardDescription>
              Configure as informações básicas do seu restaurante
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Restaurante</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Digite o nome do restaurante"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="font_family">Fonte</Label>
                <Select value={formData.font_family} onValueChange={(value) => setFormData(prev => ({ ...prev, font_family: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma fonte" />
                  </SelectTrigger>
                  <SelectContent>
                    {fontOptions.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        <span style={{ fontFamily: font.value }}>{font.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva seu restaurante"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Logo Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Logo do Restaurante
            </CardTitle>
            <CardDescription>
              Faça upload do logo do seu restaurante (PNG, JPG, máx. 5MB)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Button
                  type="button"
                  variant="outline"
                  className="relative overflow-hidden"
                  disabled={uploading}
                  onClick={() => document.getElementById('logo-upload')?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? 'Enviando...' : 'Escolher Logo'}
                </Button>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'logo')}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploading}
                />
              </div>
              
              {formData.logo_url && (
                <div className="flex items-center gap-2">
                  <img 
                    src={formData.logo_url} 
                    alt="Logo atual" 
                    className="w-12 h-12 object-contain border rounded"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeImage('logo')}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="header_style">Estilo do Cabeçalho</Label>
              <Select value={formData.header_style} onValueChange={(value) => setFormData(prev => ({ ...prev, header_style: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o estilo do cabeçalho" />
                </SelectTrigger>
                <SelectContent>
                  {headerStyleOptions.map((style) => (
                    <SelectItem key={style.value} value={style.value}>
                      {style.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Colors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Personalização de Cores
            </CardTitle>
            <CardDescription>
              Defina as cores principais do seu menu
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Cor Primária</Label>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                    style={{ backgroundColor: colors.primary_color }}
                    onClick={(e) => handleColorPickerClick(e, 'primary')}
                  />
                  <input
                    type="color"
                    value={colors.primary_color}
                    onChange={(e) => handleColorChange('primary', e.target.value)}
                    className="sr-only"
                  />
                  <Input
                    value={colors.primary_color}
                    onChange={(e) => handleColorChange('primary', e.target.value)}
                    placeholder="#3b82f6"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Cor Secundária</Label>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                    style={{ backgroundColor: colors.secondary_color }}
                    onClick={(e) => handleColorPickerClick(e, 'secondary')}
                  />
                  <input
                    type="color"
                    value={colors.secondary_color}
                    onChange={(e) => handleColorChange('secondary', e.target.value)}
                    className="sr-only"
                  />
                  <Input
                    value={colors.secondary_color}
                    onChange={(e) => handleColorChange('secondary', e.target.value)}
                    placeholder="#8b5cf6"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Background Customization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Personalização de Fundo
            </CardTitle>
            <CardDescription>
              Configure o fundo do seu menu
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Cor de Fundo</Label>
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                  style={{ backgroundColor: formData.background_color || '#ffffff' }}
                  onClick={handleBackgroundColorPickerClick}
                />
                <input
                  type="color"
                  value={formData.background_color || '#ffffff'}
                  onChange={(e) => setFormData(prev => ({ ...prev, background_color: e.target.value }))}
                  className="sr-only"
                />
                <Input
                  value={formData.background_color}
                  onChange={(e) => setFormData(prev => ({ ...prev, background_color: e.target.value }))}
                  placeholder="#ffffff"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Imagem de Fundo</Label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Button
                    type="button"
                    variant="outline"
                    className="relative overflow-hidden"
                    disabled={uploadingBg}
                    onClick={() => document.getElementById('bg-upload')?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadingBg ? 'Enviando...' : 'Escolher Imagem'}
                  </Button>
                  <input
                    id="bg-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'background')}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploadingBg}
                  />
                </div>
                
                {formData.background_image_url && (
                  <div className="flex items-center gap-2">
                    <img 
                      src={formData.background_image_url} 
                      alt="Fundo atual" 
                      className="w-16 h-12 object-cover border rounded"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeImage('background')}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card Customization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layout className="w-5 h-5" />
              Personalização dos Cards
            </CardTitle>
            <CardDescription>
              Configure a aparência dos cards dos pratos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Cor de Fundo dos Cards</Label>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                    style={{ backgroundColor: formData.card_background_color || '#ffffff' }}
                    onClick={handleCardBackgroundColorPickerClick}
                  />
                  <input
                    type="color"
                    value={formData.card_background_color || '#ffffff'}
                    onChange={(e) => setFormData(prev => ({ ...prev, card_background_color: e.target.value }))}
                    className="sr-only"
                  />
                  <Input
                    value={formData.card_background_color}
                    onChange={(e) => setFormData(prev => ({ ...prev, card_background_color: e.target.value }))}
                    placeholder="#ffffff"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="card_size">Tamanho dos Cards</Label>
                <Select value={formData.card_size} onValueChange={(value) => setFormData(prev => ({ ...prev, card_size: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tamanho dos cards" />
                  </SelectTrigger>
                  <SelectContent>
                    {cardSizeOptions.map((size) => (
                      <SelectItem key={size.value} value={size.value}>
                        {size.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button type="submit" disabled={saving} className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={() => window.open(`/menu/${restaurant.id}`, '_blank')}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
        </div>
      </form>

      {/* QR Code */}
      <QRCodeGenerator restaurantId={restaurant.id} />
    </div>
  );
};

export default RestaurantSettings;
