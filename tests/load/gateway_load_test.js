import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // ramp up to 20 users
    { duration: '1m', target: 20 },  // stay at 20 users
    { duration: '30s', target: 0 },  // ramp down to 0 users
  ],
};

export default function () {
  const res = http.get('http://localhost:8000/health'); // Assuming gateway is on 8000
  check(res, {
    'is status 200': (r) => r.status === 200,
  });
  sleep(1);
}
