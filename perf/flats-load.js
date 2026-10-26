import http from 'k6/http';
import { check, sleep } from 'k6';

const baseUrl = __ENV.BASE_URL || 'http://localhost:5176';
const baseline = __ENV.MODE === 'baseline';
const mixedPages = __ENV.PAGES === 'mixed';
const thinkTime = Number(__ENV.THINK_TIME || '1');

export const options = {
  vus: Number(__ENV.VUS || '100'),
  duration: __ENV.DURATION || '5m',
  discardResponseBodies: true,
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
    checks: ['rate>0.99'],
  },
};

export default function () {
  // 10,000 properties / 50 per page = 200 pages.
  const page = mixedPages
    ? 1 + Math.floor(Math.random() * 200)
    : 1;

  const path = baseline
    ? '/api/Flats'
    : `/api/Flats?page=${page}&pageSize=50`;

  const response = http.get(`${baseUrl}${path}`, {
    tags: { name: 'GET /api/Flats' },
    timeout: '30s',
  });

  check(response, {
    'returns HTTP 200': (r) => r.status === 200,
  });

  if (thinkTime > 0) {
    sleep(thinkTime);
  }
}