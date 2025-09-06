import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Star } from "lucide-react";

const plans = [
  {
    name: "Essencial",
    price: "R$ 97",
    period: "/mês",
    description: "Perfeito para consultórios pequenos",
    features: [
      "Até 500 pacientes",
      "Agenda básica",
      "Prontuário digital",
      "Suporte por e-mail",
      "1 usuário"
    ],
    popular: false
  },
  {
    name: "Profissional",
    price: "R$ 197",
    period: "/mês",
    description: "Ideal para clínicas em crescimento",
    features: [
      "Pacientes ilimitados",
      "Agenda avançada",
      "Relatórios completos",
      "WhatsApp integrado",
      "Até 5 usuários",
      "Backup automático"
    ],
    popular: true
  },
  {
    name: "Enterprise",
    price: "R$ 397",
    period: "/mês",
    description: "Para redes de clínicas",
    features: [
      "Multi-clínicas",
      "API personalizada",
      "Suporte prioritário",
      "Usuários ilimitados",
      "Dashboard executivo",
      "Integração completa"
    ],
    popular: false
  }
];

const PricingSection = () => {
  return (
    <section id="precos" className="py-20 bg-gradient-feature">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground">
            Planos que crescem com você
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Escolha o plano ideal para sua clínica. Todos incluem 30 dias grátis
            para você testar sem compromisso.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index}
              className={`relative p-8 bg-gradient-card border-0 shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-2 ${
                plan.popular ? 'ring-2 ring-primary' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-hero text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    Mais Popular
                  </div>
                </div>
              )}
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
                  <p className="text-muted-foreground">{plan.description}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <div className="h-5 w-5 bg-success rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  variant={plan.popular ? "hero" : "default"} 
                  className="w-full"
                  size="lg"
                >
                  Começar Teste Grátis
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            Todos os planos incluem 30 dias grátis • Cancele a qualquer momento • Sem taxa de setup
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;