import {
  CompletionItem,
  CompletionItemKind,
  Diagnostic,
  DiagnosticSeverity,
} from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';

export default class WebmacroParser {
  variables: Set<string> = new Set();

  parse(content: string): void {
    this.parseVariables(content);
  }

  parseVariables(content: string): void {
    this.variables.clear()
    const pattern = /\$[\w_]*/g;
    let m: RegExpExecArray = null;
    while ((m = pattern.exec(content))) {
      this.variables.add(m[0]);
    }
  }

  findDiagnostics(content: string, textDocument: TextDocument): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    let index = 0;
    for (let line of content.replace('\r\n', '\n').split('\n')) {
      if (line.endsWith(';')) {
        const diagnostic: Diagnostic = {
          severity : DiagnosticSeverity.Warning,
          range: {
            start: textDocument.positionAt(index + line.length-1),
            end: textDocument.positionAt(index + line.length),
          },
          message: `line ends with ";"`,
        }
        diagnostics.push(diagnostic);
      }
      index += line.length;
    }
    return diagnostics;
  }

  getCompletion(): Array<CompletionItem> {
    let result: Array<CompletionItem> = [];
    for (let v of this.getVariables()) {
      result.push({
        label: v,
        kind: CompletionItemKind.Variable,
      });
    }
    return result;
  }

  getVariables(): Array<string> {
    return Array.from(this.variables);
  }
}
