import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  InitializeParams,
  CompletionItem,
  TextDocumentPositionParams,
  InitializeResult,
  CompletionItemKind,
} from 'vscode-languageserver';
import WebmacroParser from './WebmacroParser';

import { TextDocument } from 'vscode-languageserver-textdocument';

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
let connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager.
let documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

connection.onInitialize((_: InitializeParams): InitializeResult => {
  return {
    capabilities: {
      // textDocumentSync: TextDocumentSyncKind.Incremental,
      // Tell the client that this server supports code completion.
      completionProvider: {
        triggerCharacters: ['$', '#'],
        resolveProvider: true
      }
    }
  }
});

connection.onInitialized(() => {
});

const parsers: Map<string, WebmacroParser> = new Map();

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent(change => {
  validateTextDocument(change.document);
});

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
  const text = textDocument.getText();
  if (!parsers.has(textDocument.uri)) {
    parsers.set(textDocument.uri, new WebmacroParser());
  }
  parsers.get(textDocument.uri).parse(text);
  let diagnostics = parsers.get(textDocument.uri).findDiagnostics(text, textDocument);

  connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

// This handler provides the initial list of the completion items.
connection.onCompletion((params: TextDocumentPositionParams): CompletionItem[] => {
  // The pass parameter contains the position of the text document in
  // which code complete got requested. For the example we ignore this
  // info and always provide the same completion items.
  const parser = parsers.get(params.textDocument.uri);
  return parser.getCompletion();
});

// This handler resolves additional information for the item selected in
// the completion list.
connection.onCompletionResolve((item: CompletionItem): CompletionItem => {
  if (item.kind === CompletionItemKind.Variable) {
    item.detail = 'Variable declared';
  }
  return item;
});

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();
