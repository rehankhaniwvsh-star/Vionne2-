import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  X, 
  FileSpreadsheet, 
  ArrowRight,
  Info,
  Layers,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  validateAndTransformCSV, 
  generateSampleCSV, 
  downloadCSV, 
  CSVParseResult,
  ParsedProductItem 
} from '@/utils/csvParser';
import { adminService } from '@/services/adminService';
import { toast } from 'sonner';

interface CsvProductUploaderProps {
  onImportComplete?: () => void;
  triggerButton?: React.ReactNode;
}

export const CsvProductUploader: React.FC<CsvProductUploaderProps> = ({ 
  onImportComplete,
  triggerButton
}) => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [parseResult, setParseResult] = useState<CSVParseResult | null>(null);
  const [previewFilter, setPreviewFilter] = useState<'all' | 'valid' | 'errors'>('all');
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [defaultStatus, setDefaultStatus] = useState<'Active' | 'Draft'>('Active');
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith('.csv') && selectedFile.type !== 'text/csv') {
      toast.error('Please upload a valid .csv file');
      return;
    }

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        try {
          const result = validateAndTransformCSV(text);
          setParseResult(result);
          if (result.totalRows === 0) {
            toast.warning('The uploaded CSV appears to be empty or contains only headers.');
          } else {
            toast.success(`Found ${result.totalRows} row${result.totalRows === 1 ? '' : 's'} (${result.validCount} valid)`);
          }
        } catch (err: any) {
          toast.error(`Error parsing CSV: ${err.message || 'Check file format'}`);
          setParseResult(null);
        }
      }
    };
    reader.onerror = () => {
      toast.error('Failed to read file');
    };
    reader.readAsText(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDownloadTemplate = () => {
    const sample = generateSampleCSV();
    downloadCSV(sample, 'products_bulk_import_template.csv');
    toast.success('Sample CSV template downloaded');
  };

  const resetState = () => {
    setFile(null);
    setParseResult(null);
    setImporting(false);
    setImportProgress(0);
    setPreviewFilter('all');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImport = async () => {
    if (!parseResult || parseResult.validCount === 0) {
      toast.error('No valid products to import');
      return;
    }

    setImporting(true);
    setImportProgress(25);

    try {
      const validProducts = parseResult.items
        .filter(item => item.isValid)
        .map(item => item.product);

      setImportProgress(50);

      const result = await adminService.bulkAddProducts(validProducts, {
        skipDuplicates,
        defaultStatus
      });

      setImportProgress(100);

      let msg = `Successfully imported ${result.added} product${result.added === 1 ? '' : 's'}!`;
      if (result.skipped > 0) {
        msg += ` (${result.skipped} duplicate${result.skipped === 1 ? '' : 's'} skipped)`;
      }

      toast.success(msg, {
        duration: 4000
      });

      if (onImportComplete) {
        onImportComplete();
      }

      // Close modal after brief feedback
      setTimeout(() => {
        setOpen(false);
        resetState();
      }, 750);
    } catch (error: any) {
      console.error('Import failed:', error);
      toast.error(`Import failed: ${error.message || 'Please try again'}`);
    } finally {
      setImporting(false);
    }
  };

  const filteredItems = React.useMemo(() => {
    if (!parseResult) return [];
    if (previewFilter === 'valid') return parseResult.items.filter(i => i.isValid);
    if (previewFilter === 'errors') return parseResult.items.filter(i => !i.isValid);
    return parseResult.items;
  }, [parseResult, previewFilter]);

  return (
    <Dialog open={open} onOpenChange={(v) => {
      setOpen(v);
      if (!v && !importing) resetState();
    }}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button 
            variant="outline" 
            className="rounded-xl border-border/50 h-10 font-bold text-xs uppercase tracking-widest gap-2 bg-card/60 hover:bg-muted/80 shadow-sm"
          >
            <UploadCloud className="h-4 w-4 text-primary" />
            Import CSV
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-card/95 backdrop-blur-2xl border-border/60 p-6 md:p-8">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl md:text-2xl font-black tracking-tight">
                  Bulk Import Products
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground font-medium mt-0.5">
                  Upload a CSV file to add multiple products, variants, images, and inventory in seconds.
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Quick Helper Banner */}
          <div className="p-4 rounded-2xl bg-muted/40 border border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div className="text-muted-foreground leading-relaxed">
                <span>Supported headers include: </span>
                <span className="font-semibold text-foreground">title</span>,{' '}
                <span className="font-semibold text-foreground">price</span>,{' '}
                <span className="font-semibold text-foreground">inventory</span>,{' '}
                <span className="font-semibold text-foreground">category</span>,{' '}
                <span className="font-semibold text-foreground">image</span>,{' '}
                <span className="font-semibold text-foreground">variants</span>.
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownloadTemplate}
              className="rounded-xl border-border/60 text-xs font-bold shrink-0 hover:bg-background gap-1.5 h-8"
            >
              <Download className="h-3.5 w-3.5 text-primary" />
              Download Template (.csv)
            </Button>
          </div>

          {/* Upload Dropzone */}
          {!file ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 md:p-12 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3 ${
                dragActive 
                  ? 'border-primary bg-primary/5 scale-[0.99]' 
                  : 'border-border/60 hover:border-primary/50 hover:bg-muted/30 bg-muted/10'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv,application/vnd.ms-excel"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="h-16 w-16 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
                <UploadCloud className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-base font-bold tracking-tight">
                  Choose CSV file or drag & drop here
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Supports comma-separated or semicolon-separated .csv up to 10MB
                </p>
              </div>
              <Button 
                type="button" 
                variant="secondary" 
                size="sm" 
                className="rounded-xl font-bold text-xs uppercase tracking-wider mt-2 pointer-events-none"
              >
                Select File
              </Button>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Selected File Card */}
              <div className="p-4 rounded-2xl bg-card border border-border/60 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="truncate">
                    <div className="font-bold text-sm truncate">{file.name}</div>
                    <div className="text-[11px] text-muted-foreground font-medium">
                      {(file.size / 1024).toFixed(1)} KB • Delimiter: &quot;{parseResult?.detectedDelimiter}&quot;
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={resetState}
                    disabled={importing}
                    className="rounded-xl text-xs font-bold text-muted-foreground hover:text-destructive h-8 px-2.5"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Change
                  </Button>
                </div>
              </div>

              {/* Parsing Overview Metrics */}
              {parseResult && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-muted/20 border border-border/40 flex flex-col justify-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Rows</span>
                    <span className="text-xl font-black mt-0.5">{parseResult.totalRows}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col justify-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Valid Products
                    </span>
                    <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {parseResult.validCount}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col justify-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> Issues / Incomplete
                    </span>
                    <span className="text-xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
                      {parseResult.errorCount}
                    </span>
                  </div>
                </div>
              )}

              {/* Import Configuration Controls */}
              <div className="p-4 rounded-2xl bg-muted/20 border border-border/50 grid sm:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="skip-dup"
                    checked={skipDuplicates}
                    onCheckedChange={(checked) => setSkipDuplicates(!!checked)}
                    className="mt-1"
                  />
                  <div className="space-y-0.5 leading-none">
                    <Label htmlFor="skip-dup" className="text-xs font-bold cursor-pointer">
                      Skip duplicates automatically
                    </Label>
                    <p className="text-[11px] text-muted-foreground">
                      Prevents creating duplicate products if title already exists.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 text-xs">
                  <span className="font-bold text-muted-foreground">Status if unspecified:</span>
                  <div className="flex rounded-xl p-0.5 bg-muted border border-border/60">
                    <button
                      type="button"
                      onClick={() => setDefaultStatus('Active')}
                      className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                        defaultStatus === 'Active' 
                          ? 'bg-background shadow-xs text-foreground' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Active
                    </button>
                    <button
                      type="button"
                      onClick={() => setDefaultStatus('Draft')}
                      className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                        defaultStatus === 'Draft' 
                          ? 'bg-background shadow-xs text-foreground' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Draft
                    </button>
                  </div>
                </div>
              </div>

              {/* Data Preview Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Preview</span>
                    <Badge variant="outline" className="text-[10px] rounded-lg">
                      {filteredItems.length} of {parseResult?.totalRows || 0}
                    </Badge>
                  </div>

                  {/* Filter tabs */}
                  <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/40 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setPreviewFilter('all')}
                      className={`px-2.5 py-0.5 rounded-lg font-bold transition-all ${
                        previewFilter === 'all' ? 'bg-background shadow-xs text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      All ({parseResult?.totalRows || 0})
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewFilter('valid')}
                      className={`px-2.5 py-0.5 rounded-lg font-bold transition-all ${
                        previewFilter === 'valid' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'
                      }`}
                    >
                      Valid ({parseResult?.validCount || 0})
                    </button>
                    {parseResult && parseResult.errorCount > 0 && (
                      <button
                        type="button"
                        onClick={() => setPreviewFilter('errors')}
                        className={`px-2.5 py-0.5 rounded-lg font-bold transition-all ${
                          previewFilter === 'errors' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'text-muted-foreground'
                        }`}
                      >
                        Issues ({parseResult.errorCount})
                      </button>
                    )}
                  </div>
                </div>

                <div className="border border-border/60 rounded-2xl overflow-hidden max-h-64 overflow-y-auto bg-card/40">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-muted/50 border-b border-border/50 sticky top-0 backdrop-blur-md">
                      <tr>
                        <th className="py-2.5 px-3 font-bold text-[10px] uppercase tracking-wider text-muted-foreground w-12">#</th>
                        <th className="py-2.5 px-3 font-bold text-[10px] uppercase tracking-wider text-muted-foreground w-14">Image</th>
                        <th className="py-2.5 px-3 font-bold text-[10px] uppercase tracking-wider text-muted-foreground">Product Title</th>
                        <th className="py-2.5 px-3 font-bold text-[10px] uppercase tracking-wider text-muted-foreground">Category</th>
                        <th className="py-2.5 px-3 font-bold text-[10px] uppercase tracking-wider text-muted-foreground">Price</th>
                        <th className="py-2.5 px-3 font-bold text-[10px] uppercase tracking-wider text-muted-foreground">Stock</th>
                        <th className="py-2.5 px-3 font-bold text-[10px] uppercase tracking-wider text-muted-foreground">Variants</th>
                        <th className="py-2.5 px-3 font-bold text-[10px] uppercase tracking-wider text-muted-foreground text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {filteredItems.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-muted-foreground font-medium">
                            No rows in this view.
                          </td>
                        </tr>
                      ) : (
                        filteredItems.map((item) => (
                          <tr 
                            key={item.rowNumber} 
                            className={`hover:bg-muted/20 transition-colors ${!item.isValid ? 'bg-amber-500/5' : ''}`}
                          >
                            <td className="py-2.5 px-3 text-muted-foreground font-medium">
                              {item.rowNumber}
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="h-9 w-9 rounded-lg overflow-hidden border border-border/50 bg-muted shrink-0">
                                <img 
                                  src={item.product.image} 
                                  alt="" 
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800';
                                  }}
                                />
                              </div>
                            </td>
                            <td className="py-2.5 px-3 max-w-xs">
                              <div className="font-bold truncate" title={item.product.title}>
                                {item.product.title || <span className="text-destructive italic">Missing Title</span>}
                              </div>
                              {item.errors.length > 0 ? (
                                <div className="text-[10px] text-destructive font-medium mt-0.5 flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  {item.errors.join(', ')}
                                </div>
                              ) : item.warnings.length > 0 ? (
                                <div className="text-[10px] text-amber-500 font-medium mt-0.5">
                                  {item.warnings.join(', ')}
                                </div>
                              ) : null}
                            </td>
                            <td className="py-2.5 px-3">
                              <Badge variant="secondary" className="text-[10px] font-semibold rounded-md py-0 px-2">
                                {item.product.category}
                              </Badge>
                            </td>
                            <td className="py-2.5 px-3 font-black">
                              ₹{item.product.price.toLocaleString('en-IN')}
                            </td>
                            <td className="py-2.5 px-3 font-semibold">
                              {item.product.inventory}
                            </td>
                            <td className="py-2.5 px-3 max-w-[120px] truncate text-muted-foreground">
                              {item.product.variants.join(', ')}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              {item.isValid ? (
                                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] py-0 px-2 rounded-md">
                                  Valid
                                </Badge>
                              ) : (
                                <Badge variant="destructive" className="text-[10px] py-0 px-2 rounded-md">
                                  Invalid
                                </Badge>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Progress bar during import */}
              {importing && (
                <div className="space-y-2 p-4 rounded-2xl bg-primary/5 border border-primary/20">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-2 text-primary">
                      <Sparkles className="h-4 w-4 animate-spin" />
                      Importing {parseResult?.validCount} products to Firestore...
                    </span>
                    <span>{importProgress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300 rounded-full"
                      style={{ width: `${importProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border/50 pt-4">
          <div className="text-[11px] text-muted-foreground">
            {parseResult ? (
              <span>
                Ready to add <strong className="text-foreground">{parseResult.validCount}</strong> products to your inventory.
              </span>
            ) : (
              <span>Need a starting point? Download our pre-formatted template.</span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setOpen(false);
                resetState();
              }}
              disabled={importing}
              className="rounded-xl font-bold uppercase tracking-wider text-xs"
            >
              Cancel
            </Button>

            {file && parseResult && (
              <Button
                type="button"
                onClick={handleImport}
                disabled={importing || parseResult.validCount === 0}
                className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-wider text-xs px-6 shadow-lg shadow-primary/20 h-10 gap-2"
              >
                {importing ? (
                  <>Importing...</>
                ) : (
                  <>
                    <UploadCloud className="h-4 w-4" />
                    Import {parseResult.validCount} Products
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
