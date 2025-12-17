import {
  ClassProvider,
  ExistingProvider,
  FactoryProvider,
  ModuleMetadata,
  Type,
  ValueProvider,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MockMetadata, ModuleMocker } from 'jest-mock';

const moduleMocker = new ModuleMocker(global);

export const createTestingModule = async (options: {
  imports?: ModuleMetadata['imports'];
  providers?: ModuleMetadata['providers'];
  controllers?: ModuleMetadata['controllers'];
  overriddenProviders?: ModuleMetadata['providers'];
  entities?: Type<any>[];
}) => {
  let builder = Test.createTestingModule({
    imports: [
      TypeOrmModule.forRoot({
        type: 'sqlite',
        database: ':memory:',
        entities: options.entities || [],
        synchronize: true,
      }),
      TypeOrmModule.forFeature(options.entities || []),
    ],
    controllers: options.controllers,
    providers: options.providers,
  }).useMocker((token) => {
    if (typeof token === 'function') {
      /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call */
      const mockedMetadata = moduleMocker.getMetadata(token) as MockMetadata<
        any,
        any
      >;
      const Mock = moduleMocker.generateFromMetadata(mockedMetadata);

      return new Mock();
    }

    return null;
  });

  options.overriddenProviders?.forEach((provider) => {
    const classProvider = provider as ClassProvider;
    const valueProvider = provider as ValueProvider;
    const factoryProvider = provider as FactoryProvider;
    const existingProvider = provider as ExistingProvider;

    if (classProvider.useClass !== undefined) {
      builder = builder
        .overrideProvider(classProvider.provide)
        .useClass(classProvider.useClass);
    } else if (valueProvider.useValue !== undefined) {
      builder = builder
        .overrideProvider(valueProvider.provide)
        .useValue(valueProvider.useValue);
    } else if (factoryProvider.useFactory !== undefined) {
      builder = builder
        .overrideProvider(factoryProvider.provide)
        .useValue(factoryProvider.useFactory);
    } else if (existingProvider.useExisting !== undefined) {
      builder = builder
        .overrideProvider(existingProvider.provide)
        .useValue(existingProvider.useExisting);
    }
  });

  const module: TestingModule = await builder.compile();

  return module;
};

export const mockedAppConfig = {
  port: 3000,
  clientOrigin: 'http://client.origin',
  security: { saltRounds: 10 },
};

export const mockedJwtConfig = {
  accessSecret: 'access_secret',
  accessExpiresIn: '1h',
  accessIssuer: 'access_issuer',
  refreshSecret: 'refresh_secret',
  refreshExpiresIn: '7d',
  refreshIssuer: 'refresh_issuer',
};
