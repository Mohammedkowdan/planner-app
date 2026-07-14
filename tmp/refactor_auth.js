const fs = require('fs');
const path = require('path');

const dir = path.join(process.cwd(), 'actions');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts'));

for (const f of files) {
    const fileP = path.join(dir, f);
    let code = fs.readFileSync(fileP, 'utf-8');
    
    // Replace update
    code = code.replace(/const\s+(\w+)\s*=\s*await\s+prisma\.(\w+)\.update\(\{\s*where:\s*\{\s*id,\s*organizationId:\s*session\.orgId,\s*departmentId:\s*session\.deptId\s*\},\s*data:\s*([\s\S]*?)\n\s*\}\)/g, (match, varName, modelName, dataStr) => {
        return `const existing = await prisma.${modelName}.findFirst({ where: { id, organizationId: session.orgId, departmentId: session.deptId } });
        if (!existing) throw new Error("Unauthorized or not found");
        const ${varName} = await prisma.${modelName}.update({ where: { id }, data: ${dataStr} })`;
    });

    // Replace delete
    code = code.replace(/const\s+(\w+)\s*=\s*await\s+prisma\.(\w+)\.delete\(\{\s*where:\s*\{\s*id,\s*organizationId:\s*session\.orgId,\s*departmentId:\s*session\.deptId\s*\}\,?\s*\}\)/g, (match, varName, modelName) => {
        return `const existing = await prisma.${modelName}.findFirst({ where: { id, organizationId: session.orgId, departmentId: session.deptId } });
        if (!existing) throw new Error("Unauthorized or not found");
        const ${varName} = await prisma.${modelName}.delete({ where: { id } })`;
    });

    // Replace update (only orgId)
    code = code.replace(/const\s+(\w+)\s*=\s*await\s+prisma\.(\w+)\.update\(\{\s*where:\s*\{\s*id,\s*organizationId:\s*session\.orgId\s*\},\s*data:\s*([\s\S]*?)\n\s*\}\)/g, (match, varName, modelName, dataStr) => {
        return `const existing = await prisma.${modelName}.findFirst({ where: { id, organizationId: session.orgId } });
        if (!existing) throw new Error("Unauthorized or not found");
        const ${varName} = await prisma.${modelName}.update({ where: { id }, data: ${dataStr} })`;
    });

    // Replace delete (only orgId)
    code = code.replace(/const\s+(\w+)\s*=\s*await\s+prisma\.(\w+)\.delete\(\{\s*where:\s*\{\s*id,\s*organizationId:\s*session\.orgId\s*\}\,?\s*\}\)/g, (match, varName, modelName) => {
        return `const existing = await prisma.${modelName}.findFirst({ where: { id, organizationId: session.orgId } });
        if (!existing) throw new Error("Unauthorized or not found");
        const ${varName} = await prisma.${modelName}.delete({ where: { id } })`;
    });

    fs.writeFileSync(fileP, code);
}
console.log('Done refactoring');
