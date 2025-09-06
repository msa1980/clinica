import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CreditCard, Calendar, DollarSign, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import AsaasService from "@/integrations/asaas/client";

interface SubscriptionRequiredProps {
  subscription?: any;
}

const SubscriptionRequired = ({ subscription }: SubscriptionRequiredProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isGeneratingPayment, setIsGeneratingPayment] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

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

  const handleRenewSubscription = async () => {
    if (!subscription) {
      toast({
        title: "Erro",
        description: "Não foi possível encontrar os dados da assinatura.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingPayment(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      // Get or create Asaas customer
      let asaasCustomerId = null;

      // Check if user has Asaas customer ID in dados_cliente
      const { data: existingCustomer } = await supabase
        .from('dados_cliente')
        .select('asaas_customer_id')
        .eq('email', user.email)
        .single();

      if (existingCustomer?.asaas_customer_id) {
        asaasCustomerId = existingCustomer.asaas_customer_id;
      } else {
        // Create new customer in Asaas
        const asaasCustomer = await AsaasService.createCustomer({
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
          email: user.email || '',
          cpfCnpj: "00000000000", // This should be collected during registration
          personType: 'FISICA'
        });
        asaasCustomerId = asaasCustomer.id;

        // Save Asaas customer ID
        await supabase
          .from('dados_cliente')
          .upsert({
            email: user.email,
            nome: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
            asaas_customer_id: asaasCustomerId
          });
      }

      if (!asaasCustomerId) {
        throw new Error("Não foi possível criar o cliente no Asaas");
      }

      // Calculate next due date (1 month from now)
      const nextDueDate = new Date();
      nextDueDate.setMonth(nextDueDate.getMonth() + 1);

      // Create subscription renewal
      const asaasSubscription = await AsaasService.createSubscription({
        customer: asaasCustomerId,
        billingType: subscription.monthly_fee.billing_type || 'BOLETO',
        value: subscription.monthly_fee.value,
        nextDueDate: nextDueDate.toISOString().split('T')[0],
        description: `Renovação: ${subscription.monthly_fee.description}`,
        cycle: 'MONTHLY'
      });

      // Note: Database update will be handled by webhook or manual sync
      // For now, we just generate the payment link

      // Generate payment link
      if (asaasSubscription.paymentLink) {
        setPaymentUrl(asaasSubscription.paymentLink);
        toast({
          title: "Link de pagamento gerado!",
          description: "Clique no botão abaixo para realizar o pagamento.",
        });
      } else {
        // If no payment link, redirect to Asaas dashboard or show success message
        toast({
          title: "Renovação solicitada!",
          description: "Aguarde a confirmação do pagamento para restaurar o acesso.",
        });
        // Refresh the page to check subscription status
        setTimeout(() => window.location.reload(), 2000);
      }

    } catch (error) {
      console.error('Error renewing subscription:', error);
      toast({
        title: "Erro na renovação",
        description: "Não foi possível processar a renovação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPayment(false);
    }
  };

  const handlePayNow = () => {
    if (paymentUrl) {
      window.open(paymentUrl, '_blank');
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