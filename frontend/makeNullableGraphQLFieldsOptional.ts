import {
  DefinitionNode,
  DocumentNode,
  FieldDefinitionNode,
  Kind,
  ObjectTypeDefinitionNode,
  TypeNode,
  visit,
} from 'graphql'
import type { Types } from '@graphql-codegen/plugin-helpers'

const skipFalseDirective = {
  kind: Kind.DIRECTIVE,
  name: {
    kind: Kind.NAME,
    value: 'skip',
  },
  arguments: [
    {
      kind: Kind.ARGUMENT,
      name: {
        kind: Kind.NAME,
        value: 'if',
      },
      value: {
        kind: Kind.BOOLEAN,
        value: false,
      },
    },
  ],
} as const

const assertFound = <T>(value: T | null | undefined): T => {
  if (value == null) throw new Error('Expected value to be found')
  return value
}

export const makeNullableFieldsOptional: Types.DocumentTransformObject = {
  transform: ({ documents, schema }) => {
    const maybeFindType = (name: string) =>
      schema.definitions.find(i => (i.kind === Kind.SCALAR_TYPE_EXTENSION || i.kind === Kind.OBJECT_TYPE_DEFINITION) && i.name?.value === name)
    const findType = (name: string) => assertFound(maybeFindType(name))

    const findField = (node: DefinitionNode, name: string) => {
      if (node.kind !== Kind.OBJECT_TYPE_DEFINITION && node.kind !== Kind.OBJECT_TYPE_EXTENSION) throw new Error('Expected object type definition or extension')
      return assertFound(node.fields?.find(f => f.name.value === name))
    }
    const findFieldType = (node: DefinitionNode, name: string) => {
      if (name === '__typename') {
        return { isNull: false, node: null }
      }
      const field = findField(node, name)
      return findDefinitionType(field)
    }
    const findDefinitionType = (node: FieldDefinitionNode | TypeNode, isNull = true, isList = false) => {
      // console.log('findFieldType', node.kind, isNull, isList)
      if (node.kind === Kind.FIELD_DEFINITION) {
        return findDefinitionType(node.type, isNull, isList)
      }
      if (node.kind === Kind.NON_NULL_TYPE) {
        return findDefinitionType(node.type, isList ? isNull : false, isList)
      }
      if (node.kind === Kind.LIST_TYPE) {
        return findDefinitionType(node.type, isNull, true)
      }
      if (node.kind === Kind.NAMED_TYPE) {
        const nodeType = maybeFindType(node.name.value) ?? null
        return {
          isNull, node: nodeType,
        }
      }
      throw new Error('Expected field definition or type node')
    }

    const schemaDef = assertFound(schema.definitions.find(i => i.kind === Kind.SCHEMA_DEFINITION))
    const queryOpType = assertFound(schemaDef.operationTypes.find(i => i.operation === 'query')).type.name.value
    const mutationOpType = assertFound(schemaDef.operationTypes.find(i => i.operation === 'mutation'))?.type.name.value
    const queryType = findType(queryOpType)
    const mutationType = findType(mutationOpType)

    return documents.map(document => {
      if (!document.document) return document
      const op = document.document.definitions.find(d => d.kind === Kind.OPERATION_DEFINITION)
      const opRoot = assertFound(op?.operation === 'query' ? queryType : op?.operation === 'mutation' ? mutationType : undefined) as ObjectTypeDefinitionNode 
      let nodes: (null | DefinitionNode)[] = [opRoot]

      document.document = visit(document.document, {
        Field: {
          enter(node) {
            const topNode = nodes[nodes.length - 1]
            // console.log('enter '+node.name.value+ ' from '+topNode?.name.value)
            if (!topNode) throw new Error('Expected top node to be defined')
            const { isNull, node: fieldType } = findFieldType(topNode, node.name.value)
            nodes.push(fieldType)
            const isSkipped = node.directives?.some(d => d.name.value === 'skip')
            if (isSkipped || !isNull) return node
            return {
              ...node,
              directives: [
                ...(node.directives ?? []),
                skipFalseDirective,
              ],
            }
          }, leave() {
            nodes.pop()
          }
        },
      }) as DocumentNode
      if (document.document.definitions.length > 1) throw new Error('Expected only one definition per document')
      return document
    })
  },
}
