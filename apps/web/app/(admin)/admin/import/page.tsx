'use client'

import { useState, useCallback } from 'react'
import { useMutation } from '@apollo/client/react'
import { IMPORT_PRODUCTS_MUTATION } from '@/graphql/queries'
import { Upload, FileJson, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

export default function ImportProductsPage() {
  const [jsonInput, setJsonInput] = useState('')
  const [parsed, setParsed] = useState<any[] | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)
  const [result, setResult] = useState<{ imported: number; updated: number; failed: number; errors: string[] } | null>(null)

  const [importProducts, { loading }] = useMutation(IMPORT_PRODUCTS_MUTATION)

  const handleParse = useCallback((text: string) => {
    setJsonInput(text)
    setResult(null)
    if (!text.trim()) {
      setParsed(null)
      setParseError(null)
      return
    }
    try {
      const data = JSON.parse(text)
      if (!Array.isArray(data)) {
        setParseError('JSON must be an array of products')
        setParsed(null)
        return
      }
      setParsed(data)
      setParseError(null)
    } catch {
      setParseError('Invalid JSON format')
      setParsed(null)
    }
  }, [])

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      handleParse(text)
    }
    reader.readAsText(file)
  }, [handleParse])

  const handleImport = async () => {
    if (!jsonInput.trim()) return
    try {
      const { data } = await importProducts({ variables: { json: jsonInput } })
      setResult((data as any).importProducts)
      if ((data as any).importProducts.imported > 0 || (data as any).importProducts.updated > 0) {
        setJsonInput('')
        setParsed(null)
      }
    } catch (err: any) {
      setResult({ imported: 0, updated: 0, failed: 0, errors: [err.message] })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-foreground">Import Products</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Import products from JSON. New products are created in <span className="text-primary font-mono font-semibold">draft</span> status. Existing products (matched by name) are updated.
        </p>
      </div>

      {/* Result banner */}
      {result && (
        <div className={`glass-card rounded-xl p-4 flex items-start gap-3 ${(result.imported > 0 || result.updated > 0) ? 'border-[hsl(var(--neon-green))]/30' : 'border-destructive/30'}`}>
          {(result.imported > 0 || result.updated > 0) ? (
            <CheckCircle2 className="h-5 w-5 text-[hsl(var(--neon-green))] shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          )}
          <div className="space-y-1 text-sm">
            <p className="font-medium text-foreground">
              {result.imported > 0 && <span className="text-[hsl(var(--neon-green))]">{result.imported} created.</span>}
              {result.updated > 0 && <span className="text-primary ml-2">{result.updated} updated.</span>}
              {result.failed > 0 && <span className="text-destructive ml-2">{result.failed} failed.</span>}
              {result.imported === 0 && result.updated === 0 && result.failed === 0 && result.errors.length > 0 && (
                <span className="text-destructive">Import failed.</span>
              )}
            </p>
            {result.errors.length > 0 && (
              <ul className="text-muted-foreground space-y-0.5">
                {result.errors.map((err, i) => (
                  <li key={i} className="font-mono text-xs">• {err}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="glass-card rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground font-heading">JSON Data</h2>
          <label className="flex items-center gap-2 cursor-pointer text-sm text-primary hover:text-primary/80 transition-colors">
            <Upload className="h-4 w-4" />
            Upload File
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        <textarea
          value={jsonInput}
          onChange={(e) => handleParse(e.target.value)}
          placeholder='[{"name": "Product Name", "price": 99.99, ...}]'
          rows={12}
          className="w-full rounded-lg border border-border bg-input p-4 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 resize-y"
        />

        {parseError && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {parseError}
          </div>
        )}
      </div>

      {/* Preview */}
      {parsed && parsed.length > 0 && (
        <div className="glass-card rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-foreground font-heading">
            Preview — {parsed.length} product{parsed.length !== 1 ? 's' : ''}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="pb-2 pr-4">#</th>
                  <th className="pb-2 pr-4">Name</th>
                  <th className="pb-2 pr-4">Category</th>
                  <th className="pb-2 pr-4">Price</th>
                  <th className="pb-2 pr-4">Shop</th>
                  <th className="pb-2 pr-4">Available</th>
                  <th className="pb-2">Specs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {parsed.map((item, i) => (
                  <tr key={i} className="text-muted-foreground">
                    <td className="py-2 pr-4 font-mono text-xs text-muted-foreground/50">{i + 1}</td>
                    <td className="py-2 pr-4 font-medium text-foreground max-w-[200px] truncate">{item.name || '—'}</td>
                    <td className="py-2 pr-4">{item.category_name || '—'}</td>
                    <td className="py-2 pr-4 font-mono text-primary">
                      {item.price != null ? `${item.currency === 'EUR' ? '€' : '$'}${item.price}` : '—'}
                    </td>
                    <td className="py-2 pr-4">{item.shop || '—'}</td>
                    <td className="py-2 pr-4">
                      {item.available === false
                        ? <span className="text-xs text-destructive">No</span>
                        : <span className="text-xs text-[hsl(var(--neon-green))]">Yes</span>
                      }
                    </td>
                    <td className="py-2 font-mono text-xs">
                      {item.specs?.length ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Import button */}
      <div className="flex justify-end">
        <button
          onClick={handleImport}
          disabled={!parsed || parsed.length === 0 || loading}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-[hsl(var(--accent))] px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_0_15px_hsl(var(--neon-cyan)/0.3)] transition-all hover:shadow-[0_0_25px_hsl(var(--neon-cyan)/0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Importing...
            </>
          ) : (
            <>
              <FileJson className="h-4 w-4" />
              Import {parsed ? `${parsed.length} Product${parsed.length !== 1 ? 's' : ''}` : 'Products'}
            </>
          )}
        </button>
      </div>
    </div>
  )
}
