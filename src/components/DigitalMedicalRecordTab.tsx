import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Plus, Search, Eye, Edit, Trash2, Cloud, Shield, Lock, Upload, Download, Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  date: Date;
  type: 'consulta' | 'exame' | 'procedimento' | 'evolucao';
  title: string;
  description: string;
  diagnosis: string;
  treatment: string;
  notes: string;
  attachments: { name: string; type: string; url: string; size: number }[];
  createdBy: string;
  isEncrypted: boolean;
  lastBackup: Date;
}

const DigitalMedicalRecordTab = () => {
  const [records, setRecords] = useState<MedicalRecord[]>([
    {
      id: "1",
      patientId: "1",
      patientName: "Maria Silva",
      date: new Date(),
      type: 'consulta',
      title: "Consulta de Rotina",
      description: "Avaliação odontológica completa",
      diagnosis: "Cárie dentária em dente 25",
      treatment: "Restauração com resina composta",
      notes: "Paciente apresenta boa higiene bucal. Recomendado acompanhamento semestral.",
      attachments: [
        { name: "radiografia.jpg", type: "image/jpeg", url: "#", size: 2048576 },
        { name: "evolucao.pdf", type: "application/pdf", url: "#", size: 512000 }
      ],
      createdBy: "Dr. João Silva",
      isEncrypted: true,
      lastBackup: new Date()
    },
    {
      id: "2",
      patientId: "2",
      patientName: "João Santos",
      date: new Date(Date.now() - 86400000),
      type: 'procedimento',
      title: "Tratamento de Canal",
      description: "Tratamento endodôntico no dente 14",
      diagnosis: "Pulpite irreversível",
      treatment: "Tratamento de canal com obturação",
      notes: "Procedimento realizado com sucesso. Paciente orientado sobre cuidados pós-tratamento.",
      attachments: [
        { name: "pre-op.jpg", type: "image/jpeg", url: "#", size: 1536000 },
        { name: "pos-op.jpg", type: "image/jpeg", url: "#", size: 1536000 }
      ],
      createdBy: "Dra. Ana Costa",
      isEncrypted: true,
      lastBackup: new Date()
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [isNewRecordOpen, setIsNewRecordOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [isViewRecordOpen, setIsViewRecordOpen] = useState(false);
  const [backupStatus, setBackupStatus] = useState<'idle' | 'syncing' | 'completed' | 'error'>('idle');
  const { toast } = useToast();

  // Form states for new record
  const [patientName, setPatientName] = useState("");
  const [recordDate, setRecordDate] = useState<Date>(new Date());
  const [recordType, setRecordType] = useState<MedicalRecord['type']>('consulta');
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [notes, setNotes] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPatient = !selectedPatient || record.patientId === selectedPatient;
    const matchesType = !selectedType || record.type === selectedType;
    return matchesSearch && matchesPatient && matchesType;
  });

  const handleAddRecord = async () => {
    if (!patientName || !title || !description) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const newRecord: MedicalRecord = {
      id: Date.now().toString(),
      patientId: Date.now().toString(), // In a real app, this would be selected from existing patients
      patientName,
      date: recordDate,
      type: recordType,
      title,
      description,
      diagnosis,
      treatment,
      notes,
      attachments: attachments.map(file => ({
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file),
        size: file.size
      })),
      createdBy: "Dr. Usuário Atual", // In a real app, this would come from auth
      isEncrypted: true,
      lastBackup: new Date()
    };

    setRecords([...records, newRecord]);

    // Clear form
    setPatientName("");
    setRecordDate(new Date());
    setRecordType('consulta');
    setTitle("");
    setDescription("");
    setDiagnosis("");
    setTreatment("");
    setNotes("");
    setAttachments([]);

    setIsNewRecordOpen(false);

    toast({
      title: "Sucesso!",
      description: "Prontuário criado com sucesso.",
    });
  };

  const handleViewRecord = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setIsViewRecordOpen(true);
  };

  const handleDeleteRecord = (recordId: string) => {
    setRecords(records.filter(r => r.id !== recordId));
    toast({
      title: "Sucesso!",
      description: "Prontuário removido com sucesso.",
    });
  };

  const handleBackup = async () => {
    setBackupStatus('syncing');
    // Simulate backup process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setBackupStatus('completed');

    // Update last backup for all records
    setRecords(records.map(record => ({
      ...record,
      lastBackup: new Date()
    })));

    toast({
      title: "Backup concluído",
      description: "Todos os prontuários foram sincronizados com a nuvem.",
    });

    setTimeout(() => setBackupStatus('idle'), 3000);
  };

  const getTypeText = (type: MedicalRecord['type']) => {
    switch (type) {
      case 'consulta':
        return 'Consulta';
      case 'exame':
        return 'Exame';
      case 'procedimento':
        return 'Procedimento';
      case 'evolucao':
        return 'Evolução';
      default:
        return type;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Prontuário Digital</h2>
          <p className="text-muted-foreground">Prontuários eletrônicos seguros com backup automático na nuvem</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handleBackup}
            disabled={backupStatus === 'syncing'}
          >
            <Cloud className="h-4 w-4 mr-2" />
            {backupStatus === 'syncing' ? 'Sincronizando...' :
             backupStatus === 'completed' ? 'Sincronizado' : 'Backup na Nuvem'}
          </Button>
          <Dialog open={isNewRecordOpen} onOpenChange={setIsNewRecordOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Prontuário
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Novo Prontuário</DialogTitle>
                <DialogDescription>
                  Registre informações médicas do paciente
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
                  <TabsTrigger value="medical">Dados Médicos</TabsTrigger>
                  <TabsTrigger value="attachments">Anexos</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
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
                      <Label htmlFor="recordType">Tipo de Registro *</Label>
                      <Select value={recordType} onValueChange={(value: MedicalRecord['type']) => setRecordType(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="consulta">Consulta</SelectItem>
                          <SelectItem value="exame">Exame</SelectItem>
                          <SelectItem value="procedimento">Procedimento</SelectItem>
                          <SelectItem value="evolucao">Evolução</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Título do registro"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição *</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Descreva o atendimento..."
                      rows={3}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="medical" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="diagnosis">Diagnóstico</Label>
                    <Textarea
                      id="diagnosis"
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      placeholder="Diagnóstico identificado..."
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="treatment">Tratamento</Label>
                    <Textarea
                      id="treatment"
                      value={treatment}
                      onChange={(e) => setTreatment(e.target.value)}
                      placeholder="Tratamento realizado ou prescrito..."
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Observações</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Observações adicionais..."
                      rows={3}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="attachments" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label>Anexar Arquivos</Label>
                      <div className="mt-2">
                        <input
                          type="file"
                          multiple
                          accept="image/*,.pdf,.doc,.docx"
                          onChange={(e) => setAttachments(Array.from(e.target.files || []))}
                          className="hidden"
                          id="file-upload"
                        />
                        <label htmlFor="file-upload">
                          <Button variant="outline" className="cursor-pointer" asChild>
                            <span>
                              <Upload className="h-4 w-4 mr-2" />
                              Selecionar Arquivos
                            </span>
                          </Button>
                        </label>
                        {attachments.length > 0 && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {attachments.length} arquivo(s) selecionado(s)
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
                      <Shield className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">Criptografia Ativada</p>
                        <p className="text-xs text-muted-foreground">
                          Todos os arquivos são criptografados automaticamente
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNewRecordOpen(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleAddRecord}>
                  Criar Prontuário
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Buscar por paciente, título ou diagnóstico..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="min-w-[150px]">
              <Label htmlFor="type">Tipo</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os tipos</SelectItem>
                  <SelectItem value="consulta">Consulta</SelectItem>
                  <SelectItem value="exame">Exame</SelectItem>
                  <SelectItem value="procedimento">Procedimento</SelectItem>
                  <SelectItem value="evolucao">Evolução</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Prontuários</CardTitle>
          <CardDescription>
            {filteredRecords.length} registro(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{format(record.date, "dd/MM/yyyy")}</TableCell>
                  <TableCell className="font-medium">{record.patientName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{getTypeText(record.type)}</Badge>
                  </TableCell>
                  <TableCell>{record.title}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {record.isEncrypted && <Lock className="h-4 w-4 text-green-600" />}
                      <span className="text-xs text-muted-foreground">
                        Backup: {format(record.lastBackup, "dd/MM")}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewRecord(record)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRecord(record.id)}
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

      {/* View Record Dialog */}
      <Dialog open={isViewRecordOpen} onOpenChange={setIsViewRecordOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Prontuário</DialogTitle>
            <DialogDescription>
              Informações completas do registro médico
            </DialogDescription>
          </DialogHeader>

          {selectedRecord && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Paciente</Label>
                  <p className="text-sm text-muted-foreground">{selectedRecord.patientName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Data</Label>
                  <p className="text-sm text-muted-foreground">
                    {format(selectedRecord.date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Tipo</Label>
                  <Badge variant="outline">{getTypeText(selectedRecord.type)}</Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Criado por</Label>
                  <p className="text-sm text-muted-foreground">{selectedRecord.createdBy}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Título</Label>
                <p className="text-sm text-muted-foreground">{selectedRecord.title}</p>
              </div>

              <div>
                <Label className="text-sm font-medium">Descrição</Label>
                <p className="text-sm text-muted-foreground">{selectedRecord.description}</p>
              </div>

              {selectedRecord.diagnosis && (
                <div>
                  <Label className="text-sm font-medium">Diagnóstico</Label>
                  <p className="text-sm text-muted-foreground">{selectedRecord.diagnosis}</p>
                </div>
              )}

              {selectedRecord.treatment && (
                <div>
                  <Label className="text-sm font-medium">Tratamento</Label>
                  <p className="text-sm text-muted-foreground">{selectedRecord.treatment}</p>
                </div>
              )}

              {selectedRecord.notes && (
                <div>
                  <Label className="text-sm font-medium">Observações</Label>
                  <p className="text-sm text-muted-foreground">{selectedRecord.notes}</p>
                </div>
              )}

              {selectedRecord.attachments.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Anexos</Label>
                  <div className="space-y-2 mt-2">
                    {selectedRecord.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">{attachment.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-muted-foreground">
                            {formatFileSize(attachment.size)}
                          </span>
                          <Button variant="ghost" size="sm">
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
                <Shield className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Registro Seguro</p>
                  <p className="text-xs text-muted-foreground">
                    Criptografado e backup automático • Último backup: {format(selectedRecord.lastBackup, "dd/MM/yyyy HH:mm")}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setIsViewRecordOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export { DigitalMedicalRecordTab };