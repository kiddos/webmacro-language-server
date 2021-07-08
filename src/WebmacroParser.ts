import {
  CompletionItem,
  CompletionItemKind,
  Diagnostic,
  DiagnosticSeverity,
} from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';

export default class WebmacroParser {
  variables: Set<string> = new Set();
  directives: Array<string> = [];

  constructor() {
    this.listDirectives();
  }

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

  listDirectives(): void {
    this.directives.push('#alternate');
    this.directives.push('#attribute');
    this.directives.push('#comment');
    this.directives.push('#count');
    this.directives.push('#default');
    this.directives.push('null');
    this.directives.push('#eval');
    this.directives.push('#foreach');
    this.directives.push('#global');
    this.directives.push('#include');
    this.directives.push('#macro');
    this.directives.push('#param');
    this.directives.push('#set');
    this.directives.push('#setblock');
    this.directives.push('#setprops');
    this.directives.push('#templet');
    this.directives.push('#text');
    this.directives.push('#type');
  }

  findDiagnostics(content: string, textDocument: TextDocument): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    let last = -1;
    for (let i = 0; i < content.length; ++i) {
      if (content[i] === '\n' || content[i] === '\r') {
        let j = i-1;
        for (; j >= last+1; --j) {
          if (content[j] !== ' ' && content[j] !== '\t') {
            break;
          }
        }
        if (i - j > 1) {
          const diagnostic: Diagnostic = {
            severity : DiagnosticSeverity.Warning,
            range: {
              start: textDocument.positionAt(j),
              end: textDocument.positionAt(i-1),
            },
            message: `${j} - ${i} has trailing space`,
          }
          diagnostics.push(diagnostic);
        }
        last = i;
      }
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
    for (let d of this.directives) {
      result.push({
        label: d,
        kind: CompletionItemKind.Operator,
      })
    }
    return result;
  }

  getVariables(): Array<string> {
    return Array.from(this.variables);
  }
}
