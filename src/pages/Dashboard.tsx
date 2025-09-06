import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Activity, Calendar, Users, FileText, Settings, LogOut, Plus, Bell, Edit, Trash2, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { NewAppointmentModal } from "@/components/NewAppointmentModal";
import { NewPatientModal } from "@/components/NewPatientModal";
import { NewRecordModal } from "@/components/NewRecordModal";
import { ReportsModal } from "@/components/ReportsModal";
import { PatientManagementTab } from "@/components/PatientManagementTab";
import { SmartAgendaTab } from "@/components/SmartAgendaTab";
import { DigitalMedicalRecordTab } from "@/components/DigitalMedicalRecordTab";
import { ReportsTab } from "@/components/ReportsTab";
import { ProceduresTab } from "@/components/ProceduresTab";
import { MonthlyFeeTab } from "@/components/MonthlyFeeTab";
import { PaymentTab } from "@/components/PaymentTab";
import { useSubscription } from "@/hooks/useSubscription";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Clock } from "lucide-react";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [isNewPatientOpen, setIsNewPatientOpen] = useState(false);
  const [isNewRecordOpen, setIsNewRecordOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isViewAppointmentOpen, setIsViewAppointmentOpen] = useState(false);
  const { subscription } = useSubscription(user);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Logout realizado",
        description: "Até logo!",
      });
      navigate("/");
    }
  };

  const stats = [
    {
      title: "Pacientes Ativos",
      value: "247",
      icon: Users,
      change: "+12%",
      changeType: "positive"
    },
    {
      title: "Consultas Hoje",
      value: "18",
      icon: Calendar,
      change: "+5%",
      changeType: "positive"
    },
    {
      title: "Receita Mensal",
      value: "R$ 45.230",
      icon: Activity,
      change: "+8%",
      changeType: "positive"
    },
    {
      title: "Prontuários",
      value: "156",
      icon: FileText,
      change: "+3%",
      changeType: "positive"
    }
  ];

  const quickActions = [
    {
      title: "Nova Consulta",
      description: "Agendar nova consulta",
      icon: Plus,
      action: () => setIsNewAppointmentOpen(true)
    },
    {
      title: "Cadastrar Paciente",
      description: "Adicionar novo paciente",
      icon: Users,
      action: () => setIsNewPatientOpen(true)
    },
    {
      title: "Prontuário",
      description: "Criar novo prontuário",
      icon: FileText,
      action: () => setIsNewRecordOpen(true)
    },
    {
      title: "Relatórios",
      description: "Ver relatórios",
      icon: Activity,
      action: () => setIsReportsOpen(true)
    }
  ];

  const [upcomingAppointments, setUpcomingAppointments] = useState([
    {
      id: "1",
      time: "09:00",
      patient: "Maria Silva",
      procedure: "Limpeza",
      status: "confirmado"
    },
    {
      id: "2",
      time: "10:30",
      patient: "João Santos",
      procedure: "Consulta",
      status: "pendente"
    },
    {
      id: "3",
      time: "14:00",
      patient: "Ana Costa",
      procedure: "Tratamento Canal",
      status: "confirmado"
    },
    {
      id: "4",
      time: "15:30",
      patient: "Pedro Lima",
      procedure: "Extração",
      status: "confirmado"
    },
    {
      id: "5",
      time: "16:00",
      patient: "Carlos Oliveira",
      procedure: "Consulta",
      status: "cancelado"
    },
    {
      id: "6",
      time: "11:00",
      patient: "Lucia Ferreira",
      procedure: "Limpeza",
      status: "não compareceu"
    }
  ]);

  const handleViewAppointment = (appointment: any) => {
    setSelectedAppointment(appointment);
    setIsViewAppointmentOpen(true);
  };

  const handleEditAppointment = (appointment: any) => {
    setSelectedAppointment(appointment);
    setIsNewAppointmentOpen(true);
  };

  const handleDeleteAppointment = (appointmentId: string) => {
    setUpcomingAppointments(upcomingAppointments.filter(apt => apt.id !== appointmentId));
    toast({
      title: "Sucesso!",
      description: "Compromisso removido com sucesso.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-primary/10">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-gradient-hero rounded-lg flex items-center justify-center">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">DentalPro</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Olá, {user?.email?.split('@')[0] || 'Usuário'}</span>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Subscription Warning */}
        {subscription && (
          <div className="mb-6">
            <Alert className="border-orange-200 bg-orange-50">
              <Clock className="h-4 w-4" />
              <AlertDescription>
                <strong>Atenção:</strong> Sua mensalidade vence em{" "}
                {new Date(subscription.monthly_fee.next_due_date).toLocaleDateString('pt-BR')}.
                Valor: R$ {subscription.monthly_fee.value.toFixed(2)}
              </AlertDescription>
            </Alert>
          </div>
        )}

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="patients">Gestão de Pacientes</TabsTrigger>
            <TabsTrigger value="agenda">Agenda Inteligente</TabsTrigger>
            <TabsTrigger value="records">Prontuário Digital</TabsTrigger>
            <TabsTrigger value="procedures">Procedimentos</TabsTrigger>
            <TabsTrigger value="fees">Mensalidades</TabsTrigger>
            <TabsTrigger value="payments">Pagamentos</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-8">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Bem-vindo ao seu Dashboard
              </h1>
              <p className="text-muted-foreground">
                Gerencie sua clínica odontológica de forma eficiente
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index} className="shadow-card hover:shadow-hover transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            {stat.title}
                          </p>
                          <p className="text-2xl font-bold text-foreground">
                            {stat.value}
                          </p>
                          <p className={`text-xs ${
                            stat.changeType === 'positive' ? 'text-success' : 'text-destructive'
                          }`}>
                            {stat.change} vs mês anterior
                          </p>
                        </div>
                        <div className="h-12 w-12 bg-gradient-hero rounded-lg flex items-center justify-center">
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Quick Actions */}
              <div className="lg:col-span-1">
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Ações Rápidas
                    </CardTitle>
                    <CardDescription>
                      Acesse rapidamente as funcionalidades principais
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {quickActions.map((action, index) => {
                      const Icon = action.icon;
                      return (
                        <Button
                          key={index}
                          variant="ghost"
                          className="w-full justify-start h-auto p-4"
                          onClick={action.action}
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-gradient-hero rounded-lg flex items-center justify-center">
                              <Icon className="h-5 w-5 text-white" />
                            </div>
                            <div className="text-left">
                              <p className="font-medium">{action.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {action.description}
                              </p>
                            </div>
                          </div>
                        </Button>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>

              {/* Upcoming Appointments */}
              <div className="lg:col-span-2">
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Próximas Consultas
                    </CardTitle>
                    <CardDescription>
                      Agenda do dia de hoje
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {upcomingAppointments.map((appointment, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <p className="font-bold text-foreground">
                                {appointment.time}
                              </p>
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                {appointment.patient}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {appointment.procedure}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                appointment.status === 'confirmado'
                                  ? 'bg-success/20 text-success'
                                  : appointment.status === 'pendente'
                                  ? 'bg-warning/20 text-warning'
                                  : appointment.status === 'cancelado'
                                  ? 'bg-destructive/20 text-destructive'
                                  : 'bg-muted/20 text-muted-foreground'
                              }`}
                            >
                              {appointment.status}
                            </span>
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleViewAppointment(appointment)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditAppointment(appointment)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteAppointment(appointment.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="patients" className="space-y-8">
            <PatientManagementTab />
          </TabsContent>

          <TabsContent value="agenda" className="space-y-8">
            <SmartAgendaTab />
          </TabsContent>

          <TabsContent value="records" className="space-y-8">
            <DigitalMedicalRecordTab />
          </TabsContent>

          <TabsContent value="procedures" className="space-y-8">
            <ProceduresTab />
          </TabsContent>

          <TabsContent value="fees" className="space-y-8">
            <MonthlyFeeTab />
          </TabsContent>

          <TabsContent value="payments" className="space-y-8">
            <PaymentTab />
          </TabsContent>

          <TabsContent value="reports" className="space-y-8">
            <ReportsTab />
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <NewAppointmentModal 
        open={isNewAppointmentOpen} 
        onOpenChange={setIsNewAppointmentOpen} 
      />
      <NewPatientModal 
        open={isNewPatientOpen} 
        onOpenChange={setIsNewPatientOpen} 
      />
      <NewRecordModal 
        open={isNewRecordOpen} 
        onOpenChange={setIsNewRecordOpen} 
      />
      <ReportsModal 
        open={isReportsOpen} 
        onOpenChange={setIsReportsOpen} 
      />
      
      {/* Modal de Visualização de Compromisso */}
      <Dialog open={isViewAppointmentOpen} onOpenChange={setIsViewAppointmentOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Detalhes do Compromisso</DialogTitle>
            <DialogDescription>
              Informações completas do compromisso selecionado.
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right font-medium">Horário:</label>
                <div className="col-span-3">{selectedAppointment.time}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right font-medium">Paciente:</label>
                <div className="col-span-3">{selectedAppointment.patient}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right font-medium">Procedimento:</label>
                <div className="col-span-3">{selectedAppointment.procedure}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right font-medium">Status:</label>
                <div className="col-span-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedAppointment.status === 'confirmado'
                        ? 'bg-success/20 text-success'
                        : selectedAppointment.status === 'pendente'
                        ? 'bg-warning/20 text-warning'
                        : selectedAppointment.status === 'cancelado'
                        ? 'bg-destructive/20 text-destructive'
                        : 'bg-muted/20 text-muted-foreground'
                    }`}
                  >
                    {selectedAppointment.status}
                  </span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewAppointmentOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;