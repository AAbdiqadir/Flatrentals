// Local browser verification only. Never imported by, or shipped with, the app.
import http from 'node:http';
const people = {
  Tenant: { id: 'tenant-amina', fullName: 'Amina Hassan', email: 'amina@flatmail.test', role: 'Tenant' },
  Owner: { id: 'owner-daniel', fullName: 'Daniel Mwangi', email: 'daniel@flatmail.test', role: 'Owner' },
  Admin: { id: 'admin-nadia', fullName: 'Nadia Yusuf', email: 'nadia@flatmail.test', role: 'Admin' },
};
const flats = [
  { id: 1, address: 'Parklands Court, Apartment 4B', city: 'Nairobi', description: 'A bright two-bedroom flat.', rentPrice: 650, rooms: 2, bathrooms: 2, images: [], ownerId: 'owner-daniel', ownerName: 'Daniel Mwangi', createdAt: '2026-10-01T09:00:00Z', isAvailable: true },
  { id: 2, address: 'Garden View, Apartment 12', city: 'Nairobi', description: 'A quiet one-bedroom apartment.', rentPrice: 420, rooms: 1, bathrooms: 1, images: [], ownerId: 'owner-daniel', ownerName: 'Daniel Mwangi', createdAt: '2026-10-04T09:00:00Z', isAvailable: false },
  { id: 3, address: 'Riverside Residences, Apartment 8', city: 'Nairobi', description: 'A spacious three-bedroom flat.', rentPrice: 950, rooms: 3, bathrooms: 2, images: [], ownerId: 'owner-daniel', ownerName: 'Daniel Mwangi', createdAt: '2026-10-12T09:00:00Z', isAvailable: true },
];
let bookings = [
  { id: 1, flatId: 1, flatAddress: flats[0].address, tenantId: 'tenant-amina', tenantName: 'Amina Hassan', startDate: '2026-11-01', endDate: '2027-04-30', status: 'Pending', paymentReference: 'RENT-1042', createdAt: '2026-10-22T09:00:00Z' },
  { id: 2, flatId: 2, flatAddress: flats[1].address, tenantId: 'tenant-samuel', tenantName: 'Samuel Otieno', startDate: '2026-10-01', endDate: '2027-03-31', status: 'Approved', paymentReference: 'RENT-1038', createdAt: '2026-09-22T09:00:00Z' },
  { id: 3, flatId: 3, flatAddress: flats[2].address, tenantId: 'tenant-amina', tenantName: 'Amina Hassan', startDate: '2026-12-01', endDate: '2027-05-31', status: 'Rejected', paymentReference: 'RENT-1040', createdAt: '2026-10-20T09:00:00Z' },
];
let users = [...Object.values(people), { id: 'tenant-samuel', fullName: 'Samuel Otieno', email: 'samuel@flatmail.test', role: 'Tenant' }];
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1:4300');
  if (!url.pathname.startsWith('/api/')) {
    const proxy = http.request({ hostname: '127.0.0.1', port: 4200, path: req.url, method: req.method, headers: { ...req.headers, host: '127.0.0.1:4200' } }, upstream => {
      res.writeHead(upstream.statusCode, upstream.headers);
      upstream.pipe(res);
    });
    proxy.on('error', () => { res.writeHead(502); res.end('Angular preview unavailable'); });
    req.pipe(proxy);
    return;
  }
  const ref = new URL(req.headers.referer || 'http://127.0.0.1:4300/tenant/dashboard');
  const role = ref.pathname.startsWith('/admin') ? 'Admin' : ref.pathname.startsWith('/owner') ? 'Owner' : 'Tenant';
  const scenario = ref.searchParams.get('scenario');
  const send = (data, status = 200) => { res.writeHead(status, { 'content-type': 'application/json', 'cache-control': 'no-store' }); res.end(JSON.stringify(data)); };
  if (scenario === 'loading') await new Promise(resolve => setTimeout(resolve, 4000));
  if (scenario === 'error' && !url.pathname.startsWith('/api/auth/')) return send({ message: 'Preview connection interrupted.' }, 503);
  const body = await new Promise(resolve => { let raw = ''; req.on('data', c => raw += c); req.on('end', () => { try { resolve(JSON.parse(raw || '{}')); } catch { resolve({}); } }); });
  const me = people[role];
  const empty = scenario === 'empty';
  const visibleBookings = empty ? [] : role === 'Tenant' ? bookings.filter(b => b.tenantId === me.id) : bookings;
  if (url.pathname === '/api/auth/refresh') return send({ ...me, userId: me.id, token: 'browser-fixture-only', expiresAt: '2099-01-01T00:00:00Z' });
  if (url.pathname === '/api/auth/logout') return send({});
  if (url.pathname === '/api/users/me') {
    if (req.method === 'PUT') {
      if (body.email === 'taken@flatmail.test') return send(['This email address is already in use.'], 400);
      Object.assign(me, body);
    }
    return send(me);
  }
  if (url.pathname === '/api/dashboard/tenant') return send({ listingsCount: empty ? 0 : flats.filter(f => f.isAvailable).length, bookingsCount: visibleBookings.length, messagesCount: 0 });
  if (url.pathname === '/api/dashboard/owner') return send({ myFlatsCount: empty ? 0 : flats.length, bookingRequestsCount: visibleBookings.length, messagesCount: 0 });
  if (url.pathname === '/api/dashboard/admin') return send({ usersCount: empty ? 0 : users.length, flatsCount: empty ? 0 : flats.length, bookingsCount: visibleBookings.length, messagesCount: 0 });
  if (/^\/api\/bookings\/\d+\/status$/.test(url.pathname)) {
    const b = bookings.find(b => b.id === Number(url.pathname.split('/')[3]));
    if (b) b.status = body.status;
    return send(b);
  }
  if (/^\/api\/bookings\/\d+$/.test(url.pathname) && req.method === 'DELETE') {
    bookings = bookings.filter(b => b.id !== Number(url.pathname.split('/')[3]));
    return send({});
  }
  if (url.pathname === '/api/bookings') return send(visibleBookings);
  if (/^\/api\/flats\/\d+$/.test(url.pathname) && req.method === 'DELETE') {
    const i = flats.findIndex(f => f.id === Number(url.pathname.split('/')[3]));
    if (i !== -1) flats.splice(i, 1);
    return send({});
  }
  if (url.pathname === '/api/flats' || url.pathname === '/api/flats/my') return send(empty ? [] : flats);
  if (/^\/api\/users\/[^/]+$/.test(url.pathname)) {
    const id = url.pathname.split('/')[3];
    if (req.method === 'DELETE') users = users.filter(u => u.id !== id);
    if (req.method === 'PUT') Object.assign(users.find(u => u.id === id) || {}, body);
    return send(users.find(u => u.id === id) || {});
  }
  if (url.pathname === '/api/users') return send(empty ? [] : users);
  return send([]);
});
server.listen(4300, '127.0.0.1', () => console.log('Fixture preview: http://127.0.0.1:4300/tenant/dashboard'));
