import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface NewRecordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewRecordModal = ({ open, onOpenChange }: NewRecordModalProps) => {
  const [patientName, setPatientName] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [historyOfPresentIllness, setHistoryOfPresentIllness] = useState("");
  const [clinicalExamination, setClinicalExamination] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatmentPlan, setTreatmentPlan] = useState("");
  const [procedures, setProcedures] = useState("");
  const [medications, setMedications] = useState("");
  const [observations, setObservations] = useState("");
  const [nextAppointment, setNextAppointment] = useState<Date>();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!patientName || !chiefComplaint || !diagnosis) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Simular salvamento no banco de dados
      // Em uma implementação real, você salvaria no Supabase
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Sucesso!",
        description: "Prontuário criado com sucesso.",
      });
      
      // Limpar formulário
      setPatientName("");
      setDate(new Date());
      setChiefComplaint("");
      setHistoryOfPresentIllness("");
      setClinicalExamination("");
      setDiagnosis("");
      setTreatmentPlan("");
      setProcedures("");
      setMedications("");
      setObservations("");
      setNextAppointment(undefined);
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar prontuário. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Prontuário</DialogTitle>
          <DialogDescription>
            Crie um novo prontuário médico preenchendo as informações da consulta.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informações da Consulta</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patientName">Nome do Paciente *</Label>
                <Input
                  id="patientName"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Digite o nome do paciente"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Data da Consulta *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP", { locale: ptBR }) : "Selecione a data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(date) => date && setDate(date)}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          
          {/* Anamnese */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Anamnese</h3>
            
            <div className="space-y-2">
              <Label htmlFor="chiefComplaint">Queixa Principal *</Label>
              <Textarea
                id="chiefComplaint"
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                placeholder="Descreva a queixa principal do paciente..."
                rows={3}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="historyOfPresentIllness">História da Doença Atual</Label>
              <Textarea
                id="historyOfPresentIllness"
                value={historyOfPresentIllness}
                onChange={(e) => setHistoryOfPresentIllness(e.target.value)}
                placeholder="Descreva a história da doença atual..."
                rows={4}
              />
            </div>
          </div>
          
          {/* Exame Clínico */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Exame Clínico</h3>
            
            <div className="space-y-2">
              <Label htmlFor="clinicalExamination">Exame Físico</Label>
              <Textarea
                id="clinicalExamination"
                value={clinicalExamination}
                onChange={(e) => setClinicalExamination(e.target.value)}
                placeholder="Descreva os achados do exame físico..."
                rows={4}
              />
            </div>
          </div>
          
          {/* Diagnóstico e Tratamento */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Diagnóstico e Tratamento</h3>
            
            <div className="space-y-2">
              <Label htmlFor="diagnosis">Diagnóstico *</Label>
              <Textarea
                id="diagnosis"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Descreva o diagnóstico..."
                rows={3}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="treatmentPlan">Plano de Tratamento</Label>
              <Textarea
                id="treatmentPlan"
                value={treatmentPlan}
                onChange={(e) => setTreatmentPlan(e.target.value)}
                placeholder="Descreva o plano de tratamento..."
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="procedures">Procedimentos Realizados</Label>
              <Textarea
                id="procedures"
                value={procedures}
                onChange={(e) => setProcedures(e.target.value)}
                placeholder="Liste os procedimentos realizados..."
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="medications">Medicamentos Prescritos</Label>
              <Textarea
                id="medications"
                value={medications}
                onChange={(e) => setMedications(e.target.value)}
                placeholder="Liste os medicamentos prescritos com posologia..."
                rows={3}
              />
            </div>
          </div>
          
          {/* Observações e Próxima Consulta */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Observações e Seguimento</h3>
            
            <div className="space-y-2">
              <Label htmlFor="observations">Observações Gerais</Label>
              <Textarea
                id="observations"
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Observações adicionais..."
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Próxima Consulta</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !nextAppointment && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {nextAppointment ? format(nextAppointment, "PPP", { locale: ptBR }) : "Selecione a data (opcional)"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={nextAppointment}
                    onSelect={setNextAppointment}
                    initialFocus
                    locale={ptBR}
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar Prontuário"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export { NewRecordModal };