import { Activity } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-gradient-hero rounded-lg flex items-center justify-center">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">DentalPro</span>
            </div>
            <p className="text-background/70">
              Sistema completo para gestão de clínicas odontológicas modernas.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Produto</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">Recursos</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">Preços</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">Segurança</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">Integrações</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Empresa</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">Sobre nós</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">Blog</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">Carreiras</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">Contato</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Suporte</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">Central de Ajuda</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">Documentação</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">Status</a></li>
              <li><a href="#" className="text-background/70 hover:text-background transition-colors">LGPD</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/20 mt-8 pt-8 text-center">
          <p className="text-background/70">
            © 2024 DentalPro. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;