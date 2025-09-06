import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, Download, TrendingUp, Users, DollarSign, FileText, BarChart3, PieChart, Activity, Target, Clock, Star } from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const ReportsTab = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Mock data for comprehensive analytics
  const analyticsData = {
    overview: {
      totalRevenue: "R$ 45.230,00",
      totalPatients: 247,
      totalAppointments: 156,
      avgAppointmentValue: "R$ 290,00",
      growth: {
        revenue: 12.5,
        patients: 8.3,
        appointments: 15.2
      }
    },
    monthlyData: [
      { month: "Jan", revenue: 35000, patients: 180, appointments: 120 },
      { month: "Fev", revenue: 42000, patients: 195, appointments: 135 },
      { month: "Mar", revenue: 38000, patients: 190, appointments: 128 },
      { month: "Abr", revenue: 45000, patients: 210, appointments: 145 },
      { month: "Mai", revenue: 48000, patients: 225, appointments: 152 },
      { month: "Jun", revenue: 45230, patients: 247, appointments: 156 }
    ],
    procedures: [
      { name: "Limpeza", count: 45, revenue: "R$ 6.750,00", percentage: 28.8 },
      { name: "Consulta", count: 38, revenue: "R$ 9.500,00", percentage: 24.4 },
      { name: "Obturação", count: 32, revenue: "R$ 12.800,00", percentage: 20.5 },
      { name: "Extração", count: 18, revenue: "R$ 7.200,00", percentage: 11.5 },
      { name: "Tratamento de Canal", count: 12, revenue: "R$ 6.000,00", percentage: 7.7 },
      { name: "Ortodontia", count: 11, revenue: "R$ 2.980,00", percentage: 7.1 }
    ],
    patientDemographics: {
      ageGroups: [
        { range: "0-18", count: 45, percentage: 18.2 },
        { range: "19-35", count: 98, percentage: 39.7 },
        { range: "36-50", count: 67, percentage: 27.1 },
        { range: "51+", count: 37, percentage: 15.0 }
      ],
      gender: [
        { type: "Feminino", count: 145, percentage: 58.7 },
        { type: "Masculino", count: 102, percentage: 41.3 }
      ]
    },
    performance: {
      appointmentRate: 87.5,
      patientRetention: 78.3,
      avgTreatmentTime: 45,
      satisfactionScore: 4.7
    }
  };

  const handleGenerateReport = async (reportType: string) => {
    setIsGenerating(true);

    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Relatório Gerado!",
        description: `O relatório de ${reportType} foi gerado com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao gerar relatório. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadReport = (reportType: string) => {
    toast({
      title: "Download Iniciado",
      description: `Download do relatório ${reportType} foi iniciado.`,
    });
  };

  const formatCurrency = (value: string | number) => {
    if (typeof value === 'string') return value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Relatórios</h2>
          <p className="text-muted-foreground">Analytics completos de faturamento, pacientes e performance</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Esta Semana</SelectItem>
              <SelectItem value="month">Este Mês</SelectItem>
              <SelectItem value="quarter">Este Trimestre</SelectItem>
              <SelectItem value="year">Este Ano</SelectItem>
              <SelectItem value="custom">Período Personalizado</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.totalRevenue}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{analyticsData.overview.growth.revenue}%</span> vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pacientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.totalPatients}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{analyticsData.overview.growth.patients}%</span> vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultas Realizadas</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.totalAppointments}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{analyticsData.overview.growth.appointments}%</span> vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.avgAppointmentValue}</div>
            <p className="text-xs text-muted-foreground">
              Valor médio por consulta
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="procedures" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="procedures">Procedimentos</TabsTrigger>
          <TabsTrigger value="patients">Pacientes</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
        </TabsList>

        <TabsContent value="procedures" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Procedimentos Mais Realizados</CardTitle>
                <CardDescription>Distribuição por tipo de procedimento</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.procedures.map((procedure, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{procedure.name}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">{procedure.count}</span>
                          <Badge variant="secondary">{procedure.percentage}%</Badge>
                        </div>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${procedure.percentage}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-muted-foreground">{procedure.revenue}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Receita por Procedimento</CardTitle>
                <CardDescription>Valor gerado por categoria</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.procedures
                    .sort((a, b) => parseFloat(b.revenue.replace('R$ ', '').replace('.', '').replace(',', '.')) - parseFloat(a.revenue.replace('R$ ', '').replace('.', '').replace(',', '.')))
                    .map((procedure, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{procedure.name}</span>
                      <span className="font-semibold">{procedure.revenue}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="patients" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Idade</CardTitle>
                <CardDescription>Faixa etária dos pacientes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.patientDemographics.ageGroups.map((group, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{group.range} anos</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">{group.count}</span>
                          <Badge variant="outline">{group.percentage}%</Badge>
                        </div>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${group.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Gênero</CardTitle>
                <CardDescription>Composição de gênero dos pacientes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.patientDemographics.gender.map((gender, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{gender.type}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">{gender.count}</span>
                          <Badge variant="outline">{gender.percentage}%</Badge>
                        </div>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${gender.type === 'Feminino' ? 'bg-pink-500' : 'bg-blue-500'}`}
                          style={{ width: `${gender.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Comparecimento</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.performance.appointmentRate}%</div>
                <p className="text-xs text-muted-foreground">
                  Pacientes que comparecem
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Retenção de Pacientes</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.performance.patientRetention}%</div>
                <p className="text-xs text-muted-foreground">
                  Pacientes que retornam
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.performance.avgTreatmentTime}min</div>
                <p className="text-xs text-muted-foreground">
                  Duração média da consulta
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Satisfação</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.performance.satisfactionScore}/5</div>
                <p className="text-xs text-muted-foreground">
                  Avaliação média dos pacientes
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Métricas de Performance</CardTitle>
              <CardDescription>Indicadores chave de performance da clínica</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Ocupação da Agenda</p>
                    <p className="text-sm text-muted-foreground">Percentual de horário utilizado</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">78%</p>
                    <p className="text-xs text-muted-foreground">Meta: 80%</p>
                  </div>
                </div>

                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Tempo de Espera Médio</p>
                    <p className="text-sm text-muted-foreground">Tempo até o atendimento</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">12min</p>
                    <p className="text-xs text-muted-foreground">Meta: menos de 15min</p>
                  </div>
                </div>

                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Taxa de Cancelamento</p>
                    <p className="text-sm text-muted-foreground">Consultas canceladas</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-600">8.5%</p>
                    <p className="text-xs text-muted-foreground">Meta: menos de 10%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tendências Mensais</CardTitle>
              <CardDescription>Evolução dos principais indicadores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {analyticsData.monthlyData.map((data, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{data.month}/2024</span>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{formatCurrency(data.revenue)}</p>
                        <p className="text-xs text-muted-foreground">
                          {data.patients} pacientes • {data.appointments} consultas
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${(data.revenue / 50000) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>Gere relatórios específicos rapidamente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2"
              onClick={() => handleGenerateReport("financeiro")}
              disabled={isGenerating}
            >
              <DollarSign className="h-6 w-6" />
              <span className="text-sm">Relatório Financeiro</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2"
              onClick={() => handleGenerateReport("pacientes")}
              disabled={isGenerating}
            >
              <Users className="h-6 w-6" />
              <span className="text-sm">Relatório de Pacientes</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2"
              onClick={() => handleGenerateReport("procedimentos")}
              disabled={isGenerating}
            >
              <FileText className="h-6 w-6" />
              <span className="text-sm">Relatório de Procedimentos</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2"
              onClick={() => handleDownloadReport("completo")}
            >
              <Download className="h-6 w-6" />
              <span className="text-sm">Relatório Completo</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { ReportsTab };