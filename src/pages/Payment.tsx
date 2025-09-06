import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CreditCard, Calendar, DollarSign, RefreshCw, ArrowLeft, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AsaasService from "@/integrations/asaas/client";

const Payment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [isGeneratingPayment, setIsGeneratingPayment] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserAndSubscription();
  }, []);

  const loadUserAndSubscription = async () => {
    try {
      // Get current user
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        navigate('/auth');
        return;
      }
      setUser(currentUser);

      // Get user subscription
      const { data: subscriptionData } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          monthly_fee:monthly_fees(*)
        `)
        .eq('user_id', currentUser.id)
        .single();

      if (subscriptionData) {
        setSubscription(subscriptionData);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do usuário.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePayment = async () => {
    if (!user || !subscription) {
      toast({
        title: "Erro",
        description: "Dados do usuário ou assinatura não encontrados.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingPayment(true);

    try {
      console.log('Generating payment for user:', user.email);
      console.log('Subscription data:', subscription);

      // Get or create Asaas customer
      let asaasCustomerId = null;

      // Check if user has Asaas customer ID
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

      // Create payment data
      const paymentData = {
        customer: asaasCustomerId,
        billingType: subscription.monthly_fee.billing_type || 'PIX',
        value: subscription.monthly_fee.value,
        dueDate: nextDueDate.toISOString().split('T')[0],
        description: `Renovação: ${subscription.monthly_fee.description}`,
        externalReference: `renewal_${user.id}_${Date.now()}`
      };

      console.log('Payment data to be sent:', paymentData);

      // Create payment using AsaasService
      const paymentResult = await AsaasService.createPayment(paymentData);

      console.log('Payment result from Asaas:', paymentResult);

      // Get payment link
      let paymentLink = paymentResult.invoiceUrl || paymentResult.bankSlipUrl;

      // For PIX payments, use the QR code URL or payment URL
      if (paymentData.billingType === 'PIX' && paymentResult.pixQrCodeUrl) {
        paymentLink = paymentResult.pixQrCodeUrl;
      }

      if (paymentLink) {
        setPaymentUrl(paymentLink);
        toast({
          title: "Link de pagamento gerado!",
          description: `Pagamento criado com sucesso! Valor: R$ ${paymentResult.value}`,
        });
      } else {
        throw new Error("Não foi possível gerar o link de pagamento");
      }

    } catch (error: any) {
      console.error('Error generating payment:', error);
      console.error('Error response:', error.response?.data);

      let errorMessage = "Não foi possível gerar o pagamento. Tente novamente.";

      if (error.response?.status === 401) {
        errorMessage = "Erro de autenticação com o Asaas. Verifique a configuração.";
      } else if (error.response?.status === 400) {
        errorMessage = "Dados inválidos enviados para o Asaas.";
      } else if (error.response?.data?.errors) {
        errorMessage = error.response.data.errors[0]?.description || errorMessage;
      }

      toast({
        title: "Erro na geração do pagamento",
        description: errorMessage,
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-primary/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <RefreshCw className="w-6 h-6 animate-spin" />
              <span className="ml-2">Carregando...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-primary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-0 bg-card/95 backdrop-blur">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
          </div>
          
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <CreditCard className="w-8 h-8 text-primary" />
          </div>
          
          <CardTitle className="text-2xl font-bold text-foreground">
            Renovação de Assinatura
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Renove sua assinatura para continuar usando todos os recursos
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {subscription && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Plano Atual:</span>
                <Badge variant="secondary">{subscription.monthly_fee.description}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="font-medium">Valor Mensal:</span>
                <span className="text-lg font-bold text-primary">
                  {formatCurrency(subscription.monthly_fee.value)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="font-medium">Status:</span>
                <Badge variant={subscription.status === 'active' ? 'default' : 'destructive'}>
                  {subscription.status === 'active' ? 'Ativo' : 'Expirado'}
                </Badge>
              </div>
              
              {subscription.expires_at && (
                <div className="flex items-center justify-between">
                  <span className="font-medium">Expira em:</span>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(subscription.expires_at)}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Como funciona a renovação:
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Clique em "Gerar Link de Pagamento"</li>
              <li>• Será criado um link de pagamento seguro</li>
              <li>• Efetue o pagamento através do link</li>
              <li>• Sua assinatura será renovada automaticamente</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            {!paymentUrl && (
              <Button
                onClick={handleGeneratePayment}
                disabled={isGeneratingPayment}
                className="w-full h-12 text-base"
                size="lg"
              >
                {isGeneratingPayment ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Gerando Link de Pagamento...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Gerar Link de Pagamento
                  </>
                )}
              </Button>
            )}

            {paymentUrl && (
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-medium mb-2">✅ Link de pagamento gerado com sucesso!</p>
                  <p className="text-sm text-green-700">
                    Clique no botão abaixo para abrir a página de pagamento em uma nova aba.
                  </p>
                </div>
                
                <Button
                  onClick={handlePayNow}
                  className="w-full h-12 text-base bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Abrir Página de Pagamento
                </Button>
                
                <Button
                  onClick={() => {
                    setPaymentUrl(null);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Gerar Novo Link
                </Button>
              </div>
            )}
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Precisa de ajuda? Entre em contato com nosso suporte.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Payment;