// For more information about this file see https://dove.feathersjs.com/guides/cli/validators.html
import { Ajv, addFormats } from '@feathersjs/schema'
import { TypeSystem } from '@sinclair/typebox/system'
import { Date, DateTime } from './utils/common-types'
import type { FormatsPluginOptions } from '@feathersjs/schema'

const formats: FormatsPluginOptions = [
  'date-time',
  'iso-date-time',
  'time',
  'date',
  'email',
  'hostname',
  'ipv4',
  'ipv6',
  'uri',
  'uri-reference',
  'uuid',
  'uri-template',
  'json-pointer',
  'relative-json-pointer',
  'regex'
]

export const dataValidator: Ajv = addFormats(new Ajv({}), formats)

export const queryValidator: Ajv = addFormats(
  new Ajv({
    coerceTypes: true
  }),
  formats
)
TypeSystem.CreateFormat('date', dataValidator.compile(Date()))
TypeSystem.CreateFormat('iso-date-time', dataValidator.compile(DateTime()))
