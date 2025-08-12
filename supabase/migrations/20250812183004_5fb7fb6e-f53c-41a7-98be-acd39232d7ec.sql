
-- Create restaurants table
CREATE TABLE public.restaurants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#f97316',
  secondary_color TEXT DEFAULT '#16a34a',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dishes table
CREATE TABLE public.dishes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  full_description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  calories INTEGER,
  protein INTEGER,
  carbs INTEGER,
  fat INTEGER,
  tags TEXT[] DEFAULT '{}',
  diet_tags TEXT[] DEFAULT '{}',
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create restaurant_owners table for authentication
CREATE TABLE public.restaurant_owners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'owner',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, restaurant_id)
);

-- Enable Row Level Security
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_owners ENABLE ROW LEVEL SECURITY;

-- RLS Policies for restaurants (public read, owner write)
CREATE POLICY "Anyone can view restaurants" 
  ON public.restaurants 
  FOR SELECT 
  USING (true);

CREATE POLICY "Restaurant owners can update their restaurant" 
  ON public.restaurants 
  FOR UPDATE 
  USING (
    id IN (
      SELECT restaurant_id 
      FROM public.restaurant_owners 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create restaurants" 
  ON public.restaurants 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for dishes (public read, owner write)
CREATE POLICY "Anyone can view available dishes" 
  ON public.dishes 
  FOR SELECT 
  USING (is_available = true);

CREATE POLICY "Restaurant owners can manage their dishes" 
  ON public.dishes 
  FOR ALL 
  USING (
    restaurant_id IN (
      SELECT restaurant_id 
      FROM public.restaurant_owners 
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for restaurant_owners
CREATE POLICY "Users can view their own restaurant ownership" 
  ON public.restaurant_owners 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create restaurant ownership" 
  ON public.restaurant_owners 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- Insert sample restaurant data
INSERT INTO public.restaurants (id, name, description, logo_url, primary_color, secondary_color) 
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'Bistrô Verde',
  'Culinária saudável e saborosa',
  NULL,
  '#16a34a',
  '#f97316'
);

-- Insert sample dishes
INSERT INTO public.dishes (restaurant_id, name, description, full_description, price, calories, protein, carbs, fat, tags, diet_tags) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Salmão Grelhado com Quinoa', 'Salmão fresco grelhado servido com quinoa orgânica e legumes salteados', 'Delicioso salmão grelhado no ponto perfeito, acompanhado de quinoa orgânica e mix de legumes frescos salteados no azeite de oliva extra virgem. Rico em ômega-3 e proteínas de alta qualidade.', 42.90, 420, 35, 25, 18, ARRAY['Low Carb', 'Rico em Proteína'], ARRAY['sem-gluten']),
('550e8400-e29b-41d4-a716-446655440000', 'Bowl Vegano Power', 'Tigela nutritiva com grão-de-bico, abacate, tomate cereja e tahine', 'Bowl completo e nutritivo com grão-de-bico temperado, abacate cremoso, tomate cereja, folhas verdes e molho de tahine artesanal. Uma explosão de sabores e nutrientes.', 28.50, 380, 15, 35, 22, ARRAY['Vegano', 'Rico em Fibras'], ARRAY['vegano', 'vegetariano', 'sem-gluten', 'sem-lactose']),
('550e8400-e29b-41d4-a716-446655440000', 'Frango Keto com Brócolis', 'Peito de frango suculento com brócolis no vapor e manteiga de ervas', 'Peito de frango grelhado temperado com ervas finas, acompanhado de brócolis cozido no vapor e finalizado com manteiga de ervas aromáticas. Ideal para dieta cetogênica.', 35.80, 310, 42, 8, 12, ARRAY['Keto', 'High Protein'], ARRAY['keto', 'low-carb', 'sem-gluten', 'sem-lactose']),
('550e8400-e29b-41d4-a716-446655440000', 'Salada Caesar Vegetariana', 'Mix de folhas com croutons integrais, queijo parmesão e molho caesar', 'Refrescante salada caesar com mix de folhas selecionadas, croutons artesanais integrais, queijo parmesão ralado na hora e nosso exclusivo molho caesar vegetariano.', 24.90, 280, 12, 18, 20, ARRAY['Vegetariano', 'Leve'], ARRAY['vegetariano']);
