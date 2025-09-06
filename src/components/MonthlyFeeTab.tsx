import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Search, Plus, Eye, Edit, Trash2, CreditCard, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AsaasService from "@/integrations/asaas/client";

interface MonthlyFee {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  value: number;
  description: string;
  billingType: 'BOLETO' | 'CREDIT_CARD' | 'PIX' | 'UNDEFINED';
  cycle: 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUALLY' | 'YEARLY';
  status: 'ACTIVE' | 'INACTIVE' | 'CANCELLED';
  asaasSubscriptionId?: string;
  nextDueDate: Date;
  createdAt: Date;
}

const MonthlyFeeTab = () => {
  const [monthlyFees, setMonthlyFees] = useState<MonthlyFee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewFeeOpen, setIsNewFeeOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<MonthlyFee | null>(null);
  const [isViewFeeOpen, setIsViewFeeOpen] = useState(false);
  const { toast } = useToast();

  // Form states for new monthly fee
  const [patientId, setPatientId] = useState("");
  const [value, setValue] = useState("");
  const [description, setDescription] = useState("");
  const [billingType, setBillingType] = useState<'BOLETO' | 'CREDIT_CARD' | 'PIX' | 'UNDEFINED'>('BOLETO');
  const [cycle, setCycle] = useState<'MONTHLY' | 'QUARTERLY' | 'SEMIANNUALLY' | 'YEARLY'>('MONTHLY');
  const [nextDueDate, setNextDueDate] = useState<Date>();
  const [patients, setPatients] = useState<any[]>([]);

  useEffect(() => {
    loadMonthlyFees();
    loadPatients();
  }, []);

  const loadMonthlyFees = async () => {
    try {
      const { data, error } = await supabase
        .from('monthly_fees')
        .select(`
          *,
          patients:patient_id (
            name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const fees: MonthlyFee[] = (data || []).map(fee => ({
        id: fee.id,
        patientId: fee.patient_id,
        patientName: fee.patients?.name || 'Paciente não encontrado',
        patientEmail: fee.patients?.email || '',
        value: parseFloat(fee.value),
        description: fee.description,
        billingType: fee.billing_type as any,
        cycle: fee.cycle as any,
        status: fee.status as any,
        asaasSubscriptionId: fee.asaas_subscription_id,
        nextDueDate: new Date(fee.next_due_date),
        createdAt: new Date(fee.created_at)
      }));

      setMonthlyFees(fees);
    } catch (error) {
      console.error('Error loading monthly fees:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar mensalidades.",
        variant: "destructive",
      });
    }
  };

  const loadPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, name, email')
        .limit(100);

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error loading patients:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar pacientes.",
        variant: "destructive",
      });
    }
  };

  const filteredFees = monthlyFees.filter(fee =>
    fee.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fee.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateMonthlyFee = async () => {
    if (!patientId || !value || !description || !nextDueDate) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      const selectedPatient = patients.find(p => p.id === patientId);
      if (!selectedPatient) {
        throw new Error("Paciente não encontrado");
      }

      // Create customer in Asaas if not exists
      let asaasCustomerId = null;
      try {
        // Check if customer already exists in dados_cliente
        const { data: existingCustomer } = await supabase
          .from('dados_cliente')
          .select('asaas_customer_id')
          .eq('email', selectedPatient.email)
          .single();

        if (existingCustomer?.asaas_customer_id) {
          asaasCustomerId = existingCustomer.asaas_customer_id;
        } else {
          // Create new customer in Asaas
          const asaasCustomer = await AsaasService.createCustomer({
            name: selectedPatient.name,
            email: selectedPatient.email,
            cpfCnpj: "00000000000", // This should come from patient data
            personType: 'FISICA'
          });
          asaasCustomerId = asaasCustomer.id;

          // Save Asaas customer ID to dados_cliente
          await supabase
            .from('dados_cliente')
            .upsert({
              email: selectedPatient.email,
              nome: selectedPatient.name,
              asaas_customer_id: asaasCustomerId
            });
        }
      } catch (error) {
        console.error('Error with Asaas customer:', error);
        // Continue without Asaas integration for now
      }

      // Create subscription in Asaas
      let asaasSubscriptionId = null;
      if (asaasCustomerId) {
        try {
          const subscription = await AsaasService.createSubscription({
            customer: asaasCustomerId,
            billingType,
            value: parseFloat(value),
            nextDueDate: format(nextDueDate, 'yyyy-MM-dd'),
            description,
            cycle
          });
          asaasSubscriptionId = subscription.id;
        } catch (error) {
          console.error('Error creating Asaas subscription:', error);
          toast({
            title: "Aviso",
            description: "Mensalidade criada, mas houve erro na integração com Asaas.",
            variant: "destructive",
          });
        }
      }

      // Create monthly fee record in Supabase
      const { data: newFeeData, error: insertError } = await supabase
        .from('monthly_fees')
        .insert({
          patient_id: patientId,
          value: parseFloat(value),
          description,
          billing_type: billingType,
          cycle,
          status: 'ACTIVE',
          asaas_subscription_id: asaasSubscriptionId,
          asaas_customer_id: asaasCustomerId,
          next_due_date: format(nextDueDate, 'yyyy-MM-dd')
        })
        .select(`
          *,
          patients:patient_id (
            name,
            email
          )
        `)
        .single();

      if (insertError) throw insertError;

      // Add to local state
      const newFee: MonthlyFee = {
        id: newFeeData.id,
        patientId: newFeeData.patient_id,
        patientName: newFeeData.patients?.name || selectedPatient.name,
        patientEmail: newFeeData.patients?.email || selectedPatient.email,
        value: parseFloat(newFeeData.value),
        description: newFeeData.description,
        billingType: newFeeData.billing_type as any,
        cycle: newFeeData.cycle as any,
        status: newFeeData.status as any,
        asaasSubscriptionId: newFeeData.asaas_subscription_id,
        nextDueDate: new Date(newFeeData.next_due_date),
        createdAt: new Date(newFeeData.created_at)
      };

      setMonthlyFees([newFee, ...monthlyFees]);

      // Clear form
      setPatientId("");
      setValue("");
      setDescription("");
      setBillingType('BOLETO');
      setCycle('MONTHLY');
      setNextDueDate(undefined);
      setSelectedFee(null);

      setIsNewFeeOpen(false);

      toast({
        title: "Sucesso!",
        description: "Mensalidade criada com sucesso.",
      });
    } catch (error) {
      console.error('Error creating monthly fee:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar mensalidade.",
        variant: "destructive",
      });
    }
  };

  const handleViewFee = (fee: MonthlyFee) => {
    setSelectedFee(fee);
    setIsViewFeeOpen(true);
  };

  const handleCancelFee = async (feeId: string) => {
    try {
      const fee = monthlyFees.find(f => f.id === feeId);
      if (fee?.asaasSubscriptionId) {
        await AsaasService.cancelSubscription(fee.asaasSubscriptionId);
      }

      // Update in Supabase
      const { error: updateError } = await supabase
        .from('monthly_fees')
        .update({ status: 'CANCELLED' })
        .eq('id', feeId);

      if (updateError) throw updateError;

      // Update local state
      setMonthlyFees(monthlyFees.map(f =>
        f.id === feeId ? { ...f, status: 'CANCELLED' as const } : f
      ));

      toast({
        title: "Sucesso!",
        description: "Mensalidade cancelada com sucesso.",
      });
    } catch (error) {
      console.error('Error canceling monthly fee:', error);
      toast({
        title: "Erro",
        description: "Erro ao cancelar mensalidade.",
        variant: "destructive",
      });
    }
  };

  const handleSyncPaymentStatus = async (feeId: string) => {
    try {
      const fee = monthlyFees.find(f => f.id === feeId);
      if (!fee?.asaasSubscriptionId) {
        toast({
          title: "Aviso",
          description: "Esta mensalidade não possui integração com Asaas.",
        });
        return;
      }

      // Get subscription details from Asaas
      const subscription = await AsaasService.getSubscription(fee.asaasSubscriptionId);

      // Get payment history
      const payments = await AsaasService.getSubscriptionPayments(fee.asaasSubscriptionId);

      // Update local status based on Asaas data
      const updatedStatus = subscription.status === 'ACTIVE' ? 'ACTIVE' :
                           subscription.status === 'EXPIRED' ? 'INACTIVE' : 'CANCELLED';

      // Update in Supabase
      const { error: updateError } = await supabase
        .from('monthly_fees')
        .update({ status: updatedStatus })
        .eq('id', feeId);

      if (updateError) throw updateError;

      // Update local state
      setMonthlyFees(monthlyFees.map(f =>
        f.id === feeId ? { ...f, status: updatedStatus as any } : f
      ));

      toast({
        title: "Sucesso!",
        description: "Status de pagamento sincronizado com Asaas.",
      });
    } catch (error) {
      console.error('Error syncing payment status:', error);
      toast({
        title: "Erro",
        description: "Erro ao sincronizar status de pagamento.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Mensalidades</h2>
          <p className="text-muted-foreground">Gerencie mensalidades e assinaturas dos pacientes</p>
        </div>
        <Dialog open={isNewFeeOpen} onOpenChange={setIsNewFeeOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Mensalidade
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Cadastrar Nova Mensalidade</DialogTitle>
              <DialogDescription>
                Configure a mensalidade para o paciente
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patient">Paciente *</Label>
                  <Select value={patientId} onValueChange={setPatientId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o paciente" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">Valor (R$) *</Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="150.00"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição *</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Plano odontológico básico"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Forma de Pagamento</Label>
                  <Select value={billingType} onValueChange={(value: any) => setBillingType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BOLETO">Boleto</SelectItem>
                      <SelectItem value="PIX">PIX</SelectItem>
                      <SelectItem value="CREDIT_CARD">Cartão de Crédito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Ciclo</Label>
                  <Select value={cycle} onValueChange={(value: any) => setCycle(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MONTHLY">Mensal</SelectItem>
                      <SelectItem value="QUARTERLY">Trimestral</SelectItem>
                      <SelectItem value="SEMIANNUALLY">Semestral</SelectItem>
                      <SelectItem value="YEARLY">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Próximo Vencimento</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !nextDueDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {nextDueDate ? format(nextDueDate, "PPP", { locale: ptBR }) : "Selecione a data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={nextDueDate}
                        onSelect={setNextDueDate}
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsNewFeeOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleCreateMonthlyFee}>
                Criar Mensalidade
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por paciente ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Monthly Fees Table */}
      <Card>
        <CardHeader>
          <CardTitle>Mensalidades Ativas</CardTitle>
          <CardDescription>
            {filteredFees.length} mensalidade(s) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Ciclo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Próximo Vencimento</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFees.map((fee) => (
                <TableRow key={fee.id}>
                  <TableCell className="font-medium">{fee.patientName}</TableCell>
                  <TableCell>{fee.description}</TableCell>
                  <TableCell>R$ {fee.value.toFixed(2)}</TableCell>
                  <TableCell>{fee.cycle === 'MONTHLY' ? 'Mensal' : fee.cycle === 'QUARTERLY' ? 'Trimestral' : fee.cycle === 'SEMIANNUALLY' ? 'Semestral' : 'Anual'}</TableCell>
                  <TableCell>
                    <Badge
                      variant={fee.status === 'ACTIVE' ? 'default' : fee.status === 'INACTIVE' ? 'secondary' : 'destructive'}
                    >
                      {fee.status === 'ACTIVE' ? 'Ativa' : fee.status === 'INACTIVE' ? 'Inativa' : 'Cancelada'}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(fee.nextDueDate, "dd/MM/yyyy")}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewFee(fee)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {fee.asaasSubscriptionId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSyncPaymentStatus(fee.id)}
                          title="Sincronizar status com Asaas"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      )}
                      {fee.status === 'ACTIVE' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelFee(fee.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Fee Dialog */}
      <Dialog open={isViewFeeOpen} onOpenChange={setIsViewFeeOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalhes da Mensalidade</DialogTitle>
            <DialogDescription>
              Informações completas da mensalidade
            </DialogDescription>
          </DialogHeader>

          {selectedFee && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Paciente</Label>
                  <p className="text-sm text-muted-foreground">{selectedFee.patientName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-muted-foreground">{selectedFee.patientEmail}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Valor</Label>
                  <p className="text-sm text-muted-foreground">R$ {selectedFee.value.toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Ciclo</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedFee.cycle === 'MONTHLY' ? 'Mensal' : selectedFee.cycle === 'QUARTERLY' ? 'Trimestral' : selectedFee.cycle === 'SEMIANNUALLY' ? 'Semestral' : 'Anual'}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Descrição</Label>
                <p className="text-sm text-muted-foreground">{selectedFee.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge
                    variant={selectedFee.status === 'ACTIVE' ? 'default' : selectedFee.status === 'INACTIVE' ? 'secondary' : 'destructive'}
                  >
                    {selectedFee.status === 'ACTIVE' ? 'Ativa' : selectedFee.status === 'INACTIVE' ? 'Inativa' : 'Cancelada'}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Próximo Vencimento</Label>
                  <p className="text-sm text-muted-foreground">{format(selectedFee.nextDueDate, "dd/MM/yyyy")}</p>
                </div>
              </div>

              {selectedFee.asaasSubscriptionId && (
                <div>
                  <Label className="text-sm font-medium">ID Asaas</Label>
                  <p className="text-sm text-muted-foreground font-mono">{selectedFee.asaasSubscriptionId}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setIsViewFeeOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export { MonthlyFeeTab };