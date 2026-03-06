import { TSchema } from '@sinclair/typebox'
import { print } from 'graphql'
import { loadFilesSync } from '@graphql-tools/load-files'
import { mergeTypeDefs } from '@graphql-tools/merge'
import { Application } from '../../declarations'

export default function getSchema(app: Application) {
  const jsExtension = app.get('importExtension')

  const typeboxTypes = loadFilesSync(`${__dirname}/../**/*.schema.${jsExtension}`, {
    extractExports: (fileExports: Record<string, unknown>) => {
      const schema = fileExports.graphQLSchema
      if (schema && typeof schema === 'object') {
        const { types = {}, inputs = {} } = schema as { types?: Record<string, TSchema>, inputs?: Record<string, TSchema> }

        return [
          Object.entries(types).map(([key, value]) => {
            return typeboxToSDL(value, key)
          }),
          Object.entries(inputs).map(([key, value]) => {
            return typeboxToSDL(value, key, true)
          }),
        ].flat().join('\n\n')
      }
    },
  })

  const types = loadFilesSync(`${__dirname}/../**/*.schema.graphql`)

  return print(mergeTypeDefs([typeboxTypes, types]))
}

type GeneratedMap = Map<string, string>

export function typeboxToSDL(schema: any, rootName: string, isInput = false): string {
  if (typeof schema !== 'object') {
    throw new Error(`Invalid TypeBox schema ${rootName}: expected an object, got ${typeof schema}`)
  }
  const generated: GeneratedMap = new Map()

  function resolveType(
    schema: any,
    typeName: string,
    isInput = false,
  ): string {
    if (schema.anyOf) {
      const enumName = schema.$id ?? typeName
      if (!generated.has(enumName)) {
        const values = schema.anyOf
          .map((v: { const: string }) => `  ${v.const}`)
          .join('\n')
        generated.set(enumName, `enum ${enumName} {\n${values}\n}`)
      }
      return enumName
    }
    if (schema.$ref) {
      return schema.$ref
    }
    if (schema.enum) {
      const enumName = schema.$id ?? typeName
      if (!generated.has(enumName)) {
        const values = schema.enum
          .map((v: string) => `  ${v}`)
          .join('\n')
        generated.set(enumName, `enum ${enumName} {\n${values}\n}`)
      }
      return enumName
    }

    switch (schema.type) {
      case 'string':
        return 'String'
      case 'number':
        return 'Float'
      case 'integer':
        return 'Int'
      case 'boolean':
        return 'Boolean'
      case 'array':
        return `[${resolveType(schema.items, typeName + 'Item', isInput)}]`
      case 'object':
      {
        const objectName = schema.$id
          ? `${schema.$id}${isInput ? 'Input' : ''}`
          : typeName

        if (!generated.has(objectName)) {
          const required = new Set(schema.required ?? [])
          const kind = isInput ? 'input' : 'type'

          const fields = Object.entries(schema.properties ?? {})
            .map(([key, value]: [string, any]) => {
              const fieldTypeName =
                objectName + '_' + capitalize(key)

              const gqlType = resolveType(
                value,
                fieldTypeName,
                isInput,
              )

              const isRequired = required.has(key)

              return `  ${key}: ${gqlType}${
                isRequired ? '!' : ''
              }`
            })
            .join('\n')

          generated.set(
            objectName,
            `${kind} ${objectName} {\n${fields}\n}`,
          )
        }

        return objectName
      }
      default:
        console.log(schema)
        throw new Error(`Unsupported TypeBox type: ${schema.type}`)
    }
  }

  resolveType(schema, rootName, isInput)

  return Array.from(generated.values()).join('\n\n')
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
