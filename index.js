#!/usr/bin/env node

const {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  CompletionItemKind,
} =  require('vscode-languageserver');
const { TextDocument } = require('vscode-languageserver-textdocument');
const { Index } = require('./build/Release/webmacro_index.node');


// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
let connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager.
let documents = new TextDocuments(TextDocument);

connection.onInitialize(() => {
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

const index = new Index();

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent(change => {
  validateTextDocument(change.document);
});

async function validateTextDocument(textDocument) {
  const text = textDocument.getText();
  index.readVariables(textDocument.uri, text);
}

const DIRECTIVES = [
  'alternate',
  'attribute',
  'comment',
  'count',
  'default',
  'eval',
  'foreach',
  'global',
  'include',
  'macro',
  'param',
  'set',
  'setblock',
  'setprops',
  'templet',
  'text',
  'type',
];

// This handler provides the initial list of the completion items.
connection.onCompletion((params) => {
  // The pass parameter contains the position of the text document in
  // which code complete got requested. For the example we ignore this
  // info and always provide the same completion items.
  const vars  = index.getVariables(params.textDocument.uri) || [];

  console.log(vars);

  let result = [];
  for (let v of vars) {
    result.push({
      label: v,
      kind: CompletionItemKind.Variable,
    });
  }
  for (let d of DIRECTIVES) {
    result.push({
      label: d,
      kind: CompletionItemKind.Operator,
    })
  }
  return result;
});

// This handler resolves additional information for the item selected in
// the completion list.
connection.onCompletionResolve((item) => {
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
