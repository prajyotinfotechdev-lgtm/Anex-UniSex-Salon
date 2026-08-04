import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://anex-api.onrender.com/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'x-organization-id': process.env.NEXT_PUBLIC_ORGANIZATION_ID || '10fdbe22-4c40-4bd6-8266-9a3c49f9ed8b',
  },
});
