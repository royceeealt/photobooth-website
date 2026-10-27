const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

async function request(path, { method = "GET", body, headers = {} } = {}) {
  const token =
    localStorage.getItem("auth_token") ||
    localStorage.getItem("token");

  let response;

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new Error(
      "Unable to connect to the server. Check that the backend is running."
    );
  }

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      data.error || data.message || `Request failed (${response.status})`
    );

    error.status = response.status;

    throw error;
  }

  return data;
}

export const api = {
  get: (path) => request(path),

  post: (path, body) =>
    request(path, {
      method: "POST",
      body,
    }),

  put: (path, body) =>
    request(path, {
      method: "PUT",
      body,
    }),

  delete: (path) =>
    request(path, {
      method: "DELETE",
    }),
};