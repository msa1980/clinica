import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CalendarIcon, Upload, Users, Search, Plus, Eye, Edit, Trash2, Camera, FileText } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  birthDate: Date;
  gender: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  emergencyContact: string;
  emergencyPhone: string;
  medicalHistory: string;
  allergies: string;
  medications: string;
  procedures: string;
  photos: string[];
  documents: { name: string; type: string; url: string }[];
  createdAt: Date;
}

const PatientManagementTab = () => {
  const [patients, setPatients] = useState<Patient[]>([
    {
      id: "1",
      name: "Maria Silva",
      email: "maria@email.com",
      phone: "(11) 99999-9999",
      cpf: "123.456.789-00",
      birthDate: new Date("1985-05-15"),
      gender: "feminino",
      address: "Rua das Flores, 123",
      city: "São Paulo",
      state: "SP",
      zipCode: "01234-567",
      emergencyContact: "João Silva",
      emergencyPhone: "(11) 88888-8888",
      medicalHistory: "Paciente com histórico de hipertensão",
      allergies: "Penicilina",
      medications: "Losartana 50mg",
      procedures: "Limpeza, Consulta de rotina",
      photos: [],
      documents: [],
      createdAt: new Date()
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isNewPatientOpen, setIsNewPatientOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isViewPatientOpen, setIsViewPatientOpen] = useState(false);
  const { toast } = useToast();

  // Form states for new patient
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");
  const [birthDate, setBirthDate] = useState<Date>();
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [allergies, setAllergies] = useState("");
  const [medications, setMedications] = useState("");
  const [procedures, setProcedures] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [documents, setDocuments] = useState<File[]>([]);

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.cpf.includes(searchTerm) ||
    patient.phone.includes(searchTerm)
  );

  const handleAddPatient = async () => {
    if (!name || !phone || !cpf) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (selectedPatient) {
      // Editando paciente existente
      const updatedPatient: Patient = {
        ...selectedPatient,
        name,
        email,
        phone,
        cpf,
        birthDate: birthDate || new Date(),
        gender,
        address,
        city,
        state,
        zipCode,
        emergencyContact,
        emergencyPhone,
        medicalHistory,
        allergies,
        medications,
        procedures,
        photos: photos.length > 0 ? photos.map(file => URL.createObjectURL(file)) : selectedPatient.photos,
        documents: documents.length > 0 ? documents.map(file => ({
          name: file.name,
          type: file.type,
          url: URL.createObjectURL(file)
        })) : selectedPatient.documents
      };

      setPatients(patients.map(p => p.id === selectedPatient.id ? updatedPatient : p));
    } else {
      // Criando novo paciente
      const newPatient: Patient = {
        id: Date.now().toString(),
        name,
        email,
        phone,
        cpf,
        birthDate: birthDate || new Date(),
        gender,
        address,
        city,
        state,
        zipCode,
        emergencyContact,
        emergencyPhone,
        medicalHistory,
        allergies,
        medications,
        procedures,
        photos: photos.map(file => URL.createObjectURL(file)),
         documents: documents.map(file => ({
          name: file.name,
          type: file.type,
          url: URL.createObjectURL(file)
        })),
        createdAt: new Date()
      };

      setPatients([...patients, newPatient]);
    }

    // Clear form
    setName("");
    setEmail("");
    setPhone("");
    setCpf("");
    setBirthDate(undefined);
    setGender("");
    setAddress("");
    setCity("");
    setState("");
    setZipCode("");
    setEmergencyContact("");
    setEmergencyPhone("");
    setMedicalHistory("");
    setAllergies("");
    setMedications("");
    setProcedures("");
    setPhotos([]);
    setDocuments([]);
    setSelectedPatient(null);

    setIsNewPatientOpen(false);

    toast({
      title: "Sucesso!",
      description: selectedPatient ? "Paciente atualizado com sucesso." : "Paciente cadastrado com sucesso.",
    });
  };

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsViewPatientOpen(true);
  };

  const handleEditPatient = (patient: Patient) => {
    // Preencher os estados com os dados do paciente selecionado
    setName(patient.name);
    setEmail(patient.email);
    setPhone(patient.phone);
    setCpf(patient.cpf);
    setBirthDate(patient.birthDate);
    setGender(patient.gender);
    setAddress(patient.address);
    setCity(patient.city);
    setState(patient.state);
    setZipCode(patient.zipCode);
    setEmergencyContact(patient.emergencyContact);
    setEmergencyPhone(patient.emergencyPhone);
    setMedicalHistory(patient.medicalHistory);
    setAllergies(patient.allergies);
    setMedications(patient.medications);
    setProcedures(patient.procedures);
    setSelectedPatient(patient);
    setIsNewPatientOpen(true);
  };

  const handleDeletePatient = (patientId: string) => {
    setPatients(patients.filter(p => p.id !== patientId));
    toast({
      title: "Sucesso!",
      description: "Paciente removido com sucesso.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestão de Pacientes</h2>
          <p className="text-muted-foreground">Cadastro completo com histórico médico, fotos e documentos organizados</p>
        </div>
        <Dialog open={isNewPatientOpen} onOpenChange={setIsNewPatientOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Paciente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedPatient ? "Editar Paciente" : "Cadastrar Novo Paciente"}</DialogTitle>
              <DialogDescription>
                {selectedPatient ? "Atualize as informações do paciente" : "Preencha as informações completas do paciente"}
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="personal">Dados Pessoais</TabsTrigger>
                <TabsTrigger value="address">Endereço</TabsTrigger>
                <TabsTrigger value="medical">Histórico Médico</TabsTrigger>
                <TabsTrigger value="media">Fotos e Documentos</TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Digite o nome completo"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF *</Label>
                    <Input
                      id="cpf"
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      placeholder="000.000.000-00"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Data de Nascimento</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !birthDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {birthDate ? format(birthDate, "PPP", { locale: ptBR }) : "Selecione a data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={birthDate}
                          onSelect={setBirthDate}
                          initialFocus
                          locale={ptBR}
                          disabled={(date) => date > new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gênero</Label>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="masculino">Masculino</SelectItem>
                        <SelectItem value="feminino">Feminino</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                        <SelectItem value="nao-informar">Prefiro não informar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone *</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(11) 99999-9999"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                  />
                </div>
              </TabsContent>

              <TabsContent value="address" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Rua, número, complemento"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Cidade"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">Estado</Label>
                    <Input
                      id="state"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="Estado"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">CEP</Label>
                    <Input
                      id="zipCode"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      placeholder="00000-000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact">Contato de Emergência</Label>
                    <Input
                      id="emergencyContact"
                      value={emergencyContact}
                      onChange={(e) => setEmergencyContact(e.target.value)}
                      placeholder="Nome completo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyPhone">Telefone</Label>
                    <Input
                      id="emergencyPhone"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="medical" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="medicalHistory">Histórico Médico</Label>
                  <Textarea
                    id="medicalHistory"
                    value={medicalHistory}
                    onChange={(e) => setMedicalHistory(e.target.value)}
                    placeholder="Descreva o histórico médico do paciente..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="allergies">Alergias</Label>
                  <Textarea
                    id="allergies"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    placeholder="Liste as alergias conhecidas..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medications">Medicamentos em Uso</Label>
                  <Textarea
                    id="medications"
                    value={medications}
                    onChange={(e) => setMedications(e.target.value)}
                    placeholder="Liste os medicamentos que o paciente está tomando..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="procedures">Procedimentos Realizados</Label>
                  <Textarea
                    id="procedures"
                    value={procedures}
                    onChange={(e) => setProcedures(e.target.value)}
                    placeholder="Liste os procedimentos já realizados no paciente..."
                    rows={2}
                  />
                </div>
              </TabsContent>

              <TabsContent value="media" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label>Fotos do Paciente</Label>
                    <div className="mt-2">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => setPhotos(Array.from(e.target.files || []))}
                        className="hidden"
                        id="photo-upload"
                      />
                      <label htmlFor="photo-upload">
                        <Button variant="outline" className="cursor-pointer" asChild>
                          <span>
                            <Camera className="h-4 w-4 mr-2" />
                            Selecionar Fotos
                          </span>
                        </Button>
                      </label>
                      {photos.length > 0 && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {photos.length} foto(s) selecionada(s)
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label>Documentos</Label>
                    <div className="mt-2">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.png"
                        multiple
                        onChange={(e) => setDocuments(Array.from(e.target.files || []))}
                        className="hidden"
                        id="document-upload"
                      />
                      <label htmlFor="document-upload">
                        <Button variant="outline" className="cursor-pointer" asChild>
                          <span>
                            <FileText className="h-4 w-4 mr-2" />
                            Selecionar Documentos
                          </span>
                        </Button>
                      </label>
                      {documents.length > 0 && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {documents.length} documento(s) selecionado(s)
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsNewPatientOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleAddPatient}>
                Cadastrar Paciente
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
              placeholder="Buscar por nome, CPF ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Patients Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pacientes Cadastrados</CardTitle>
          <CardDescription>
            {filteredPatients.length} paciente(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Data de Cadastro</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{patient.name}</TableCell>
                  <TableCell>{patient.cpf}</TableCell>
                  <TableCell>{patient.phone}</TableCell>
                  <TableCell>{format(patient.createdAt, "dd/MM/yyyy")}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewPatient(patient)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditPatient(patient)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePatient(patient.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Patient Dialog */}
      <Dialog open={isViewPatientOpen} onOpenChange={setIsViewPatientOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Paciente</DialogTitle>
            <DialogDescription>
              Informações completas do paciente
            </DialogDescription>
          </DialogHeader>

          {selectedPatient && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Nome</Label>
                  <p className="text-sm text-muted-foreground">{selectedPatient.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">CPF</Label>
                  <p className="text-sm text-muted-foreground">{selectedPatient.cpf}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Telefone</Label>
                  <p className="text-sm text-muted-foreground">{selectedPatient.phone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-muted-foreground">{selectedPatient.email}</p>
                </div>
              </div>

              {selectedPatient.medicalHistory && (
                <div>
                  <Label className="text-sm font-medium">Histórico Médico</Label>
                  <p className="text-sm text-muted-foreground">{selectedPatient.medicalHistory}</p>
                </div>
              )}

              {selectedPatient.photos.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Fotos</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {selectedPatient.photos.map((photo, index) => (
                      <img
                        key={index}
                        src={photo}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}

              {selectedPatient.documents.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Documentos</Label>
                  <div className="space-y-2 mt-2">
                    {selectedPatient.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{doc.name}</span>
                        <Badge variant="secondary">{doc.type}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setIsViewPatientOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export { PatientManagementTab };