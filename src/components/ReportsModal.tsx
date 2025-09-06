import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Download, TrendingUp, Users, DollarSign, FileText } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ReportsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ReportsModal = ({ open, onOpenChange }: ReportsModalProps) => {
  const [reportType, setReportType] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const reportTypes = [
    {
      value: "appointments",
      label: "Relatório de Consultas",
      description: "Consultas realizadas no período",
      icon: Calendar
    },
    {
      value: "patients",
      label: "Relatório de Pacientes",
      description: "Novos pacientes cadastrados",
      icon: Users
    },
    {
      value: "financial",
      label: "Relatório Financeiro",
      description: "Receitas e despesas do período",
      icon: DollarSign
    },
    {
      value: "procedures",
      label: "Relatório de Procedimentos",
      description: "Procedimentos mais realizados",
      icon: FileText
    }
  ];

  const mockReportData = {
    appointments: {
      total: 156,
      completed: 142,
      cancelled: 14,
      revenue: "R$ 23.450,00"
    },
    patients: {
      new: 28,
      returning: 124,
      total: 152
    },
    procedures: {
      cleaning: 45,
      consultation: 38,
      filling: 32,
      extraction: 18,
      canal: 12
    }
  };

  const handleGenerateReport = async () => {
    if (!reportType) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um tipo de relatório.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Simular geração de relatório
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Relatório Gerado!",
        description: "O relatório foi gerado com sucesso e está pronto para download.",
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

  const handleDownloadReport = () => {
    toast({
      title: "Download Iniciado",
      description: "O download do relatório foi iniciado.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Relatórios</DialogTitle>
          <DialogDescription>
            Gere e visualize relatórios detalhados sobre sua clínica.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Filtros */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Filtros</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de Relatório</label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Data Inicial</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP", { locale: ptBR }) : "Selecione"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Data Final</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP", { locale: ptBR }) : "Selecione"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleGenerateReport} disabled={isGenerating}>
                {isGenerating ? "Gerando..." : "Gerar Relatório"}
              </Button>
              <Button variant="outline" onClick={handleDownloadReport}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
          
          {/* Tipos de Relatório */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Tipos de Relatório Disponíveis</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reportTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <Card 
                    key={type.value} 
                    className={cn(
                      "cursor-pointer transition-colors hover:bg-accent/50",
                      reportType === type.value && "ring-2 ring-primary"
                    )}
                    onClick={() => setReportType(type.value)}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Icon className="h-5 w-5" />
                        {type.label}
                      </CardTitle>
                      <CardDescription>{type.description}</CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>
          
          {/* Preview dos Dados */}
          {reportType && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Preview dos Dados</h3>
              
              {reportType === "appointments" && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{mockReportData.appointments.total}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Realizadas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">{mockReportData.appointments.completed}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Canceladas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">{mockReportData.appointments.cancelled}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Receita</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">{mockReportData.appointments.revenue}</div>
                    </CardContent>
                  </Card>
                </div>
              )}
              
              {reportType === "patients" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Novos Pacientes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">{mockReportData.patients.new}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Retornos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">{mockReportData.patients.returning}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{mockReportData.patients.total}</div>
                    </CardContent>
                  </Card>
                </div>
              )}
              
              {reportType === "procedures" && (
                <div className="space-y-2">
                  {Object.entries(mockReportData.procedures).map(([procedure, count]) => (
                    <div key={procedure} className="flex justify-between items-center p-3 bg-accent/20 rounded-lg">
                      <span className="capitalize">{procedure === 'cleaning' ? 'Limpeza' : procedure === 'consultation' ? 'Consulta' : procedure === 'filling' ? 'Obturação' : procedure === 'extraction' ? 'Extração' : 'Canal'}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {reportType === "financial" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Resumo Financeiro
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">R$ 45.230,00</div>
                    <p className="text-sm text-muted-foreground mt-1">Receita total do período</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { ReportsModal };