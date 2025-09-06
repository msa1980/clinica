import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CreditCard, Calendar, DollarSign, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import AsaasService from "@/integrations/asaas/client";

interface SubscriptionRequiredProps {
  subscription?: any;
}

const SubscriptionRequired = ({ subscription }: SubscriptionRequiredProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isGeneratingPayment, setIsGeneratingPayment] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  useEffect(() => {
    console.log('Payment URL changed:', paymentUrl);
  }, [paymentUrl]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate("/");
    }
  };

  const handleRenewSubscription = () => {
    console.log('Redirecting to payment page...');
    navigate('/payment');
  };

  const handlePayNow = () => {
    console.log('Pay Now button clicked, paymentUrl:', paymentUrl);
    if (paymentUrl) {
      window.open(paymentUrl, '_blank');
    } else {
      console.error('No payment URL available');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-primary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-card">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Assinatura Expirada
          </CardTitle>
          <CardDescription className="text-lg">
            Sua mensalidade venceu e o acesso ao painel foi bloqueado
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {subscription && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Detalhes da Última Assinatura
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Valor:</span>
                  <span className="font-medium">{formatCurrency(subscription.monthly_fee.value)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Venceu em:</span>
                  <span className="font-medium">{formatDate(subscription.monthly_fee.next_due_date)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge variant="destructive">Expirada</Badge>
              </div>

              <p className="text-sm text-muted-foreground">
                {subscription.monthly_fee.description}
              </p>
            </div>
          )}

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <h3 className="font-semibold text-foreground mb-2">
              Para restaurar o acesso:
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Clique em "Renovar Assinatura Agora"</li>
              <li>• Será gerado um link de pagamento</li>
              <li>• Efetue o pagamento no link gerado</li>
              <li>• O acesso será restaurado automaticamente</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            {!paymentUrl && (
              <Button
                onClick={handleRenewSubscription}
                disabled={isGeneratingPayment}
                className="w-full"
              >
                {isGeneratingPayment ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Gerando Link de Pagamento...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Renovar Assinatura Agora
                  </>
                )}
              </Button>
            )}

            {paymentUrl && (
              <Button
                onClick={handlePayNow}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Pagar Agora - Abrir Link de Pagamento
              </Button>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="flex-1"
              >
                Verificar Status
              </Button>
              <Button
                variant="destructive"
                onClick={handleLogout}
                className="flex-1"
              >
                Sair do Sistema
              </Button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Sistema de Gestão Clínica - Acesso Restrito
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { SubscriptionRequired };