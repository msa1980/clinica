import { Calendar, Users, FileText, MessageSquare, Shield, BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Users,
    title: "Gestão de Pacientes",
    description: "Cadastro completo com histórico médico, fotos e documentos organizados."
  },
  {
    icon: Calendar,
    title: "Agenda Inteligente",
    description: "Agendamento online, lembretes automáticos e controle de disponibilidade."
  },
  {
    icon: FileText,
    title: "Prontuário Digital",
    description: "Prontuários eletrônicos seguros com backup automático na nuvem."
  },
  {
    icon: MessageSquare,
    title: "Comunicação",
    description: "WhatsApp e e-mail integrados para lembretes e confirmações."
  },
  {
    icon: Shield,
    title: "Segurança LGPD",
    description: "Dados protegidos com criptografia e conformidade total com a LGPD."
  },
  {
    icon: BarChart3,
    title: "Relatórios",
    description: "Analytics completos de faturamento, pacientes e performance."
  }
];

const FeaturesSection = () => {
  return (
    <section id="recursos" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground">
            Tudo que sua clínica precisa
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Funcionalidades desenvolvidas especificamente para otimizar a gestão
            de clínicas odontológicas modernas.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="p-8 bg-gradient-card border-0 shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-1"
            >
              <div className="space-y-4">
                <div className="h-12 w-12 bg-gradient-hero rounded-xl flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;