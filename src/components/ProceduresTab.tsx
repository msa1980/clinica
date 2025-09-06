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
import { Search, Plus, Eye, Edit, Trash2, Stethoscope } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Procedure {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
  category: string;
  status: 'active' | 'inactive';
  createdAt: Date;
}

const ProceduresTab = () => {
  const [procedures, setProcedures] = useState<Procedure[]>([
    {
      id: "1",
      name: "Limpeza Dental",
      description: "Limpeza profissional completa com remoção de placa e tártaro",
      duration: 60,
      price: 150.00,
      category: "Preventiva",
      status: "active",
      createdAt: new Date()
    },
    {
      id: "2",
      name: "Consulta de Rotina",
      description: "Avaliação geral da saúde bucal",
      duration: 30,
      price: 80.00,
      category: "Consulta",
      status: "active",
      createdAt: new Date()
    },
    {
      id: "3",
      name: "Tratamento de Canal",
      description: "Endodontia completa",
      duration: 90,
      price: 500.00,
      category: "Endodontia",
      status: "active",
      createdAt: new Date()
    }
  ]);

  const [categories, setCategories] = useState<string[]>([
    "Consulta",
    "Preventiva",
    "Restauradora",
    "Cirúrgica",
    "Endodontia",
    "Ortodontia",
    "Estética"
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isNewProcedureOpen, setIsNewProcedureOpen] = useState(false);
  const [selectedProcedure, setSelectedProcedure] = useState<Procedure | null>(null);
  const [isViewProcedureOpen, setIsViewProcedureOpen] = useState(false);
  const [isCategoryManagementOpen, setIsCategoryManagementOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingCategoryValue, setEditingCategoryValue] = useState("");
  const { toast } = useToast();

  // Form states for new procedure
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");

  const filteredProcedures = procedures.filter(procedure =>
    procedure.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    procedure.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProcedure = () => {
    if (!name || !description || !duration || !price || !category) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (selectedProcedure) {
      // Editando procedimento existente
      const updatedProcedure: Procedure = {
        ...selectedProcedure,
        name,
        description,
        duration: parseInt(duration),
        price: parseFloat(price),
        category,
        status
      };

      setProcedures(procedures.map(p => p.id === selectedProcedure.id ? updatedProcedure : p));
    } else {
      // Criando novo procedimento
      const newProcedure: Procedure = {
        id: Date.now().toString(),
        name,
        description,
        duration: parseInt(duration),
        price: parseFloat(price),
        category,
        status,
        createdAt: new Date()
      };

      setProcedures([...procedures, newProcedure]);
    }

    // Clear form
    setName("");
    setDescription("");
    setDuration("");
    setPrice("");
    setCategory("");
    setStatus("active");
    setSelectedProcedure(null);

    setIsNewProcedureOpen(false);

    toast({
      title: "Sucesso!",
      description: selectedProcedure ? "Procedimento atualizado com sucesso." : "Procedimento cadastrado com sucesso.",
    });
  };

  const handleViewProcedure = (procedure: Procedure) => {
    setSelectedProcedure(procedure);
    setIsViewProcedureOpen(true);
  };

  const handleEditProcedure = (procedure: Procedure) => {
    // Preencher os estados com os dados do procedimento selecionado
    setName(procedure.name);
    setDescription(procedure.description);
    setDuration(procedure.duration.toString());
    setPrice(procedure.price.toString());
    setCategory(procedure.category);
    setStatus(procedure.status);
    setSelectedProcedure(procedure);
    setIsNewProcedureOpen(true);
  };

  const handleDeleteProcedure = (procedureId: string) => {
    setProcedures(procedures.filter(p => p.id !== procedureId));
    toast({
      title: "Sucesso!",
      description: "Procedimento removido com sucesso.",
    });
  };

  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, digite o nome da categoria.",
        variant: "destructive",
      });
      return;
    }

    if (categories.includes(newCategory.trim())) {
      toast({
        title: "Erro",
        description: "Esta categoria já existe.",
        variant: "destructive",
      });
      return;
    }

    setCategories([...categories, newCategory.trim()]);
    setNewCategory("");
    toast({
      title: "Sucesso!",
      description: "Categoria adicionada com sucesso.",
    });
  };

  const handleEditCategory = (oldCategory: string) => {
    setEditingCategory(oldCategory);
    setEditingCategoryValue(oldCategory);
  };

  const handleSaveEditCategory = () => {
    if (!editingCategoryValue.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, digite o nome da categoria.",
        variant: "destructive",
      });
      return;
    }

    if (categories.includes(editingCategoryValue.trim()) && editingCategoryValue.trim() !== editingCategory) {
      toast({
        title: "Erro",
        description: "Esta categoria já existe.",
        variant: "destructive",
      });
      return;
    }

    setCategories(categories.map(cat => cat === editingCategory ? editingCategoryValue.trim() : cat));
    // Update procedures that use this category
    setProcedures(procedures.map(proc =>
      proc.category === editingCategory ? { ...proc, category: editingCategoryValue.trim() } : proc
    ));
    setEditingCategory(null);
    setEditingCategoryValue("");
    toast({
      title: "Sucesso!",
      description: "Categoria atualizada com sucesso.",
    });
  };

  const handleDeleteCategory = (categoryToDelete: string) => {
    if (procedures.some(proc => proc.category === categoryToDelete)) {
      toast({
        title: "Erro",
        description: "Não é possível excluir uma categoria que está sendo usada por procedimentos.",
        variant: "destructive",
      });
      return;
    }

    setCategories(categories.filter(cat => cat !== categoryToDelete));
    toast({
      title: "Sucesso!",
      description: "Categoria removida com sucesso.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestão de Procedimentos</h2>
          <p className="text-muted-foreground">Cadastro e gerenciamento de procedimentos odontológicos</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isCategoryManagementOpen} onOpenChange={setIsCategoryManagementOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Stethoscope className="h-4 w-4 mr-2" />
                Gerenciar Categorias
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Gerenciar Categorias</DialogTitle>
                <DialogDescription>
                  Adicione, edite ou remova categorias de procedimentos
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Add new category */}
                <div className="flex space-x-2">
                  <Input
                    placeholder="Nova categoria..."
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                  <Button onClick={handleAddCategory}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>

                {/* Categories list */}
                <div className="space-y-2">
                  <Label>Categorias Existentes</Label>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {categories.map((cat) => (
                      <div key={cat} className="flex items-center justify-between p-2 border rounded">
                        {editingCategory === cat ? (
                          <div className="flex space-x-2 flex-1">
                            <Input
                              value={editingCategoryValue}
                              onChange={(e) => setEditingCategoryValue(e.target.value)}
                              className="flex-1"
                            />
                            <Button size="sm" onClick={handleSaveEditCategory}>
                              Salvar
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingCategory(null)}>
                              Cancelar
                            </Button>
                          </div>
                        ) : (
                          <>
                            <span>{cat}</span>
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditCategory(cat)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteCategory(cat)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button onClick={() => setIsCategoryManagementOpen(false)}>
                  Fechar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={isNewProcedureOpen} onOpenChange={setIsNewProcedureOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Procedimento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{selectedProcedure ? "Editar Procedimento" : "Cadastrar Novo Procedimento"}</DialogTitle>
                <DialogDescription>
                  {selectedProcedure ? "Atualize as informações do procedimento" : "Preencha as informações do procedimento"}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Procedimento *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Digite o nome do procedimento"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição *</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descreva o procedimento..."
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duração (minutos) *</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="30"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Preço (R$) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="100.00"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria *</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={status} onValueChange={(value: "active" | "inactive") => setStatus(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="inactive">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNewProcedureOpen(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleAddProcedure}>
                  {selectedProcedure ? "Atualizar" : "Cadastrar"} Procedimento
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Procedures Table */}
      <Card>
        <CardHeader>
          <CardTitle>Procedimentos Cadastrados</CardTitle>
          <CardDescription>
            {filteredProcedures.length} procedimento(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProcedures.map((procedure) => (
                <TableRow key={procedure.id}>
                  <TableCell className="font-medium">{procedure.name}</TableCell>
                  <TableCell>{procedure.category}</TableCell>
                  <TableCell>{procedure.duration} min</TableCell>
                  <TableCell>R$ {procedure.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={procedure.status === 'active' ? 'default' : 'secondary'}>
                      {procedure.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewProcedure(procedure)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditProcedure(procedure)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteProcedure(procedure.id)}
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

      {/* View Procedure Dialog */}
      <Dialog open={isViewProcedureOpen} onOpenChange={setIsViewProcedureOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalhes do Procedimento</DialogTitle>
            <DialogDescription>
              Informações completas do procedimento
            </DialogDescription>
          </DialogHeader>

          {selectedProcedure && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Nome</Label>
                <p className="text-sm text-muted-foreground">{selectedProcedure.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Descrição</Label>
                <p className="text-sm text-muted-foreground">{selectedProcedure.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Duração</Label>
                  <p className="text-sm text-muted-foreground">{selectedProcedure.duration} minutos</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Preço</Label>
                  <p className="text-sm text-muted-foreground">R$ {selectedProcedure.price.toFixed(2)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Categoria</Label>
                  <p className="text-sm text-muted-foreground">{selectedProcedure.category}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge variant={selectedProcedure.status === 'active' ? 'default' : 'secondary'}>
                    {selectedProcedure.status === 'active' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setIsViewProcedureOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export { ProceduresTab };