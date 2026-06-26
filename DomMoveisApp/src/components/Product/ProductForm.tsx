import React, { useEffect, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import type { Category } from '../../api/types/category';
import type { CreateProductDTO } from '../../api/types/product';
import { ImageUpload } from '../common/ImageUpload';
import { Save, X } from 'lucide-react';

// ============================================================
// SCHEMA
// ============================================================
const productSchema = z.object({
  nome: z.string().min(3, 'Mínimo 3 caracteres').max(100),
  descricao: z.string().min(10, 'Mínimo 10 caracteres').max(2000),
  categoria: z.string().min(1, 'Selecione uma categoria'),
  cor: z.string().min(1, 'Cor é obrigatória').max(30),

  preco: z.string().optional(),
  precoPromocional: z.string().optional(),
  estoque: z.string().default('0'),

  medidas: z.object({
    altura: z.string().optional(),
    largura: z.string().optional(),
    profundidade: z.string().optional(),
    peso: z.string().optional(),
    unidadeMedida: z.enum(['cm', 'm', 'kg']).default('cm'),
  }).default({ unidadeMedida: 'cm' }),

  destaque: z.boolean().default(false),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  onSuccess?: (data: any) => void;
  onCancel?: () => void;
  initialData?: Partial<ProductFormData> & { imagens?: string[] };
  isEditing?: boolean;
  productId?: string;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  onSuccess,
  onCancel,
  initialData,
  isEditing = false,
  productId,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>(initialData?.imagens || []);
  const [uploading, setUploading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      medidas: { unidadeMedida: 'cm' },
      estoque: '0',
      destaque: false,
      ...(initialData || {}),
    },
  });

  // Carregar categorias
  useEffect(() => {
    categoryService.getAll()
      .then(setCategories)
      .catch(console.error);
  }, []);

  // Carregar dados do produto se estiver editando e não tiver initialData
  useEffect(() => {
    if (isEditing && productId && !initialData) {
      setLoadingData(true);
      productService.getById(productId)
        .then((product) => {
          setValue('nome', product.nome);
          setValue('descricao', product.descricao);
          setValue('categoria', typeof product.categoria === 'string' ? product.categoria : product.categoria._id);
          setValue('cor', product.cor);
          setValue('preco', product.preco?.toString() || '');
          setValue('precoPromocional', product.precoPromocional?.toString() || '');
          setValue('estoque', product.estoque?.toString() || '0');
          setValue('destaque', product.destaque || false);
          if (product.medidas) {
            setValue('medidas.altura', product.medidas.altura?.toString() || '');
            setValue('medidas.largura', product.medidas.largura?.toString() || '');
            setValue('medidas.profundidade', product.medidas.profundidade?.toString() || '');
            setValue('medidas.peso', product.medidas.peso?.toString() || '');
            setValue('medidas.unidadeMedida', product.medidas.unidadeMedida || 'cm');
          }
          if (product.imagens && product.imagens.length > 0) {
            setImageUrls(product.imagens);
          }
        })
        .catch((err) => {
          console.error(err);
          alert('Erro ao carregar produto');
        })
        .finally(() => setLoadingData(false));
    }
  }, [isEditing, productId, initialData, setValue]);

  const onSubmit: SubmitHandler<ProductFormData> = async (data) => {
    if (imageUrls.length === 0) {
      alert('Selecione pelo menos uma imagem.');
      return;
    }

    setUploading(true);
    try {
      const precoNum = data.preco ? parseFloat(data.preco) : undefined;
      const precoPromoNum = data.precoPromocional ? parseFloat(data.precoPromocional) : undefined;
      const estoqueNum = parseInt(data.estoque || '0', 10);

      const medidasNum = {
        altura: data.medidas.altura ? parseFloat(data.medidas.altura) : undefined,
        largura: data.medidas.largura ? parseFloat(data.medidas.largura) : undefined,
        profundidade: data.medidas.profundidade ? parseFloat(data.medidas.profundidade) : undefined,
        peso: data.medidas.peso ? parseFloat(data.medidas.peso) : undefined,
        unidadeMedida: data.medidas.unidadeMedida,
      };

      const payload: CreateProductDTO = {
        nome: data.nome,
        descricao: data.descricao,
        categoria: data.categoria,
        cor: data.cor,
        preco: precoNum ?? 0,
        precoPromocional: precoPromoNum,
        estoque: estoqueNum,
        medidas: medidasNum,
        imagens: imageUrls,
        destaque: data.destaque,
      };

      let result;
      if (isEditing && productId) {
        result = await productService.update(productId, payload);
        alert('Produto atualizado com sucesso!');
      } else {
        result = await productService.create(payload);
        alert('Produto criado com sucesso!');
      }

      reset();
      setImageUrls([]);
      onSuccess?.(result);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao salvar produto');
    } finally {
      setUploading(false);
    }
  };

  if (loadingData) {
    return <div className="text-center py-8">Carregando produto...</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="product-form">
      {/* Nome */}
      <div className="product-form-field">
        <label className="product-form-label">Nome do Produto *</label>
        <input
          {...register('nome')}
          className="product-form-input"
          placeholder="Ex: Sofá Retrátil 3 Lugares"
        />
        {errors.nome && <p className="product-form-error">{errors.nome.message}</p>}
      </div>

      {/* Descrição */}
      <div className="product-form-field">
        <label className="product-form-label">Descrição *</label>
        <textarea
          {...register('descricao')}
          className="product-form-textarea"
          placeholder="Descrição detalhada do produto"
          rows={4}
        />
        {errors.descricao && <p className="product-form-error">{errors.descricao.message}</p>}
      </div>

      {/* Categoria */}
      <div className="product-form-field">
        <label className="product-form-label">Categoria *</label>
        <select {...register('categoria')} className="product-form-select">
          <option value="">Selecione...</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.nome}
            </option>
          ))}
        </select>
        {errors.categoria && <p className="product-form-error">{errors.categoria.message}</p>}
      </div>

      {/* Cor */}
      <div className="product-form-field">
        <label className="product-form-label">Cor *</label>
        <input
          {...register('cor')}
          className="product-form-input"
          placeholder="Ex: Cinza Escuro"
        />
        {errors.cor && <p className="product-form-error">{errors.cor.message}</p>}
      </div>

      {/* Preços */}
      <div className="product-form-grid">
        <div className="product-form-field">
          <label className="product-form-label">Preço (R$)</label>
          <input
            type="number"
            step="0.01"
            {...register('preco')}
            className="product-form-input"
            placeholder="0,00"
          />
          {errors.preco && <p className="product-form-error">{errors.preco.message}</p>}
        </div>
        <div className="product-form-field">
          <label className="product-form-label">Preço Promocional</label>
          <input
            type="number"
            step="0.01"
            {...register('precoPromocional')}
            className="product-form-input"
            placeholder="0,00"
          />
        </div>
      </div>

      {/* Estoque */}
      <div className="product-form-field">
        <label className="product-form-label">Estoque *</label>
        <input
          type="number"
          {...register('estoque')}
          className="product-form-input"
          placeholder="0"
        />
        {errors.estoque && <p className="product-form-error">{errors.estoque.message}</p>}
      </div>

      {/* Medidas */}
      <fieldset className="product-form-fieldset">
        <legend>Medidas</legend>
        <div className="product-form-grid">
          <div className="product-form-field">
            <label className="product-form-label">Altura</label>
            <input
              type="number"
              step="0.1"
              {...register('medidas.altura')}
              className="product-form-input"
              placeholder="cm"
            />
          </div>
          <div className="product-form-field">
            <label className="product-form-label">Largura</label>
            <input
              type="number"
              step="0.1"
              {...register('medidas.largura')}
              className="product-form-input"
              placeholder="cm"
            />
          </div>
          <div className="product-form-field">
            <label className="product-form-label">Profundidade</label>
            <input
              type="number"
              step="0.1"
              {...register('medidas.profundidade')}
              className="product-form-input"
              placeholder="cm"
            />
          </div>
          <div className="product-form-field">
            <label className="product-form-label">Peso (kg)</label>
            <input
              type="number"
              step="0.1"
              {...register('medidas.peso')}
              className="product-form-input"
              placeholder="kg"
            />
          </div>
          <div className="product-form-field">
            <label className="product-form-label">Unidade</label>
            <select {...register('medidas.unidadeMedida')} className="product-form-select">
              <option value="cm">cm</option>
              <option value="m">m</option>
              <option value="kg">kg</option>
            </select>
          </div>
        </div>
      </fieldset>

      {/* Imagens */}
      <div className="product-form-field">
        <label className="product-form-label">Imagens *</label>
        <ImageUpload
          onImagesChange={setImageUrls}
          maxFiles={5}
          initialImages={imageUrls}
        />
        {imageUrls.length === 0 && (
          <p className="product-form-error">Selecione pelo menos uma imagem</p>
        )}
      </div>

      {/* Destaque */}
      <div className="product-form-field" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
        <input type="checkbox" {...register('destaque')} id="destaque" />
        <label htmlFor="destaque" className="product-form-label" style={{ marginBottom: 0 }}>
          Destacar produto
        </label>
      </div>

      {/* Ações */}
      <div className="product-form-actions">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="product-form-btn product-form-btn-secondary"
          >
            <X className="w-4 h-4" />
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting || uploading || imageUrls.length === 0}
          className="product-form-submit"
        >
          <Save className="w-4 h-4" />
          {uploading ? 'Enviando imagens...' : isSubmitting ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar'}
        </button>
      </div>
    </form>
  );
};