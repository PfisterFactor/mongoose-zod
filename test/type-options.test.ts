import {z} from 'zod';
import {
  MongooseZodError,
  addMongooseTypeOptions,
  toMongooseSchema,
  toZodMongooseSchema,
} from '../src/index.js';

describe('Type options', () => {
  it('Allows to set type options with .mongoose()', () => {
    const USERNAME_OPTIONS = {unique: true};
    const REGISTERED_OPTIONS = {index: true, default: false};
    const zodSchema = z
      .object({
        username: z.string(),
        registered: z.boolean(),
      })
      .mongoose({
        typeOptions: {
          username: {...USERNAME_OPTIONS},
          registered: {...REGISTERED_OPTIONS},
        },
      });

    const Schema = toMongooseSchema(zodSchema);

    expect(Schema.paths.username?.options).toMatchObject(USERNAME_OPTIONS);
    expect(Schema.paths.registered?.options).toMatchObject(REGISTERED_OPTIONS);
  });

  it('Allows to set type options with toZodSchema() the same as .mongoose()', () => {
    const USERNAME_OPTIONS = {unique: true};
    const REGISTERED_OPTIONS = {index: true, default: false};
    const zodObject = z.object({
      username: z.string(),
      registered: z.boolean(),
    });

    const zodSchema = toZodMongooseSchema(zodObject, {
      typeOptions: {
        username: {...USERNAME_OPTIONS},
        registered: {...REGISTERED_OPTIONS},
      },
    });
    const Schema = toMongooseSchema(zodSchema);

    expect(Schema.paths.username?.options).toMatchObject(USERNAME_OPTIONS);
    expect(Schema.paths.registered?.options).toMatchObject(REGISTERED_OPTIONS);
  });

  it('Allows to set type options for a specific field with .mongooseTypeOptions()', () => {
    const USERNAME_OPTIONS = {unique: true};
    const REGISTERED_OPTIONS = {index: true, default: false};
    const zodSchema = z
      .object({
        username: z.string().mongooseTypeOptions({...USERNAME_OPTIONS}),
        registered: z.boolean().mongooseTypeOptions({...REGISTERED_OPTIONS}),
      })
      .mongoose();

    const Schema = toMongooseSchema(zodSchema);

    expect(Schema.paths.username?.options).toMatchObject(USERNAME_OPTIONS);
    expect(Schema.paths.registered?.options).toMatchObject(REGISTERED_OPTIONS);
  });

  it('Allows to set type options for a specific field with addMognooseTypOptions the same as .mongooseTypeOptions()', () => {
    const USERNAME_OPTIONS = {unique: true};
    const REGISTERED_OPTIONS = {index: true, default: false};
    const zodSchema = toZodMongooseSchema(
      z.object({
        username: addMongooseTypeOptions(z.string(), {...USERNAME_OPTIONS}),
        registered: addMongooseTypeOptions(z.boolean(), {...REGISTERED_OPTIONS}),
      }),
    );

    const Schema = toMongooseSchema(zodSchema);

    expect(Schema.paths.username?.options).toMatchObject(USERNAME_OPTIONS);
    expect(Schema.paths.registered?.options).toMatchObject(REGISTERED_OPTIONS);
  });

  it('Merges type options set for a specific field with multiple calls of .mongooseTypeOptions()', () => {
    const OPTIONS_1 = {default: true};
    const OPTIONS_2 = {index: true, default: false, alias: 'r'};
    const zodSchema = z
      .object({
        username: z.string(),
        registered: z
          .boolean()
          .mongooseTypeOptions({...OPTIONS_1})
          .mongooseTypeOptions({...OPTIONS_2}),
      })
      .mongoose();

    const Schema = toMongooseSchema(zodSchema);

    expect(Schema.paths.registered?.options).toMatchObject({...OPTIONS_1, ...OPTIONS_2});
  });

  it('Merges type options set in .mongooseTypeOptions() with the ones set in .mongoose()', () => {
    const USERNAME_OPTIONS_1 = {unique: true};
    const USERNAME_OPTIONS_2 = {index: true, alias: 'u'};
    const USERNAME_OPTIONS_3 = {unique: false};
    const REGISTERED_OPTIONS_1 = {index: true, default: false};
    const REGISTERED_OPTIONS_2 = {default: undefined};
    const zodSchema = z
      .object({
        username: z
          .string()
          .mongooseTypeOptions({...USERNAME_OPTIONS_1})
          .mongooseTypeOptions({...USERNAME_OPTIONS_2}),
        registered: z.boolean().mongooseTypeOptions({...REGISTERED_OPTIONS_1}),
      })
      .mongoose({
        typeOptions: {
          username: {...USERNAME_OPTIONS_3},
          registered: {...REGISTERED_OPTIONS_2},
        },
      });

    const Schema = toMongooseSchema(zodSchema);

    expect(Schema.paths.username?.options).toMatchObject({
      ...USERNAME_OPTIONS_1,
      ...USERNAME_OPTIONS_2,
      ...USERNAME_OPTIONS_3,
    });
    expect(Schema.paths.registered?.options).toMatchObject({
      ...REGISTERED_OPTIONS_1,
      ...REGISTERED_OPTIONS_2,
    });
  });

  it('Allows to set type options in a sub schema with .mongoose()', () => {
    const USERNAME_OPTIONS = {unique: true};
    const REGISTERED_OPTIONS = {index: true, default: false};
    const zodSchema = z
      .object({
        info: z
          .object({
            username: z.string(),
            registered: z.boolean(),
          })
          .mongoose({
            typeOptions: {
              username: {...USERNAME_OPTIONS},
              registered: {...REGISTERED_OPTIONS},
            },
          }),
      })
      .mongoose();

    const Schema = toMongooseSchema(zodSchema);

    expect(Schema.paths.info?.schema.paths.username?.options).toMatchObject(USERNAME_OPTIONS);
    expect(Schema.paths.info?.schema.paths.registered?.options).toMatchObject(REGISTERED_OPTIONS);
  });

  it('Allows to set type options for a specific field in a sub schema with .mongooseTypeOptions()', () => {
    const USERNAME_OPTIONS = {unique: true};
    const REGISTERED_OPTIONS = {index: true, default: false};
    const zodSchema = z
      .object({
        info: z.object({
          username: z.string().mongooseTypeOptions({...USERNAME_OPTIONS}),
          registered: z.boolean().mongooseTypeOptions({...REGISTERED_OPTIONS}),
        }),
      })
      .mongoose();

    const Schema = toMongooseSchema(zodSchema);

    expect(Schema.paths.info?.schema.paths.username?.options).toMatchObject(USERNAME_OPTIONS);
    expect(Schema.paths.info?.schema.paths.registered?.options).toMatchObject(REGISTERED_OPTIONS);
  });

  it('Merges type options set in .mongooseTypeOptions() with the ones set in .mongoose() in a sub schema', () => {
    const USERNAME_OPTIONS_1 = {unique: true};
    const USERNAME_OPTIONS_2 = {unique: false, index: true, alias: 'u'};
    const REGISTERED_OPTIONS_1 = {index: true, default: false};
    const REGISTERED_OPTIONS_2 = {default: undefined};
    const zodSchema = z
      .object({
        info: z
          .object({
            username: z.string().mongooseTypeOptions({...USERNAME_OPTIONS_1}),
            registered: z.boolean().mongooseTypeOptions({...REGISTERED_OPTIONS_1}),
          })
          .mongoose({
            typeOptions: {
              username: {...USERNAME_OPTIONS_2},
              registered: {...REGISTERED_OPTIONS_2},
            },
          }),
      })
      .mongoose();

    const Schema = toMongooseSchema(zodSchema);

    expect(Schema.paths.info?.schema.paths.username?.options).toMatchObject({
      ...USERNAME_OPTIONS_1,
      ...USERNAME_OPTIONS_2,
    });
    expect(Schema.paths.info?.schema.paths.registered?.options).toMatchObject({
      ...REGISTERED_OPTIONS_1,
      ...REGISTERED_OPTIONS_2,
    });
  });

  it('Merges type options set in .mongooseTypeOptions() with the ones set in .mongoose() in a sub schema WITH WRAPPER FN', () => {
    const USERNAME_OPTIONS_1 = {unique: true};
    const USERNAME_OPTIONS_2 = {unique: false, index: true, alias: 'u'};
    const REGISTERED_OPTIONS_1 = {index: true, default: false};
    const REGISTERED_OPTIONS_2 = {default: undefined};
    const zodSchema = toZodMongooseSchema(
      z.object({
        info: toZodMongooseSchema(
          z.object({
            username: addMongooseTypeOptions(z.string(), {...USERNAME_OPTIONS_1}),
            registered: addMongooseTypeOptions(z.boolean(), {...REGISTERED_OPTIONS_1}),
          }),
          {
            typeOptions: {
              username: {...USERNAME_OPTIONS_2},
              registered: {...REGISTERED_OPTIONS_2},
            },
          },
        ),
      }),
    );

    const Schema = toMongooseSchema(zodSchema);

    expect(Schema.paths.info?.schema.paths.username?.options).toMatchObject({
      ...USERNAME_OPTIONS_1,
      ...USERNAME_OPTIONS_2,
    });
    expect(Schema.paths.info?.schema.paths.registered?.options).toMatchObject({
      ...REGISTERED_OPTIONS_1,
      ...REGISTERED_OPTIONS_2,
    });
  });

  it('Makes field optional if and only if .optional() or .nullish() is used', () => {
    const zodSchema = z
      .object({
        username: z.string(),
        registered: z.boolean().optional(),
        regDate: z.date().nullish(),
        friends: z.array(z.string()).optional().nullish().nullable(),
        avatar: z.string().nullable(),
      })
      .mongoose();

    const Schema = toMongooseSchema(zodSchema);

    expect(
      Object.fromEntries(Object.entries(Schema.paths).map(([k, v]) => {
        const {required} = v.options;
        return [k, typeof required === 'function' ? false : required]
      })),
    ).toEqual({username: true, registered: false, regDate: false, friends: false, avatar: false});
  });

  it('Respects the field default value set via the top-most call of .default()', () => {
    const STATUS = 'Not set';
    const zodSchema = z
      .object({
        username: z.string(),
        registered: z.boolean().default(false),
        status: z.string().default('ignored').default('ignored again').default(STATUS),
      })
      .mongoose();

    const Schema = toMongooseSchema(zodSchema);

    expect((Schema.paths.registered as any).defaultValue).toBe(false);
    expect((Schema.paths.status as any).defaultValue).toBe(STATUS);
  });

  it('Respects the default value set via type options', () => {
    const STATUS = 'Not set';
    const zodSchema = z
      .object({
        username: z.string(),
        registered: z.boolean().mongooseTypeOptions({default: false}),
        status: z.string().mongooseTypeOptions({default: STATUS}),
      })
      .mongoose();

    const Schema = toMongooseSchema(zodSchema);

    expect((Schema.paths.registered as any).defaultValue).toBe(false);
    expect((Schema.paths.status as any).defaultValue).toBe(STATUS);
  });

  it('Sets the default value for arrays to `undefined` unless another value is provided', () => {
    const BIRTHDAY_NOT_SET = [1, 1, 1900];
    const zodSchema = z
      .object({
        username: z.string(),
        friends: z.array(z.string()),
        birthday: z.array(z.number().int()).min(3).max(3).default(BIRTHDAY_NOT_SET),
      })
      .mongoose();

    const Schema = toMongooseSchema(zodSchema);

    expect((Schema.paths.friends as any).defaultValue).toBe(undefined);
    expect((Schema.paths.birthday as any).defaultValue()).toEqual(BIRTHDAY_NOT_SET);
  });

  it('Sets the default value for sub schemas to `undefined` unless another value is provided', () => {
    const BIRTHDAY_NOT_SET = {d: 1, m: 1, y: 1900};
    const zodSchema = z
      .object({
        username: z.string(),
        fullName: z.object({firstName: z.string(), lastName: z.string()}),
        birthday: z
          .object({
            d: z.number().int().min(1).max(31),
            m: z.number().int().min(1).max(12),
            y: z.number().int().min(1900).max(2010),
          })
          .default(BIRTHDAY_NOT_SET),
      })
      .mongoose();

    const Schema = toMongooseSchema(zodSchema);

    expect((Schema.paths.fullName as any).defaultValue).toBe(undefined);
    expect((Schema.paths.birthday as any).defaultValue).toEqual(BIRTHDAY_NOT_SET);
  });

  it('Overwrites the default value set via .default() by the value set via type options', () => {
    const STATUS = 'Not set';
    const zodSchema = z
      .object({
        username: z.string(),
        registered: z.boolean().default(true).mongooseTypeOptions({default: false}),
        status: z.string().default('nonsense').mongooseTypeOptions({default: STATUS}),
      })
      .mongoose();

    const Schema = toMongooseSchema(zodSchema);

    expect((Schema.paths.registered as any).defaultValue).toBe(false);
    expect((Schema.paths.status as any).defaultValue).toBe(STATUS);
  });

  it('Throws if field is .optional() but required is set to true', () => {
    const zodSchema = z
      .object({
        username: z.string().optional().mongooseTypeOptions({required: true}),
      })
      .mongoose();

    expect(() => toMongooseSchema(zodSchema)).toThrow(MongooseZodError);
  });

  it('Throws if field is .nullish() but required is set to true', () => {
    const zodSchema = z
      .object({
        username: z.string().nullish().mongooseTypeOptions({required: true}),
      })
      .mongoose();

    expect(() => toMongooseSchema(zodSchema)).toThrow(MongooseZodError);
  });

  it('Does not throw if field is .nullable() but required is set to true', () => {
    const zodSchema = z
      .object({
        username: z.string().nullable().mongooseTypeOptions({required: true}),
      })
      .mongoose();

    expect(() => toMongooseSchema(zodSchema)).not.toThrow(MongooseZodError);
  });

  it('Does not throw if field is .literal(null) but required is set to true', () => {
    const zodSchema = z
      .object({
        username: z.literal(null).mongooseTypeOptions({required: true}),
      })
      .mongoose();

    expect(() => toMongooseSchema(zodSchema)).not.toThrow(MongooseZodError);
  });

  it('Throws if field is not .optional() nor .nullish() but required is set to false', () => {
    const zodSchema = z
      .object({
        username: z.string().mongooseTypeOptions({required: false}),
      })
      .mongoose();

    expect(() => toMongooseSchema(zodSchema)).toThrow(MongooseZodError);
  });

  it('Throws if field is not .optional() nor .nullish() but required is set to function', () => {
    const zodSchema = z
      .object({
        username: z.string().mongooseTypeOptions({required: jest.fn()}),
      })
      .mongoose();

    expect(() => toMongooseSchema(zodSchema)).toThrow(MongooseZodError);
  });
});
