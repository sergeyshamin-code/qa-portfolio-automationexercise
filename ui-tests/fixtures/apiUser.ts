/**
 * Creates and deletes throwaway user accounts via the AutomationExercise API
 * (the same `createAccount`/`deleteAccount` endpoints covered by the Postman
 * suite in api-tests/). Used to set up a real, logged-in-capable account for
 * UI tests that need one (e.g. "login before checkout"), without relying on
 * a fixed, persistent account or leaving test data behind on the public site.
 */

export interface ApiUser {
  name: string;
  email: string;
  password: string;
}

export async function createApiUser(baseURL: string): Promise<ApiUser> {
  const user: ApiUser = {
    name: 'QA Portfolio User',
    email: `ae_ui_${Date.now()}@example.com`,
    password: 'Test@12345',
  };

  const body = new URLSearchParams({
    name: user.name,
    email: user.email,
    password: user.password,
    title: 'Mr',
    birth_date: '1',
    birth_month: 'January',
    birth_year: '1990',
    firstname: 'Test',
    lastname: 'User',
    company: 'QA Portfolio',
    address1: '1 Test Street',
    address2: '',
    country: 'Poland',
    zipcode: '15-888',
    state: 'Podlaskie',
    city: 'Bialystok',
    mobile_number: '123456789',
  });

  const response = await fetch(`${baseURL}/api/createAccount`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const json = await response.json();
  if (json.responseCode !== 201) {
    throw new Error(`createApiUser failed: ${JSON.stringify(json)}`);
  }
  return user;
}

/** Best-effort cleanup: never throws, so a failed test still finishes teardown. */
export async function deleteApiUser(baseURL: string, user: Pick<ApiUser, 'email' | 'password'>): Promise<void> {
  try {
    const body = new URLSearchParams({ email: user.email, password: user.password });
    await fetch(`${baseURL}/api/deleteAccount`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
  } catch (error) {
    console.warn(`deleteApiUser: cleanup failed for ${user.email}:`, error);
  }
}
