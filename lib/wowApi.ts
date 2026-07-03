const API_BASE_URL = 'https://now-in-google-backend-1010379975924.asia-south1.run.app/nowingoogle-backend';
const API_VERSION = '2.0.0';

export interface WowSession {
  id: string;
  experience_id: string;
  name: string;
  amount: number;
  session_status: 'PENDING' | 'SUCCESS';
  user_id: string | null;
  photo_urls: string[];
}

/**
 * Creates a new experience payment request session.
 */
export async function createExperienceSession(experience_id: string, name: string, amount: number = 0): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/wallet/experience/request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-version': API_VERSION,
    },
    body: JSON.stringify({ experience_id, name, amount }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create session: ${response.statusText}`);
  }

  const data = await response.json();
  if (!data.status || !data.session_id) {
    throw new Error('Invalid response from create session API');
  }

  return data.session_id;
}

/**
 * Polls the payment status of the session.
 */
export async function pollSessionStatus(session_id: string): Promise<WowSession> {
  const response = await fetch(`${API_BASE_URL}/api/wallet/experience/status/${session_id}`, {
    method: 'GET',
    headers: {
      'x-api-version': API_VERSION,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to poll session status: ${response.statusText}`);
  }

  const data = await response.json();
  if (!data.status || !data.data) {
    throw new Error('Invalid response from poll session API');
  }

  return data.data as WowSession;
}

/**
 * Completes the experience and awards points to the user.
 */
export async function completeExperience(session_id: string, points: number): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/api/wallet/experience/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-version': API_VERSION,
    },
    body: JSON.stringify({ session_id, points }),
  });

  if (!response.ok) {
    throw new Error(`Failed to complete experience: ${response.statusText}`);
  }

  const data = await response.json();
  return data.status === true;
}
