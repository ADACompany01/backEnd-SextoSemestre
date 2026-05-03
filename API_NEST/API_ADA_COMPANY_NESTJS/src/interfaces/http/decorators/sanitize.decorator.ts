import { Transform } from 'class-transformer';

/**
 * Decorador para sanitizar strings removendo tags HTML e scripts maliciosos
 * Previne ataques XSS (Cross-Site Scripting)
 */
export function Sanitize() {
  return Transform(({ value }) => {
    if (typeof value !== 'string') {
      return value;
    }
    
    // Remove tags HTML
    let sanitized = value.replace(/<[^>]*>/g, '');
    
    // Remove scripts inline
    sanitized = sanitized.replace(/javascript:/gi, '');
    sanitized = sanitized.replace(/on\w+\s*=/gi, '');
    
    // Remove espaços extras no início e fim
    sanitized = sanitized.trim();
    
    return sanitized;
  });
}

/**
 * Decorador para sanitizar strings removendo APENAS tags HTML perigosas
 * Permite tags seguras como <b>, <i>, <p>, etc.
 */
export function SanitizeBasic() {
  return Transform(({ value }) => {
    if (typeof value !== 'string') {
      return value;
    }
    
    // Remove apenas tags perigosas (script, iframe, object, embed)
    let sanitized = value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
    sanitized = sanitized.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');
    sanitized = sanitized.replace(/<embed[^>]*>/gi, '');
    
    // Remove event handlers inline
    sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
    sanitized = sanitized.replace(/javascript:/gi, '');
    
    // Remove espaços extras
    sanitized = sanitized.trim();
    
    return sanitized;
  });
}

/**
 * Decorador para escapar caracteres especiais HTML
 * Útil para dados que serão exibidos em HTML
 */
export function EscapeHtml() {
  return Transform(({ value }) => {
    if (typeof value !== 'string') {
      return value;
    }
    
    const htmlEscapeMap: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;',
    };
    
    return value.replace(/[&<>"'\/]/g, (char) => htmlEscapeMap[char]);
  });
}



