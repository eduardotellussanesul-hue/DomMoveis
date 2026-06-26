import React from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { categoryService } from '../../services/categoryService';
import type { CreateCategoryDTO, UpdateCategoryDTO } from '../../api/types/category';
import { Save, X } from 'lucide-react';

const categorySchema = z.object({
  nome: z.string()
    .min(3, 'Mínimo 3 caracteres')
    .max(50, 'Máximo 50 caracteres'),
  descricao: z.string()
    .max(200, 'Máximo 200 caracteres')
    .optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  onSuccess?: (data: any) => void;
  onCancel?: () => void;
  initialData?: Partial<CategoryFormData>;
  isEditing?: boolean;
  categoryId?: string; // ID para edição
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  onSuccess,
  onCancel,
  initialData,
  isEditing = false,
  categoryId,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: initialData,
  });

  const onSubmit: SubmitHandler<CategoryFormData> = async (data) => {
    try {
      let result;
      if (isEditing && categoryId) {
        // Edição: chama update
        result = await categoryService.update(categoryId, data as UpdateCategoryDTO);
        alert('Categoria atualizada com sucesso!');
      } else {
        // Criação: chama create
        result = await categoryService.create(data as CreateCategoryDTO);
        alert('Categoria criada com sucesso!');
      }
      reset();
      onSuccess?.(result);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao salvar categoria');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="category-form">
      <div className="category-form-field">
        <label className="category-form-label">Nome *</label>
        <input
          {...register('nome')}
          className="category-form-input"
          placeholder="Ex: Sofás"
        />
        {errors.nome && (
          <p className="category-form-error">{errors.nome.message}</p>
        )}
      </div>

      <div className="category-form-field">
        <label className="category-form-label">Descrição</label>
        <textarea
          {...register('descricao')}
          className="category-form-textarea"
          placeholder="Descrição da categoria (opcional)"
        />
        {errors.descricao && (
          <p className="category-form-error">{errors.descricao.message}</p>
        )}
      </div>

      <div className="category-form-actions">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="category-form-btn category-form-btn-secondary"
          >
            <X className="w-4 h-4" />
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="category-form-btn category-form-btn-primary"
        >
          <Save className="w-4 h-4" />
          {isSubmitting ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar'}
        </button>
      </div>
    </form>
  );
};