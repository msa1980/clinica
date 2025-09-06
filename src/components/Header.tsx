import { Button } from "@/components/ui/button";
import { Activity, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-gradient-hero rounded-lg flex items-center justify-center">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-foreground">DentalPro</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8">
          <a href="#recursos" className="text-muted-foreground hover:text-primary transition-colors">
            Recursos
          </a>
          <a href="#precos" className="text-muted-foreground hover:text-primary transition-colors">
            Preços
          </a>
          <a href="#sobre" className="text-muted-foreground hover:text-primary transition-colors">
            Sobre
          </a>
          <a href="#contato" className="text-muted-foreground hover:text-primary transition-colors">
            Contato
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="hidden md:inline-flex"
            onClick={() => navigate("/auth")}
          >
            Entrar
          </Button>
          <Button 
            variant="hero" 
            size="sm"
            onClick={() => navigate("/auth")}
          >
            Começar Grátis
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;