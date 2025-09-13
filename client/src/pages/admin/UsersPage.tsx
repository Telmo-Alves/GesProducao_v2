import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/Table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '../../components/ui/Dialog';
import { Plus, Edit2, Trash2, UserPlus, AlertTriangle } from 'lucide-react';
import { usersApi } from '../../services/api';
import { User, CreateUserRequest, UpdateUserRequest } from '../../types';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<CreateUserRequest>({
    username: '',
    email: '',
    password: '',
    role: 'viewer',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await usersApi.getAllUsers();
      if (response.data.success) {
        setUsers(response.data.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar utilizadores:', error);
      setError('Erro ao carregar utilizadores');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      setError('');
      
      if (!formData.username || !formData.email || !formData.password) {
        setError('Todos os campos são obrigatórios');
        return;
      }

      const response = await usersApi.createUser(formData);
      
      if (response.data.success) {
        setIsCreateDialogOpen(false);
        setFormData({
          username: '',
          email: '',
          password: '',
          role: 'viewer',
        });
        loadUsers();
      } else {
        setError(response.data.error || 'Erro ao criar utilizador');
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Erro ao criar utilizador');
    }
  };

  const handleEdit = async () => {
    if (!selectedUser) return;

    try {
      setError('');
      
      const updateData: UpdateUserRequest = {
        role: formData.role,
        active: selectedUser.active,
      };

      const response = await usersApi.updateUser(selectedUser.id, updateData);
      
      if (response.data.success) {
        setIsEditDialogOpen(false);
        setSelectedUser(null);
        loadUsers();
      } else {
        setError(response.data.error || 'Erro ao atualizar utilizador');
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Erro ao atualizar utilizador');
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      setError('');
      
      const response = await usersApi.deleteUser(selectedUser.id);
      
      if (response.data.success) {
        setIsDeleteDialogOpen(false);
        setSelectedUser(null);
        loadUsers();
      } else {
        setError(response.data.error || 'Erro ao eliminar utilizador');
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Erro ao eliminar utilizador');
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      role: user.role,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'operator': return 'Operador';
      case 'viewer': return 'Visualizador';
      default: return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'operator': return 'bg-blue-100 text-blue-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Utilizadores</h1>
          <p className="text-gray-600">Gerir utilizadores do sistema</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Utilizador
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Utilizadores</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilizador</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Papel</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Secção</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full ${getRoleBadgeColor(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {user.isAdmin ? (
                      <span className="text-green-600 font-medium">Sim</span>
                    ) : (
                      <span className="text-gray-500">Não</span>
                    )}
                  </TableCell>
                  <TableCell>{user.seccao}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(user)}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openDeleteDialog(user)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)}>
        <DialogHeader>
          <DialogTitle>
            <UserPlus className="h-5 w-5 mr-2 inline" />
            Criar Novo Utilizador
          </DialogTitle>
          <DialogClose onClick={() => setIsCreateDialogOpen(false)} />
        </DialogHeader>
        <DialogContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome de Utilizador
              </label>
              <Input
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Introduza o nome de utilizador"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Introduza o email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Introduza a password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Papel
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600"
              >
                <option value="viewer">Visualizador</option>
                <option value="operator">Operador</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCreate}>
            Criar Utilizador
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)}>
        <DialogHeader>
          <DialogTitle>
            <Edit2 className="h-5 w-5 mr-2 inline" />
            Editar Utilizador
          </DialogTitle>
          <DialogClose onClick={() => setIsEditDialogOpen(false)} />
        </DialogHeader>
        <DialogContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome de Utilizador
              </label>
              <Input
                value={formData.username}
                disabled
                className="bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Papel
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600"
              >
                <option value="viewer">Visualizador</option>
                <option value="operator">Operador</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleEdit}>
            Atualizar
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}>
        <DialogHeader>
          <DialogTitle>
            <AlertTriangle className="h-5 w-5 mr-2 inline text-red-600" />
            Confirmar Eliminação
          </DialogTitle>
          <DialogClose onClick={() => setIsDeleteDialogOpen(false)} />
        </DialogHeader>
        <DialogContent>
          <p>
            Tem a certeza que deseja eliminar o utilizador{' '}
            <strong>{selectedUser?.username}</strong>?
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Esta ação não pode ser desfeita.
          </p>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Eliminar
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};