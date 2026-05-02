import type { UpdateUserDto } from "@projet/shared-types";
import { RotateCcw, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { extractErrorMessage } from "../../api/api";
import { userApi } from "../../api/userApi";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import Loader from "../../components/ui/Loader";
import { useAdminUsers } from "../../hooks/useAdminUsers";

export default function AdminUsers() {
  const { users, setUsers, loading } = useAdminUsers();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // État modale
  const [actionToConfirm, setActionToConfirm] = useState<{
    type: "delete" | "restore";
    id: number;
  } | null>(null);

  // LOGIQUE DE FILTRAGE
  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Action
  const handleConfirmAction = async () => {
    if (!actionToConfirm) return;
    const { type, id } = actionToConfirm;

    try {
      if (type === "delete") {
        await userApi.deleteUser(id);
        setUsers(users.map((u) => (u.id === id ? { ...u, deletedAt: new Date() } : u)));
        toast.success("Utilisateur supprimé et anonymisé");
      } else {
        await userApi.updateUser(id, { deletedAt: null } as Partial<UpdateUserDto> & {
          deletedAt: null;
        });
        setUsers(users.map((u) => (u.id === id ? { ...u, deletedAt: null } : u)));
        toast.success("Utilisateur restauré");
      }
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(
        error,
        "Une erreur est survenue lors de l'opération."
      );
      toast.error(errorMessage);
    } finally {
      setActionToConfirm(null);
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader text="Chargement des utilisateurs..." />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 font-montserrat">
          Gestion des Utilisateurs
        </h1>
      </div>

      {/* BARRE D'OUTILS */}
      <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher par email..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:border-primary cursor-pointer"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">Tous les rôles</option>
          <option value="individual">Particuliers</option>
          <option value="shelter">Refuges</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {/* TABLEAU */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Rôle</th>
              <th className="px-6 py-4 hidden sm:table-cell">Date Inscription</th>
              <th className="px-6 py-4">Statut</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-500">#{user.id}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{user.email}</td>
                  <td className="px-6 py-4">
                    <Badge
                      label={user.role}
                      className={
                        user.role === "admin"
                          ? "text-admin"
                          : user.role === "shelter"
                            ? "text-primary"
                            : "text-info"
                      }
                    />
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell text-gray-500">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      label={user.deletedAt ? "Banni" : "Actif"}
                      variant={user.deletedAt ? "error" : "success"}
                    />
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    {user.deletedAt ? (
                      <Button
                        variant="ghost"
                        onClick={() =>
                          user.id && setActionToConfirm({ type: "restore", id: user.id })
                        }
                        className="text-primary hover:text-primary p-2"
                        title="Restaurer l'utilisateur"
                      >
                        <RotateCcw className="w-4 h-4" /> Restaurer
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        onClick={() =>
                          user.id && setActionToConfirm({ type: "delete", id: user.id })
                        }
                        className="text-gray-400 hover:text-error p-2"
                        title="Bannir l'utilisateur"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  Aucun utilisateur trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmationModal
        isOpen={!!actionToConfirm}
        onClose={() => setActionToConfirm(null)}
        onConfirm={handleConfirmAction}
        title={
          actionToConfirm?.type === "delete"
            ? "Supprimer et anonymiser l'utilisateur ?"
            : "Restaurer l'utilisateur ?"
        }
        message={
          actionToConfirm?.type === "delete"
            ? "Cette action est irréversible et conforme au RGPD. Les données personnelles seront effacées."
            : "L'utilisateur retrouvera l'accès à son compte."
        }
      />
    </div>
  );
}
