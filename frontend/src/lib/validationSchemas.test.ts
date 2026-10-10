import { describe, it, expect } from 'vitest';
import { loginSchema, signupSchema, providerSchema, clientSchema } from './validationSchemas';

const validSignup = {
  name: 'Juan',
  lastName: 'Pérez',
  userName: 'jperez',
  email: 'juan@test.com',
  password: 'Secreta123!',
  confirmPassword: 'Secreta123!',
};

describe('loginSchema', () => {
  it('acepta credenciales válidas', () => {
    expect(loginSchema.safeParse({ userName: 'jperez', password: 'clave123' }).success).toBe(true);
  });

  it('rechaza usuario vacío', () => {
    const result = loginSchema.safeParse({ userName: '', password: 'clave123' });
    expect(result.success).toBe(false);
  });

  it('rechaza usuario con menos de 3 caracteres', () => {
    const result = loginSchema.safeParse({ userName: 'jp', password: 'clave123' });
    expect(result.success).toBe(false);
  });

  it('rechaza contraseña corta', () => {
    const result = loginSchema.safeParse({ userName: 'jperez', password: '12345' });
    expect(result.success).toBe(false);
  });
});

describe('signupSchema', () => {
  it('acepta registro válido', () => {
    expect(signupSchema.safeParse(validSignup).success).toBe(true);
  });

  it('rechaza contraseñas que no coinciden', () => {
    const result = signupSchema.safeParse({
      ...validSignup,
      confirmPassword: 'Otra123!',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('confirmPassword'))).toBe(true);
    }
  });

  it('rechaza email inválido', () => {
    const result = signupSchema.safeParse({ ...validSignup, email: 'no-es-email' });
    expect(result.success).toBe(false);
  });

  it('rechaza nombre corto', () => {
    const result = signupSchema.safeParse({ ...validSignup, name: 'J' });
    expect(result.success).toBe(false);
  });
});

describe('providerSchema', () => {
  const validProvider = {
    name: 'Proveedor Uno',
    acronym: 'PU',
    email: 'contacto@proveedor.com',
    phone: '5512345678',
    providerContactName: 'Contacto Principal',
  };

  it('acepta proveedor válido sin campos opcionales', () => {
    expect(providerSchema.safeParse(validProvider).success).toBe(true);
  });

  it('acepta campos opcionales válidos', () => {
    const result = providerSchema.safeParse({
      ...validProvider,
      depositPercentage: 30,
      finalPaymentDaysBefore: 7,
      profitPercentage: 15.5,
      active: true,
    });
    expect(result.success).toBe(true);
  });

  it('rechaza depositPercentage mayor a 100', () => {
    const result = providerSchema.safeParse({ ...validProvider, depositPercentage: 150 });
    expect(result.success).toBe(false);
  });

  it('rechaza acrónimo demasiado largo', () => {
    const result = providerSchema.safeParse({ ...validProvider, acronym: 'ACRONIMO_LARGO' });
    expect(result.success).toBe(false);
  });

  it('rechaza teléfono corto', () => {
    const result = providerSchema.safeParse({ ...validProvider, phone: '123' });
    expect(result.success).toBe(false);
  });
});

describe('clientSchema', () => {
  const validClient = {
    name: 'Juan',
    lastName: 'Pérez',
    phone: '5512345678',
  };

  it('acepta cliente con solo campos requeridos', () => {
    expect(clientSchema.safeParse(validClient).success).toBe(true);
  });

  it('acepta campos opcionales vacíos', () => {
    const result = clientSchema.safeParse({
      ...validClient,
      address: '',
      email: '',
      birthDate: '',
    });
    expect(result.success).toBe(true);
  });

  it('rechaza email opcional inválido cuando se proporciona', () => {
    const result = clientSchema.safeParse({ ...validClient, email: 'invalido' });
    expect(result.success).toBe(false);
  });

  it('rechaza nombre corto', () => {
    const result = clientSchema.safeParse({ ...validClient, name: 'J' });
    expect(result.success).toBe(false);
  });
});
