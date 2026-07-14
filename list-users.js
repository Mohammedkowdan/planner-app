const { PrismaClient } = require('./generated/prisma/index.js');
const p = new PrismaClient();
p.user.findMany({
  select: {
    name: true,
    email: true,
    role: true,
    organizationId: true,
    organizationName: true,
    departmentId: true,
    departmentName: true
  }
}).then(users => {
  console.log(JSON.stringify(users, null, 2));
}).catch(e => {
  console.error(e);
}).finally(() => {
  p.$disconnect();
});
