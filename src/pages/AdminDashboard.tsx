
import { useEffect, useState } from "react";
import { User } from '@supabase/supabase-js';
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LogOut, Settings, Menu, Palette, Plus, ArrowLeft } from "lucide-react";
import RestaurantSettings from "@/components/admin/RestaurantSettings";
import DishManager from "@/components/admin/DishManager";


interface AdminDashboardProps {
  user: User | null;
}

interface Restaurant {
  id: string;
  name: string;
  description: string;
  logo_url: string;
  primary_color: string;
  secondary_color: string;
}

const AdminDashboard = ({ user }: AdminDashboardProps) => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
    fetchRestaurant();
  }, [user, navigate]);

  const fetchRestaurant = async () => {
    try {
      const { data: ownershipData } = await supabase
        .from('restaurant_owners')
        .select('restaurant_id')
        .eq('user_id', user?.id)
        .single();

      if (ownershipData) {
        const { data: restaurantData } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', ownershipData.restaurant_id)
          .single();

        setRestaurant(restaurantData);
      }
    } catch (error) {
      console.error('Erro ao buscar restaurante:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const createRestaurant = async () => {
    if (!user) return;

    try {
      const { data: newRestaurant, error } = await supabase
        .from('restaurants')
        .insert({
          name: 'Meu Restaurante',
          description: 'Descrição do restaurante'
        })
        .select()
        .single();

      if (error) throw error;

      await supabase
        .from('restaurant_owners')
        .insert({
          user_id: user.id,
          restaurant_id: newRestaurant.id
        });

      setRestaurant(newRestaurant);
      toast.success("Restaurante criado com sucesso!");
    } catch (error) {
      toast.error("Erro ao criar restaurante");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Bem-vindo ao Painel Administrativo</CardTitle>
            <CardDescription>
              Você ainda não tem um restaurante configurado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={createRestaurant} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Criar Meu Restaurante
            </Button>
            <Button variant="outline" onClick={() => navigate("/")} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Settings className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Painel Administrativo</h1>
                <p className="text-sm text-muted-foreground">{restaurant.name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => navigate(`/menu/${restaurant.id}`)}
              >
                <Menu className="w-4 h-4 mr-2" />
                Ver Menu Público
              </Button>
              <Button variant="outline" onClick={() => navigate("/")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Início
              </Button>
              <Button variant="destructive" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dishes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white shadow-sm">
            <TabsTrigger value="dishes" className="flex items-center gap-2">
              <Menu className="w-4 h-4" />
              Gerenciar Pratos
            </TabsTrigger>
            <TabsTrigger value="restaurant" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configurações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dishes">
            <DishManager restaurant={restaurant} />
          </TabsContent>

          <TabsContent value="restaurant">
            <RestaurantSettings restaurant={restaurant} onUpdate={setRestaurant} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
