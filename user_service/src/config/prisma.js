// const {PrismaClient} = require('@prisma/client');
const { PrismaClient } = require('../generated/prisma');
const {PrismaPg} = require('@prisma/adapter-pg');
const {config} = require('./');
const connectionString = process.env.DATABASE_URL;


const globalForPrisma = global;

if(!globalForPrisma.prisma) {
    const adapter = new PrismaPg({ connectionString });

    globalForPrisma.prisma = new PrismaClient({adapter, log: ['query', 'error', 'warn', 'info']});
}

const prisma = globalForPrisma.prisma;

module.exports = {prisma};