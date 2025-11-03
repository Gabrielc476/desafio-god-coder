'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface MarkdownRendererProps {
  content: string
}

const markdownComponents = {
  // --- Títulos e Parágrafos (Sem mudanças) ---
  h1: ({ ...props }) => (
    <h1
      className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl"
      {...props}
    />
  ),
  h2: ({ ...props }) => (
    <h2
      className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0"
      {...props}
    />
  ),
  h3: ({ ...props }) => (
    <h3
      className="scroll-m-20 text-2xl font-semibold tracking-tight"
      {...props}
    />
  ),
  p: ({ ...props }) => (
    <p className="leading-7 [&:not(:first-child)]:mt-6 break-words" {...props} />
  ),
  ul: ({ ...props }) => (
    <ul className="my-6 ml-6 list-disc [&>li]:mt-2" {...props} />
  ),
  li: ({ ...props }) => <li {...props} />,

  // --- Tabela (Com as mudanças) ---
  table: ({ ...props }) => (
    <div className="my-6 w-full overflow-x-auto">
      {/* 'table-fixed' força as colunas a obedecerem a largura da tabela */}
      <Table className="w-full table-fixed" {...props} />
    </div>
  ),
  thead: ({ ...props }) => <TableHeader {...props} />,
  tbody: ({ ...props }) => <TableBody {...props} />,
  tr: ({ ...props }) => <TableRow {...props} />,

  // --- MUDANÇA EFETIVA (A) ---
  th: ({ ...props }) => (
    <TableHead
      className="
        h-auto                   // 1. Anula a altura fixa (h-12)
        align-top                // 2. Alinha o texto ao topo (melhor estética)
        whitespace-normal        // 3. FORÇA a quebra de linha (anula 'nowrap')
        break-words              // 4. Quebra palavras longas
      "
      {...props}
    />
  ),

  // --- MUDANÇA EFETIVA (B) ---
  td: ({ ...props }) => (
    <TableCell
      className="
        h-auto                   // 1. Garante que a altura é automática
        align-top                // 2. Alinha o texto ao topo
        whitespace-normal        // 3. FORÇA a quebra de linha
        break-words              // 4. Quebra palavras longas
      "
      {...props}
    />
  ),
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Este wrapper 'overflow-hidden' ainda é essencial
  // para o layout do *parágrafo* funcionar.
  return (
    <div className="w-full overflow-hidden">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {content}
      </ReactMarkdown>
    </div>
  )
}