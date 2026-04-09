/**
 * Cria um slug amigável para URL a partir do nome do produto
 * Ex: "Smartphone Galaxy S24" -> "smartphone-galaxy-s24-123"
 */
export const createProductSlug = (name: string, id: number): string => {
  if (!name) return `product-${id}`;
  
  const slug = name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-')     // Substitui espaços por hífens
    .replace(/-+/g, '-')      // Remove hífens duplicados
    .trim();
  
  return `${slug}-${id}`;
};

/**
 * Extrai o ID do produto a partir do slug
 * Ex: "smartphone-galaxy-s24-123" -> 123
 */
export const extractIdFromSlug = (slug: string): number | null => {
  if (!slug) return null;
  
  const parts = slug.split('-');
  const lastPart = parts[parts.length - 1];
  const id = parseInt(lastPart, 10);
  
  return isNaN(id) ? null : id;
};

/**
 * Extrai o nome do produto a partir do slug (sem o ID)
 * Ex: "smartphone-galaxy-s24-123" -> "smartphone-galaxy-s24"
 */
export const extractNameFromSlug = (slug: string): string => {
  if (!slug) return '';
  
  const parts = slug.split('-');
  parts.pop(); // Remove o ID
  return parts.join('-');
};