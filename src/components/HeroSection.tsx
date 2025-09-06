import { Button } from "@/components/ui/button";
import { Play, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-dental-dashboard.jpg";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="pt-24 pb-20 bg-gradient-feature">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
                Gerencie sua{" "}
                <span className="bg-gradient-hero bg-clip-text text-transparent">
                  clínica odontológica
                </span>{" "}
                com eficiência
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Sistema completo para gestão de pacientes, agendamentos, prontuários digitais
                e muito mais. Simplifique sua rotina e melhore o atendimento.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="hero" 
                size="lg" 
                className="group"
                onClick={() => navigate("/auth")}
              >
                Começar Grátis
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg" className="group">
                <Play className="w-4 h-4 mr-2" />
                Ver Demonstração
              </Button>
            </div>

            <div className="flex items-center gap-8 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">Clínicas ativas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">50k+</div>
                <div className="text-sm text-muted-foreground">Pacientes cadastrados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">99%</div>
                <div className="text-sm text-muted-foreground">Satisfação</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-hero rounded-3xl transform rotate-3 opacity-20"></div>
            <div className="relative bg-gradient-card rounded-3xl p-8 shadow-medical">
              <img 
                src={heroImage} 
                alt="Dashboard DentalPro"
                className="w-full h-auto rounded-2xl shadow-hover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;