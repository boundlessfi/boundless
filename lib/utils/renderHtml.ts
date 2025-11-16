import DOMPurify from 'dompurify';

export function sanitizeHtml(html: string | undefined | null) {
  const dirty = html ?? '';

  try {
    const clean = DOMPurify.sanitize(dirty, {
      ALLOWED_TAGS: [
        'b',
        'i',
        'em',
        'strong',
        'a',
        'p',
        'ul',
        'ol',
        'li',
        'br',
        'span',
        'div',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'img',
        'code',
        'pre',
        'blockquote',
        'small',
        'sup',
        'sub',
      ],
      ALLOWED_ATTR: [
        'href',
        'target',
        'rel',
        'class',
        'id',
        'title',
        'alt',
        'src',
      ],
    });
    return { __html: clean };
  } catch (err) {
    console.error(err);
    return { __html: dirty };
  }
}
