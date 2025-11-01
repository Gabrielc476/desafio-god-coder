/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // Informa ao Jest onde encontrar os módulos (baseado no tsconfig.json)
  moduleNameMapper: {
    '^@/domain/(.*)$': '<rootDir>/src/domain/$1',
    '^@/application/(.*)$': '<rootDir>/src/application/$1',
    '^@/infra/(.*)$': '<rootDir>/src/infra/$1',
    '^@/main/(.*)$': '<rootDir>/src/main/$1',
  },
  // Limpa os mocks entre os testes
  clearMocks: true,

  // REMOVIDA a propriedade "testMatch".
  // O Jest agora usará sua regex padrão, que automaticamente
  // encontrará todos os arquivos .spec.ts dentro de pastas __tests__.
};

