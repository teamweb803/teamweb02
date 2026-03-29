import { API_BASE_URL, apiClient, apiRequest } from './apiClient';

function normalizeConfig(config = {}) {
  return {
    ...config,
    query: config.query ?? config.params,
  };
}

const httpRequester = {
  get(path, config = {}) {
    return apiRequest(path, {
      method: 'GET',
      ...normalizeConfig(config),
    });
  },
  post(path, body, config = {}) {
    return apiRequest(path, {
      method: 'POST',
      body,
      ...normalizeConfig(config),
    });
  },
  put(path, body, config = {}) {
    return apiRequest(path, {
      method: 'PUT',
      body,
      ...normalizeConfig(config),
    });
  },
  patch(path, body, config = {}) {
    return apiRequest(path, {
      method: 'PATCH',
      body,
      ...normalizeConfig(config),
    });
  },
  delete(path, config = {}) {
    return apiRequest(path, {
      method: 'DELETE',
      ...normalizeConfig(config),
    });
  },
};

export default httpRequester;
export { API_BASE_URL, apiClient, apiRequest };
