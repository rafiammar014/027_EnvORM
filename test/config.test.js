const assert = require('node:assert/strict');
const test = require('node:test');

test('database config reads PostgreSQL environment variables', () => {
    const originalEnv = {};
    const keys = ['DB_USER', 'DB_PASS', 'DB_PASSWORD', 'DB_NAME', 'DB_DATABASE', 'DB_HOST', 'DB_PORT', 'DB_DIALECT'];
    for (const key of keys) {
        originalEnv[key] = process.env[key];
    }

    Object.assign(process.env, {
        DB_USER: 'test_user',
        DB_PASS: 'test_password',
        DB_NAME: 'test_database',
        DB_HOST: 'localhost',
        DB_PORT: '5433'
    });
    delete process.env.DB_PASSWORD;
    delete process.env.DB_DATABASE;
    delete process.env.DB_DIALECT;

    const configPath = require.resolve('../config/config');
    delete require.cache[configPath];

    try {
        const config = require('../config/config').development;
        assert.deepEqual(config, {
            username: 'test_user',
            password: 'test_password',
            database: 'test_database',
            host: 'localhost',
            port: 5433,
            dialect: 'postgres'
        });
    } finally {
        delete require.cache[configPath];
        for (const key of keys) {
            if (originalEnv[key] === undefined) {
                delete process.env[key];
            } else {
                process.env[key] = originalEnv[key];
            }
        }
    }
});

test('database config accepts legacy environment variable names', () => {
    const originalEnv = {};
    const keys = ['DB_NAME', 'DB_DATABASE', 'DB_PASS', 'DB_PASSWORD'];
    for (const key of keys) {
        originalEnv[key] = process.env[key];
    }

    process.env.DB_NAME = '';
    process.env.DB_DATABASE = 'legacy_database';
    process.env.DB_PASS = '';
    process.env.DB_PASSWORD = 'legacy_password';

    const configPath = require.resolve('../config/config');
    delete require.cache[configPath];

    try {
        const config = require('../config/config').development;
        assert.equal(config.database, 'legacy_database');
        assert.equal(config.password, 'legacy_password');
    } finally {
        delete require.cache[configPath];
        for (const key of keys) {
            if (originalEnv[key] === undefined) {
                delete process.env[key];
            } else {
                process.env[key] = originalEnv[key];
            }
        }
    }
});
