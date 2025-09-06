import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Clock, Plus, Bell, Users, MapPin, Phone, Mail, CheckCircle, XCircle, AlertCircle, ChevronDown } from "lucide-react";
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  date: Date;
  time: string;
  duration: number;
  procedure: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | 'reschedule' | 'call_confirm';
  notes: string;
  reminderSent: boolean;
  onlineBooking: boolean;
}

interface AvailabilitySlot {
  id: string;
  dayOfWeek: number;
  availableHours: string[];
}

const SmartAgendaTab = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Função para carregar compromissos do localStorage
  const loadAppointments = (): Appointment[] => {
    try {
      const saved = localStorage.getItem('clinic-appointments');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Converter strings de data de volta para objetos Date
        return parsed.map((apt: any) => ({
          ...apt,
          date: new Date(apt.date)
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar compromissos:', error);
    }
    // Retorna dados padrão se não houver dados salvos
    return [
    {
      id: "1",
      patientName: "Maria Silva",
      patientPhone: "(11) 99999-9999",
      patientEmail: "maria@email.com",
      date: new Date(),
      time: "09:00",
      duration: 60,
      procedure: "Limpeza",
      status: 'confirmed',
      notes: "Paciente com histórico de ansiedade",
      reminderSent: true,
      onlineBooking: false
    },
    {
      id: "2",
      patientName: "João Santos",
      patientPhone: "(11) 88888-8888",
      patientEmail: "joao@email.com",
      date: addDays(new Date(), 1),
      time: "14:00",
      duration: 90,
      procedure: "Tratamento de Canal",
      status: 'scheduled',
      notes: "",
      reminderSent: false,
      onlineBooking: true
    }
    ];
  };

  const [appointments, setAppointments] = useState<Appointment[]>(loadAppointments());

  // Função para salvar compromissos no localStorage
  const saveAppointments = (newAppointments: Appointment[]) => {
    try {
      localStorage.setItem('clinic-appointments', JSON.stringify(newAppointments));
    } catch (error) {
      console.error('Erro ao salvar compromissos:', error);
    }
  };

  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([
    { id: "1", dayOfWeek: 1, availableHours: ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"] },
    { id: "2", dayOfWeek: 2, availableHours: ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"] },
    { id: "3", dayOfWeek: 3, availableHours: ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"] },
    { id: "4", dayOfWeek: 4, availableHours: ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"] },
    { id: "5", dayOfWeek: 5, availableHours: ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"] },
  ]);

  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false);
  const [autoReminders, setAutoReminders] = useState(true);
  const [reminderHours, setReminderHours] = useState(24);
  const { toast } = useToast();

  // Form states for new appointment
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [appointmentDate, setAppointmentDate] = useState<Date>();
  const [appointmentTime, setAppointmentTime] = useState("");
  const [duration, setDuration] = useState(60);
  const [procedure, setProcedure] = useState("");
  const [notes, setNotes] = useState("");

  const selectedDateAppointments = appointments.filter(appointment =>
    isSameDay(appointment.date, selectedDate)
  ).sort((a, b) => a.time.localeCompare(b.time));

  const weekDays = eachDayOfInterval({
    start: startOfWeek(new Date(), { weekStartsOn: 1 }),
    end: endOfWeek(new Date(), { weekStartsOn: 1 })
  });

  const handleAddAppointment = async () => {
    if (!patientName || !appointmentDate || !appointmentTime || !procedure) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const newAppointment: Appointment = {
      id: Date.now().toString(),
      patientName,
      patientPhone,
      patientEmail,
      date: appointmentDate,
      time: appointmentTime,
      duration,
      procedure,
      status: 'scheduled',
      notes,
      reminderSent: false,
      onlineBooking: false
    };

    const updatedAppointments = [...appointments, newAppointment];
    setAppointments(updatedAppointments);
    saveAppointments(updatedAppointments);

    // Clear form
    setPatientName("");
    setPatientPhone("");
    setPatientEmail("");
    setAppointmentDate(undefined);
    setAppointmentTime("");
    setDuration(60);
    setProcedure("");
    setNotes("");

    setIsNewAppointmentOpen(false);

    toast({
      title: "Sucesso!",
      description: "Consulta agendada com sucesso.",
    });
  };

  const handleStatusChange = (appointmentId: string, status: Appointment['status']) => {
    const updatedAppointments = appointments.map(apt =>
      apt.id === appointmentId ? { ...apt, status } : apt
    );
    setAppointments(updatedAppointments);
    saveAppointments(updatedAppointments);

    toast({
      title: "Status atualizado",
      description: `Consulta marcada como ${
        status === 'completed' ? 'concluída' :
        status === 'cancelled' ? 'cancelada' :
        status === 'no_show' ? 'não compareceu' :
        status === 'reschedule' ? 'para remarcar' :
        status === 'call_confirm' ? 'ligar para confirmar' :
        'confirmada'
      }.`,
    });
  };

  const handleSendReminder = (appointmentId: string) => {
    const updatedAppointments = appointments.map(apt =>
      apt.id === appointmentId ? { ...apt, reminderSent: true } : apt
    );
    setAppointments(updatedAppointments);
    saveAppointments(updatedAppointments);

    toast({
      title: "Lembrete enviado",
      description: "Lembrete enviado para o paciente.",
    });
  };

  const getStatusIcon = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'no_show':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      case 'reschedule':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'call_confirm':
        return <Phone className="h-4 w-4 text-purple-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusText = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmada';
      case 'completed':
        return 'Concluída';
      case 'cancelled':
        return 'Cancelada';
      case 'no_show':
        return 'Não compareceu';
      case 'reschedule':
        return 'Remarcar';
      case 'call_confirm':
        return 'Ligar para confirmar';
      default:
        return 'Agendada';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Agenda Inteligente</h2>
          <p className="text-muted-foreground">Agendamento online, lembretes automáticos e controle de disponibilidade</p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={isAvailabilityOpen} onOpenChange={setIsAvailabilityOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Clock className="h-4 w-4 mr-2" />
                Disponibilidade
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configurar Disponibilidade</DialogTitle>
                <DialogDescription>
                  Defina seus horários de atendimento
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                {availabilitySlots.map((slot) => {
                  const dayNames = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
                  const dayName = dayNames[slot.dayOfWeek - 1];
                  const hours = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
                  return (
                    <div key={slot.id} className="space-y-2">
                      <Label className="text-base font-medium">{dayName}</Label>
                      <div className="grid grid-cols-5 gap-2">
                        {hours.map((hour) => {
                          const isAvailable = slot.availableHours.includes(hour);
                          return (
                            <Button
                              key={hour}
                              variant={isAvailable ? "default" : "outline"}
                              size="sm"
                              onClick={() => {
                                const newHours = isAvailable
                                  ? slot.availableHours.filter(h => h !== hour)
                                  : [...slot.availableHours, hour].sort();
                                setAvailabilitySlots(availabilitySlots.map(s =>
                                  s.id === slot.id ? { ...s, availableHours: newHours } : s
                                ));
                              }}
                            >
                              {hour}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
              <DialogFooter>
                <Button onClick={() => setIsAvailabilityOpen(false)}>
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isNewAppointmentOpen} onOpenChange={setIsNewAppointmentOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Consulta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agendar Nova Consulta</DialogTitle>
                <DialogDescription>
                  Preencha os dados da consulta
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="patientName">Nome do Paciente *</Label>
                    <Input
                      id="patientName"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="Nome completo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="patientPhone">Telefone</Label>
                    <Input
                      id="patientPhone"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="patientEmail">Email</Label>
                  <Input
                    id="patientEmail"
                    type="email"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Data *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !appointmentDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {appointmentDate ? format(appointmentDate, "dd/MM", { locale: ptBR }) : "Selecione"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={appointmentDate}
                          onSelect={setAppointmentDate}
                          initialFocus
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Horário *</Label>
                    <Input
                      id="time"
                      type="time"
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duração (min)</Label>
                    <Select value={duration.toString()} onValueChange={(value) => setDuration(parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 min</SelectItem>
                        <SelectItem value="60">60 min</SelectItem>
                        <SelectItem value="90">90 min</SelectItem>
                        <SelectItem value="120">120 min</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="procedure">Procedimento *</Label>
                  <Select value={procedure} onValueChange={setProcedure}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o procedimento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="limpeza">Limpeza</SelectItem>
                      <SelectItem value="consulta">Consulta</SelectItem>
                      <SelectItem value="canal">Tratamento de Canal</SelectItem>
                      <SelectItem value="extracao">Extração</SelectItem>
                      <SelectItem value="restauracao">Restauração</SelectItem>
                      <SelectItem value="ortodontia">Ortodontia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Observações sobre a consulta..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNewAppointmentOpen(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleAddAppointment}>
                  Agendar Consulta
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Configurações de Lembretes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Lembretes Automáticos</Label>
              <p className="text-sm text-muted-foreground">
                Enviar lembretes automaticamente para pacientes
              </p>
            </div>
            <Switch
              checked={autoReminders}
              onCheckedChange={setAutoReminders}
            />
          </div>
          {autoReminders && (
            <div className="mt-4 flex items-center space-x-2">
              <Label>Enviar lembrete</Label>
              <Select value={reminderHours.toString()} onValueChange={(value) => setReminderHours(parseInt(value))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 hora antes</SelectItem>
                  <SelectItem value="2">2 horas antes</SelectItem>
                  <SelectItem value="6">6 horas antes</SelectItem>
                  <SelectItem value="12">12 horas antes</SelectItem>
                  <SelectItem value="24">1 dia antes</SelectItem>
                  <SelectItem value="48">2 dias antes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Calendário</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              locale={ptBR}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Appointments List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              Consultas do Dia - {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
            </CardTitle>
            <CardDescription>
              {selectedDateAppointments.length} consulta(s) agendada(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedDateAppointments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma consulta agendada para este dia
                </div>
              ) : (
                selectedDateAppointments.map((appointment) => (
                  <Card key={appointment.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{appointment.time}</span>
                          <span className="text-sm text-muted-foreground">
                            ({appointment.duration}min)
                          </span>
                          {getStatusIcon(appointment.status)}
                          <Badge variant={
                            appointment.status === 'confirmed' ? 'default' :
                            appointment.status === 'completed' ? 'secondary' :
                            appointment.status === 'cancelled' ? 'destructive' :
                            appointment.status === 'no_show' ? 'destructive' :
                            appointment.status === 'reschedule' ? 'outline' :
                            appointment.status === 'call_confirm' ? 'outline' : 'outline'
                          }>
                            {getStatusText(appointment.status)}
                          </Badge>
                        </div>

                        <div className="space-y-1">
                          <p className="font-medium">{appointment.patientName}</p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Phone className="h-3 w-3" />
                              <span>{appointment.patientPhone}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Mail className="h-3 w-3" />
                              <span>{appointment.patientEmail}</span>
                            </div>
                          </div>
                          <p className="text-sm font-medium text-primary">
                            {appointment.procedure}
                          </p>
                          {appointment.notes && (
                            <p className="text-sm text-muted-foreground">
                              {appointment.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline">
                              Ações
                              <ChevronDown className="ml-1 h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {appointment.status === 'scheduled' && (
                              <DropdownMenuItem onClick={() => handleStatusChange(appointment.id, 'confirmed')}>
                                Confirmar
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleStatusChange(appointment.id, 'completed')}>
                              Concluído
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(appointment.id, 'cancelled')}>
                              Cancelado
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(appointment.id, 'no_show')}>
                              Não compareceu
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(appointment.id, 'reschedule')}>
                              Remarcar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(appointment.id, 'call_confirm')}>
                              Ligar para confirmar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        {!appointment.reminderSent && autoReminders && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSendReminder(appointment.id)}
                          >
                            <Bell className="h-3 w-3 mr-1" />
                            Lembrete
                          </Button>
                        )}
                        {appointment.onlineBooking && (
                          <Badge variant="outline" className="text-xs">
                            Online
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export { SmartAgendaTab };