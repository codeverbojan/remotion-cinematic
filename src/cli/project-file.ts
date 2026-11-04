import ts from 'typescript';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { CinematicSchema } from '../schema';
import type { CinematicProps } from '../schema';

function propsExpression(source: string) {
  const file = ts.createSourceFile('Root.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let expression: ts.Expression | undefined;
  function visit(node: ts.Node) {
    if ((ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) && node.tagName.getText(file) === 'Composition') {
      const attributes = node.attributes.properties;
      const id = attributes.find((a) => ts.isJsxAttribute(a) && a.name.getText(file) === 'id');
      if (id && ts.isJsxAttribute(id) && id.initializer && ts.isStringLiteral(id.initializer) && id.initializer.text === 'CinematicDemo') {
        const props = attributes.find((a) => ts.isJsxAttribute(a) && a.name.getText(file) === 'defaultProps');
        if (props && ts.isJsxAttribute(props) && props.initializer && ts.isJsxExpression(props.initializer)) expression = props.initializer.expression;
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
  if (!expression) throw new Error('CinematicDemo must have inline defaultProps in src/Root.tsx.');
  return {expression, file};
}

export function readProjectSource(source: string): CinematicProps {
  const {expression, file} = propsExpression(source);
  return CinematicSchema.parse(JSON.parse(expression.getText(file)));
}

export function replaceProjectSource(source: string, input: unknown): string {
  const props = CinematicSchema.parse(input);
  const {expression, file} = propsExpression(source);
  return source.slice(0, expression.getStart(file)) + JSON.stringify(props, null, 2) + source.slice(expression.getEnd());
}

export function applyProject(input: unknown, directory = process.cwd()): string {
  const target = resolve(directory, 'src/Root.tsx');
  const original = readFileSync(target, 'utf8');
  const updated = replaceProjectSource(original, input);
  writeFileSync(`${target}.bak`, original);
  writeFileSync(target, updated);
  return target;
}
