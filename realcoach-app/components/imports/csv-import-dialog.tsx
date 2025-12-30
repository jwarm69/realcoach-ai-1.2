'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Upload,
  FileSpreadsheet,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  parseCSVFile,
  detectColumnHeaders,
  validateRowData,
  mapRowToContact,
  type ColumnMapping,
  type ContactInput,
  type ValidationResult,
  type CSVParseResult,
} from '@/lib/integrations/csv-parser';

type ImportStep = 'upload' | 'mapping' | 'review' | 'importing' | 'complete';

interface CSVImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CSVImportDialog({ open, onOpenChange }: CSVImportDialogProps) {
  const router = useRouter();
  const [step, setStep] = useState<ImportStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<CSVParseResult | null>(null);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0, errors: [] as string[] });
  const [isProcessing, setIsProcessing] = useState(false);

  const DB_FIELDS = [
    { value: 'name', label: 'Name *', required: true },
    { value: 'email', label: 'Email', required: false },
    { value: 'phone', label: 'Phone', required: false },
    { value: 'address', label: 'Address', required: false },
    { value: 'pipeline_stage', label: 'Pipeline Stage', required: false },
    { value: 'lead_source', label: 'Lead Source', required: false },
    { value: 'motivation_level', label: 'Motivation Level', required: false },
    { value: 'timeframe', label: 'Timeframe', required: false },
    { value: 'budget_range', label: 'Budget Range', required: false },
    { value: 'preapproval_status', label: 'Pre-approval Status', required: false },
    { value: 'property_location', label: 'Property Location', required: false },
    { value: 'property_price_range', label: 'Property Price Range', required: false },
    { value: 'property_type', label: 'Property Type', required: false },
    { value: 'property_beds', label: 'Bedrooms', required: false },
    { value: 'property_baths', label: 'Bathrooms', required: false },
    { value: 'notes', label: 'Notes', required: false },
    { value: 'ignore', label: 'Ignore this column', required: false },
  ];

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await parseCSVFile(selectedFile);
      setFile(selectedFile);
      setParseResult(result);

      const mapping = detectColumnHeaders(result.headers);
      setColumnMapping(mapping);

      const validations = result.data.map((row, index) =>
        validateRowData(row, index + 2, mapping)
      );
      setValidationResults(validations);

      setStep('mapping');
    } catch (error) {
      console.error('Error parsing CSV:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to parse CSV file');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleMappingChange = (csvColumn: string, value: string) => {
    setColumnMapping((prev) => ({
      ...prev,
      [csvColumn]: value as keyof ContactInput | 'ignore',
    }));
  };

  const handleReview = () => {
    const newValidations = parseResult!.data.map((row, index) =>
      validateRowData(row, index + 2, columnMapping)
    );
    setValidationResults(newValidations);
    setStep('review');
  };

  const handleImport = async () => {
    setStep('importing');
    setIsProcessing(true);

    const validContacts = validationResults
      .filter((v) => v.valid)
      .map((v, index) => mapRowToContact(parseResult!.data[index], columnMapping));

    setImportProgress({ current: 0, total: validContacts.length, errors: [] });

    try {
      const batchSize = 50;
      for (let i = 0; i < validContacts.length; i += batchSize) {
        const batch = validContacts.slice(i, i + batchSize);

        const response = await fetch('/api/contacts/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contacts: batch,
            options: {
              skipDuplicates: true,
              duplicateField: 'email',
            },
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Import failed');
        }

        const result = await response.json();

        setImportProgress((prev) => ({
          current: Math.min(i + batchSize, validContacts.length),
          total: validContacts.length,
          errors: [...prev.errors, ...(result.errors || [])],
        }));
      }

      setStep('complete');
      toast.success('Contacts imported successfully');
      router.refresh();
    } catch (error) {
      console.error('Import error:', error);
      toast.error(error instanceof Error ? error.message : 'Import failed');
      setStep('review');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setStep('upload');
    setFile(null);
    setParseResult(null);
    setColumnMapping({});
    setValidationResults([]);
    setImportProgress({ current: 0, total: 0, errors: [] });
  };

  const validCount = validationResults.filter((v) => v.valid).length;
  const warningCount = validationResults.reduce((sum, v) => sum + v.warnings.length, 0);
  const errorCount = validationResults.reduce((sum, v) => sum + v.errors.length, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {step === 'upload' && 'Import Contacts from CSV'}
            {step === 'mapping' && 'Map CSV Columns'}
            {step === 'review' && 'Review Import'}
            {step === 'importing' && 'Importing Contacts...'}
            {step === 'complete' && 'Import Complete'}
          </DialogTitle>
          <DialogDescription>
            {step === 'upload' && 'Upload a CSV file to import contacts into your pipeline.'}
            {step === 'mapping' && 'Match your CSV columns to the contact fields.'}
            {step === 'review' && `Review ${validCount} contacts ready to import.`}
            {step === 'importing' && 'Please wait while we import your contacts...'}
            {step === 'complete' && 'Your contacts have been successfully imported.'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1">
          {step === 'upload' && (
            <div className="space-y-4 py-4">
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer"
                onClick={() => document.getElementById('csv-file-input')?.click()}
              >
                <input
                  id="csv-file-input"
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                />
                <FileSpreadsheet className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">
                  Drop your CSV file here
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  or click to browse
                </p>
                <Button variant="outline" size="sm" disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Parsing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Select CSV File
                    </>
                  )}
                </Button>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Your CSV should have a header row with column names. The first column should typically be contact names.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {step === 'mapping' && parseResult && (
            <div className="space-y-4 py-4">
              <div className="grid gap-4">
                {parseResult.headers.map((header) => (
                  <div key={header} className="grid grid-cols-2 gap-4 items-center">
                    <div>
                      <Label>CSV Column</Label>
                      <p className="font-medium">{header}</p>
                      <p className="text-xs text-muted-foreground">
                        Example: {parseResult.data[0]?.[header] || '(empty)'}
                      </p>
                    </div>
                    <div>
                      <Label>Map to Field</Label>
                      <Select
                        value={columnMapping[header] || 'ignore'}
                        onValueChange={(value) => handleMappingChange(header, value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DB_FIELDS.map((field) => (
                            <SelectItem key={field.value} value={field.value}>
                              {field.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>

              {parseResult.data.length > 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <h4 className="text-sm font-semibold mb-3">Preview (First 5 rows)</h4>
                    <ScrollArea className="h-40">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            {parseResult.headers.map((h) => (
                              <th key={h} className="p-2 text-left font-medium">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {parseResult.data.slice(0, 5).map((row, i) => (
                            <tr key={i} className="border-b">
                              {parseResult.headers.map((h) => (
                                <td key={h} className="p-2 text-muted-foreground">
                                  {row[h]?.substring(0, 50) || '-'}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {step === 'review' && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-green-600">{validCount}</div>
                    <p className="text-sm text-muted-foreground">Valid Contacts</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-yellow-600">{warningCount}</div>
                    <p className="text-sm text-muted-foreground">Warnings</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-red-600">{errorCount}</div>
                    <p className="text-sm text-muted-foreground">Errors</p>
                  </CardContent>
                </Card>
              </div>

              {(warningCount > 0 || errorCount > 0) && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Some contacts have validation issues. They will be skipped during import.
                  </AlertDescription>
                </Alert>
              )}

              <Card>
                <CardContent className="pt-6">
                  <h4 className="text-sm font-semibold mb-3">Import Options</h4>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      Skip contacts with duplicate email addresses
                    </Label>
                    <p className="text-xs text-muted-foreground ml-6">
                      Existing contacts with the same email will not be updated
                    </p>
                  </div>
                </CardContent>
              </Card>

              {importProgress.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-semibold mb-2">Import Errors:</p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {importProgress.errors.slice(0, 5).map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                      {importProgress.errors.length > 5 && (
                        <li>...and {importProgress.errors.length - 5} more</li>
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {step === 'importing' && (
            <div className="space-y-4 py-4">
              <Progress
                value={(importProgress.current / importProgress.total) * 100}
                className="h-2"
              />
              <p className="text-center text-sm text-muted-foreground">
                Importing {importProgress.current} of {importProgress.total} contacts...
              </p>
            </div>
          )}

          {step === 'complete' && (
            <div className="space-y-4 py-4 text-center">
              <CheckCircle2 className="h-16 w-16 mx-auto text-green-600" />
              <h3 className="text-lg font-semibold">Import Complete!</h3>
              <p className="text-muted-foreground">
                {validCount} contacts have been imported successfully.
              </p>
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => {
              if (step === 'complete') {
                handleReset();
                onOpenChange(false);
              } else if (step === 'upload') {
                onOpenChange(false);
              } else if (step === 'mapping') {
                setStep('upload');
              } else {
                setStep('mapping');
              }
            }}
            disabled={isProcessing}
          >
            {step === 'upload' ? 'Cancel' : step === 'complete' ? 'Done' : <ArrowLeft className="h-4 w-4 mr-2" />}
            {step !== 'upload' && step !== 'complete' && 'Back'}
          </Button>

          {step !== 'complete' && step !== 'importing' && (
            <Button
              onClick={() => {
                if (step === 'mapping') handleReview();
                if (step === 'review') handleImport();
              }}
              disabled={isProcessing || (step === 'review' && validCount === 0)}
            >
              {step === 'mapping' ? (
                <>
                  Review
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              ) : (
                <>
                  Import {validCount} Contacts
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
