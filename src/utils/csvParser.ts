/**
 * RFC 4180-compliant CSV Parser and Product Transformer
 */

export interface ParsedProductItem {
  rowNumber: number;
  raw: Record<string, string>;
  isValid: boolean;
  errors: string[];
  warnings: string[];
  product: {
    title: string;
    price: number;
    originalPrice?: number;
    discountPercent?: number;
    inventory: number;
    category: string;
    status: 'Active' | 'Draft' | 'Archived';
    description?: string;
    shortDescription?: string;
    tagline?: string;
    badge?: string;
    image: string;
    images: string[];
    variants: string[];
  };
}

export interface CSVParseResult {
  totalRows: number;
  validCount: number;
  errorCount: number;
  items: ParsedProductItem[];
  headers: string[];
  detectedDelimiter: string;
}

/**
 * Detects the dominant delimiter in the first few lines of CSV text.
 */
function detectDelimiter(text: string): string {
  const firstLines = text.slice(0, 1000).split(/\r?\n/)[0] || '';
  const commaCount = (firstLines.match(/,/g) || []).length;
  const semicolonCount = (firstLines.match(/;/g) || []).length;
  const tabCount = (firstLines.match(/\t/g) || []).length;

  if (tabCount > commaCount && tabCount > semicolonCount) return '\t';
  if (semicolonCount > commaCount) return ';';
  return ',';
}

/**
 * Parse CSV text into a 2D array of strings supporting quotes, multiline values, and delimiters.
 */
export function parseRawCSV(csvText: string): { headers: string[]; rows: string[][]; delimiter: string } {
  // Strip UTF-8 Byte Order Mark (BOM) if present
  let cleanText = csvText.replace(/^\uFEFF/, '');
  const delimiter = detectDelimiter(cleanText);

  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuotes = false;

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped quote ("")
          currentCell += '"';
          i++; // Skip the second quote
        } else {
          // Closing quote
          inQuotes = false;
        }
      } else {
        currentCell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === delimiter) {
        currentRow.push(currentCell.trim());
        currentCell = '';
      } else if (char === '\r') {
        // Carriage return: skip if followed by newline
        if (nextChar === '\n') {
          i++;
        }
        currentRow.push(currentCell.trim());
        if (currentRow.some(c => c !== '')) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentCell = '';
      } else if (char === '\n') {
        currentRow.push(currentCell.trim());
        if (currentRow.some(c => c !== '')) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
  }

  // Push any remaining content
  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some(c => c !== '')) {
      rows.push(currentRow);
    }
  }

  if (rows.length === 0) {
    return { headers: [], rows: [], delimiter };
  }

  const rawHeaders = rows[0].map(h => h.trim());
  const dataRows = rows.slice(1);

  return {
    headers: rawHeaders,
    rows: dataRows,
    delimiter
  };
}

/**
 * Normalizes header string to find matching product fields.
 */
function mapHeaderKey(header: string): string | null {
  const norm = header.toLowerCase().replace(/[^a-z0-9]/g, '');

  if (/^(title|productname|name|item|itemname)$/.test(norm)) return 'title';
  if (/^(price|sellingprice|rate|mrp|cost|unitprice)$/.test(norm)) return 'price';
  if (/^(originalprice|marketprice|compareatprice|listprice|regularprice)$/.test(norm)) return 'originalPrice';
  if (/^(inventory|stock|quantity|qty|units|stockqty)$/.test(norm)) return 'inventory';
  if (/^(category|collection|type|department|group)$/.test(norm)) return 'category';
  if (/^(status|state|publishstatus)$/.test(norm)) return 'status';
  if (/^(description|desc|details|body)$/.test(norm)) return 'description';
  if (/^(shortdescription|shortdesc|tagline|summary|subtitle)$/.test(norm)) return 'shortDescription';
  if (/^(badge|tag|label|highlight)$/.test(norm)) return 'badge';
  if (/^(image|imageurl|photo|thumbnail|mainimage)$/.test(norm)) return 'image';
  if (/^(images|gallery|additionalimages|imageurls)$/.test(norm)) return 'images';
  if (/^(variants|options|colors|sizes|styles)$/.test(norm)) return 'variants';

  return null;
}

/**
 * Parse currency and number strings into numeric values safely.
 */
function cleanNumeric(val: any): number {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  const cleaned = String(val).replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Validates and transforms parsed CSV data into a list of structured products with diagnostics.
 */
export function validateAndTransformCSV(csvText: string): CSVParseResult {
  const { headers, rows, delimiter } = parseRawCSV(csvText);

  // Map header indices to known product fields
  const fieldIndexMap: Record<string, number> = {};
  headers.forEach((header, idx) => {
    const mapped = mapHeaderKey(header);
    if (mapped && fieldIndexMap[mapped] === undefined) {
      fieldIndexMap[mapped] = idx;
    }
  });

  const items: ParsedProductItem[] = [];

  rows.forEach((row, rowIndex) => {
    const rowNumber = rowIndex + 2; // +1 for 0-index, +1 for header
    const raw: Record<string, string> = {};
    headers.forEach((h, i) => {
      raw[h] = row[i] !== undefined ? row[i] : '';
    });

    const getVal = (field: string): string => {
      const idx = fieldIndexMap[field];
      return idx !== undefined && row[idx] !== undefined ? row[idx].trim() : '';
    };

    const errors: string[] = [];
    const warnings: string[] = [];

    // Title validation
    const title = getVal('title');
    if (!title) {
      errors.push('Missing product title');
    } else if (title.length > 200) {
      warnings.push('Title truncated to 200 characters');
    }

    // Price validation
    const rawPrice = getVal('price');
    const price = cleanNumeric(rawPrice);
    if (!rawPrice) {
      errors.push('Missing price');
    } else if (price < 0 || isNaN(price)) {
      errors.push('Price must be a valid positive number');
    }

    // Original Price & Discount calculation
    const rawOriginalPrice = getVal('originalPrice');
    let originalPrice = rawOriginalPrice ? cleanNumeric(rawOriginalPrice) : undefined;
    if (originalPrice && originalPrice < price) {
      warnings.push('Original price is lower than selling price');
    }
    if (!originalPrice && price > 0) {
      originalPrice = Math.round(price * 1.5);
    }
    const discountPercent = originalPrice && originalPrice > price 
      ? Math.round(((originalPrice - price) / originalPrice) * 100) 
      : undefined;

    // Inventory validation
    const rawInventory = getVal('inventory');
    const inventory = rawInventory ? Math.max(0, Math.floor(cleanNumeric(rawInventory))) : 15;
    if (rawInventory && isNaN(Number(rawInventory))) {
      warnings.push('Invalid stock quantity, defaulting to 15');
    }

    // Category
    const category = getVal('category') || 'General';

    // Status
    const rawStatus = getVal('status').toLowerCase();
    let status: 'Active' | 'Draft' | 'Archived' = 'Active';
    if (rawStatus === 'draft') status = 'Draft';
    else if (rawStatus === 'archived') status = 'Archived';
    else if (rawStatus && rawStatus !== 'active') {
      warnings.push(`Unknown status "${rawStatus}", defaulted to Active`);
    }

    // Description & shortDescription
    const description = getVal('description') || '';
    const shortDescription = getVal('shortDescription') || (description ? description.slice(0, 140) : '');
    const badge = getVal('badge') || (discountPercent && discountPercent >= 40 ? `${discountPercent}% OFF` : 'POPULAR');

    // Images
    const rawImage = getVal('image');
    const rawImages = getVal('images');
    let imageList: string[] = [];

    if (rawImages) {
      // Split by comma or pipe
      imageList = rawImages
        .split(/[,|]/)
        .map(url => url.trim())
        .filter(url => url.startsWith('http://') || url.startsWith('https://'));
    }

    let mainImage = rawImage;
    if (!mainImage && imageList.length > 0) {
      mainImage = imageList[0];
    } else if (!mainImage) {
      mainImage = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800';
      warnings.push('No image provided, assigned default placeholder');
    } else if (!mainImage.startsWith('http://') && !mainImage.startsWith('https://')) {
      warnings.push('Image is not a valid web URL, using placeholder');
      mainImage = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800';
    }

    if (imageList.length === 0) {
      imageList = [mainImage];
    }

    // Variants (pipe or comma separated)
    const rawVariants = getVal('variants');
    let variants: string[] = ['Standard'];
    if (rawVariants) {
      const parsedVariants = rawVariants
        .split(/[|,]/)
        .map(v => v.trim())
        .filter(Boolean);
      if (parsedVariants.length > 0) {
        variants = parsedVariants;
      }
    }

    const isValid = errors.length === 0;

    items.push({
      rowNumber,
      raw,
      isValid,
      errors,
      warnings,
      product: {
        title: title.slice(0, 200),
        price,
        originalPrice,
        discountPercent,
        inventory,
        category,
        status,
        description,
        shortDescription,
        badge,
        image: mainImage,
        images: imageList,
        variants
      }
    });
  });

  const validCount = items.filter(i => i.isValid).length;
  const errorCount = items.length - validCount;

  return {
    totalRows: items.length,
    validCount,
    errorCount,
    items,
    headers,
    detectedDelimiter: delimiter
  };
}

/**
 * Escapes a cell value for standard CSV output.
 */
function escapeCSVCell(val: any): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generates a ready-to-use CSV sample template with well-structured example products.
 */
export function generateSampleCSV(): string {
  const headers = [
    'title',
    'price',
    'original_price',
    'inventory',
    'category',
    'status',
    'badge',
    'variants',
    'image',
    'images',
    'short_description',
    'description'
  ];

  const sampleRows = [
    [
      'Bathroom Hair Tool Organizer Rack – Wall Mounted Hair Dryer & Straightener Holder',
      '449',
      '899',
      '30',
      'Home & Bath',
      'Active',
      '50% OFF',
      'Matte Black | Glossy White | Metallic Grey',
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800',
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800,https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800',
      'Wall-mounted heavy-duty metal bathroom organizer with heat-resistant hair tool dock and cable clips.',
      'Clear your bathroom counter effortlessly. Safely dock hot hair dryers, curling wands, straighteners, and brushes immediately after styling.'
    ],
    [
      'X4cart Touch Control LED Table Lamp – USB Rechargeable Night Light (3-Color Dimmable)',
      '599',
      '1199',
      '45',
      'Home & Lighting',
      'Active',
      'BESTSELLER',
      'Pure White (3-Color Mode) | Soft Ivory (3-Color Mode)',
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800',
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800,https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800',
      'Touch control cylinder bedside lamp with 3000K/4500K/6000K color modes and up to 380h battery.',
      'Features 3-mode stepless touch control, USB-C recharging, and long battery life. Perfect for bedside tables, study desks, and emergency lighting.'
    ],
    [
      '2 in 1 Oil Dispenser and Oil Sprayer, 470ml Glass Bottle (Spray & Pour)',
      '499',
      '999',
      '50',
      'Kitchen & Dining',
      'Active',
      'HOT',
      'Olive Green Lid (470ml) | Chalk White Lid (470ml) | Sunny Yellow Lid (470ml)',
      'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800',
      'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800,https://images.unsplash.com/photo-1546548970-71785318a17b?w=800',
      'Dual-function 470ml glass oil bottle with fine mist spray and steady pour spout.',
      'Control cooking oil intake with 0.15g per spray. Food-grade borosilicate glass resistant to heat and stains.'
    ]
  ];

  const headerLine = headers.join(',');
  const rowLines = sampleRows.map(row => row.map(escapeCSVCell).join(','));
  return [headerLine, ...rowLines].join('\n');
}

/**
 * Converts the current products list into CSV format.
 */
export function exportProductsToCSV(products: any[]): string {
  const headers = [
    'title',
    'price',
    'original_price',
    'inventory',
    'category',
    'status',
    'badge',
    'variants',
    'image',
    'images',
    'short_description',
    'description'
  ];

  const rows = products.map(p => {
    const variantsStr = Array.isArray(p.variants) ? p.variants.join(' | ') : (p.variants || 'Standard');
    const imagesStr = Array.isArray(p.images) ? p.images.join(', ') : (p.images || p.image || '');

    return [
      p.title || '',
      p.price || 0,
      p.originalPrice || '',
      p.inventory !== undefined ? p.inventory : 0,
      p.category || 'General',
      p.status || 'Active',
      p.badge || '',
      variantsStr,
      p.image || '',
      imagesStr,
      p.shortDescription || '',
      p.description || ''
    ].map(escapeCSVCell).join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Triggers a browser download of text content as a file.
 */
export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
