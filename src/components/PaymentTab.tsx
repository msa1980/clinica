import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AsaasService } from '@/integrations/asaas/client';
import { 
  CreditCard, 
  Smartphone, 
  QrCode, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  RefreshCw,
  ExternalLink,
  Copy,
  Banknote
} from 'lucide-react';

interface PaymentMethod {
  id: string;
  name: string;
  icon: any;
  description: string;
  enabled: boolean;
}

interface PaymentData {
  id: string;
  value: number;
  description: string;
  dueDate: string;
  status: string;
  invoiceUrl?: string;
  bankSlipUrl?: string;
  pixQrCode?: string;
  pixQrCodeUrl?: string;
  paymentLink?: string;
}

export const PaymentTab = () => {
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>('pix');
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'pix',
      name: 'PIX',
      icon: Smartphone,
      description: 'Pagamento instantâneo via PIX',
      enabled: true
    },
    {
      id: 'credit_card',
      name: 'Cartão de Crédito',
      icon: CreditCard,
      description: 'Parcelamento em até 12x',
      enabled: true
    },
    {
      id: 'boleto',
      name: 'Boleto Bancário',
      icon: Banknote,
      description: 'Vencimento em 3 dias úteis',
      enabled: true
    }
  ];

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const createPayment = async () => {
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    
    try {
      console.log('🔄 Criando pagamento via Asaas...');
      
      // Primeiro, criar ou buscar cliente no Asaas
      let asaasCustomerId = user.email;
      
      try {
        // Tentar criar cliente (se já existir, o Asaas retornará o existente)
        const customerData = {
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Cliente',
          email: user.email,
          cpfCnpj: '00000000000', // CPF padrão para testes
          personType: 'FISICA' as const
        };
        
        const customer = await AsaasService.createCustomer(customerData);
        asaasCustomerId = customer.id;
        console.log('✅ Cliente Asaas:', customer);
      } catch (error) {
        console.log('⚠️ Usando email como customer ID:', user.email);
        asaasCustomerId = user.email;
      }
      
      // Dados do pagamento
      const paymentRequest = {
        customer: asaasCustomerId,
        billingType: selectedMethod === 'pix' ? 'PIX' : 
                    selectedMethod === 'credit_card' ? 'CREDIT_CARD' : 'BOLETO',
        value: 29.90, // Valor da mensalidade
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 dias
        description: 'Mensalidade DentalPro - Acesso Premium',
        externalReference: `subscription_${user.id}_${Date.now()}`
      };

      console.log('📋 Dados do pagamento:', paymentRequest);
      
      const payment = await AsaasService.createPayment(paymentRequest);
      
      console.log('✅ Pagamento criado:', payment);
      
      // Estruturar dados do pagamento
      const paymentInfo: PaymentData = {
        id: payment.id,
        value: payment.value,
        description: payment.description,
        dueDate: payment.dueDate,
        status: payment.status,
        invoiceUrl: payment.invoiceUrl,
        bankSlipUrl: payment.bankSlipUrl,
        pixQrCode: payment.pixQrCode,
        pixQrCodeUrl: payment.pixQrCodeUrl,
        paymentLink: payment.invoiceUrl || payment.bankSlipUrl || payment.pixQrCodeUrl
      };
      
      setPaymentData(paymentInfo);
      
      toast({
        title: 'Sucesso!',
        description: 'Pagamento criado com sucesso. Escolha sua forma de pagamento.',
      });
      
    } catch (error) {
      console.error('❌ Erro ao criar pagamento:', error);
      toast({
        title: 'Erro ao criar pagamento',
        description: 'Tente novamente em alguns instantes.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const copyPixCode = () => {
    if (paymentData?.pixQrCode) {
      navigator.clipboard.writeText(paymentData.pixQrCode);
      toast({
        title: 'Copiado!',
        description: 'Código PIX copiado para a área de transferência.',
      });
    }
  };

  const openPaymentLink = () => {
    if (paymentData?.paymentLink) {
      window.open(paymentData.paymentLink, '_blank');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
      case 'received':
        return <Badge variant="outline" className="text-green-600"><CheckCircle className="w-3 h-3 mr-1" />Pago</Badge>;
      case 'overdue':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Vencido</Badge>;
      default:
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Aguardando</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Central de Pagamentos
        </h2>
        <p className="text-muted-foreground">
          Gerencie seus pagamentos e renove sua assinatura
        </p>
      </div>

      {/* Status da Assinatura */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Status da Assinatura
          </CardTitle>
          <CardDescription>
            Informações sobre sua assinatura atual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Plano Premium DentalPro</p>
              <p className="text-sm text-muted-foreground">R$ 29,90/mês</p>
            </div>
            <Badge variant="outline" className="text-yellow-600">
              <AlertCircle className="w-3 h-3 mr-1" />
              Renovação Necessária
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Métodos de Pagamento */}
      <Card>
        <CardHeader>
          <CardTitle>Escolha o Método de Pagamento</CardTitle>
          <CardDescription>
            Selecione como deseja renovar sua assinatura
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              return (
                <Card 
                  key={method.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedMethod === method.id 
                      ? 'ring-2 ring-primary border-primary' 
                      : 'border-border'
                  } ${!method.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => method.enabled && setSelectedMethod(method.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{method.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {method.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Button 
            onClick={createPayment} 
            disabled={loading || !selectedMethod}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              'Gerar Pagamento'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Dados do Pagamento */}
      {paymentData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Detalhes do Pagamento</span>
              {getStatusBadge(paymentData.status)}
            </CardTitle>
            <CardDescription>
              ID: {paymentData.id}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valor</p>
                <p className="text-lg font-bold text-green-600">
                  R$ {paymentData.value.toFixed(2).replace('.', ',')}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vencimento</p>
                <p className="text-lg font-semibold">
                  {new Date(paymentData.dueDate).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Descrição</p>
              <p>{paymentData.description}</p>
            </div>

            {/* PIX */}
            {selectedMethod === 'pix' && paymentData.pixQrCode && (
              <div className="space-y-4">
                <Separator />
                <div className="text-center">
                  <h4 className="font-semibold mb-2 flex items-center justify-center gap-2">
                    <QrCode className="h-4 w-4" />
                    Pagamento via PIX
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Escaneie o QR Code ou copie o código PIX
                  </p>
                  
                  {paymentData.pixQrCodeUrl && (
                    <div className="mb-4">
                      <img 
                        src={paymentData.pixQrCodeUrl} 
                        alt="QR Code PIX" 
                        className="mx-auto max-w-48 border rounded-lg"
                      />
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button onClick={copyPixCode} variant="outline" className="flex-1">
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar Código PIX
                    </Button>
                    {paymentData.paymentLink && (
                      <Button onClick={openPaymentLink} className="flex-1">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Abrir Pagamento
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Cartão de Crédito ou Boleto */}
            {(selectedMethod === 'credit_card' || selectedMethod === 'boleto') && paymentData.paymentLink && (
              <div className="space-y-4">
                <Separator />
                <div className="text-center">
                  <h4 className="font-semibold mb-2">
                    {selectedMethod === 'credit_card' ? 'Pagamento com Cartão' : 'Boleto Bancário'}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    {selectedMethod === 'credit_card' 
                      ? 'Clique no botão abaixo para inserir os dados do cartão'
                      : 'Clique no botão abaixo para visualizar e imprimir o boleto'
                    }
                  </p>
                  
                  <Button onClick={openPaymentLink} size="lg" className="w-full">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    {selectedMethod === 'credit_card' ? 'Pagar com Cartão' : 'Visualizar Boleto'}
                  </Button>
                </div>
              </div>
            )}

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Após o pagamento, sua assinatura será renovada automaticamente e você terá acesso completo à plataforma.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
};