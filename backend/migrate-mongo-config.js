// use 'migrate-mongo create {$migration_name}' or 'docker exec -ti nodejs-container ./node_modules/.bin/migrate-mongo create {$migration_name}' for creating migration
// use 'docker exec -ti nodejs-container ./node_modules/.bin/migrate-mongo up' for applying migration

const config = require('./src/config/config');
const configMigrations = {
    mongodb: {
        url: config.db.dbUrl,
        databaseName: config.db.dbName,
        options: {}
    },
    moduleSystem: 'commonjs',
    migrationsDir: "migrations",
    changelogCollectionName: "migrations",
    migrationFileExtension: ".js",
    useFileHash: false
};
module.exports = configMigrations;
