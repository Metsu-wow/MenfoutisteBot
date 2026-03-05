import { env } from "cloudflare:workers";

// Access environment variables at the top level
const DB = env.DB;


/**
 * USERS
 */

export async function deleteAllUsers() {
    const results = await sqlRequest(`DELETE FROM users`);
}

export async function findUserByDiscordId(discordId) {
    const { results } = await sqlRequest(`SELECT * FROM users WHERE discord_id = ?`, discordId);
    return results;
}

export async function createUser(discordId, name) {
    const { meta } = await sqlRequest(`INSERT INTO users (discord_id, name) VALUES (?, ?)`, discordId, name);

    const id = meta.last_row_id

    if (isNaN(id) || id == 0) {
        throw new Error('Cannot create user');
    }
        
    return id;
}

export async function findProfessionsAndSpecializationsByUsersByVersion(versionId) {
    const { results } = await sqlRequest(
        `SELECT users.id as user_id, users.discord_id as user_discord_id, users.name as user_name, professions.id as profession_id, professions.name as profession_name, specializations.id as specialization_id, specializations.name as specialization_name
        FROM users_professions_specializations
        LEFT JOIN users ON users_professions_specializations.user_id = users.id
        LEFT JOIN professions ON users_professions_specializations.profession_id = professions.id
        LEFT JOIN specializations ON users_professions_specializations.specialization_id = specializations.id
        LEFT JOIN versions ON users_professions_specializations.version_id = versions.id
        WHERE versions.id = ?
        `, versionId
    );
    return results;
}

export async function deleteProfessionAndSpecializationFromUser(userId, professionId, versionId) {
    const { meta } = await sqlRequest(`DELETE FROM users_professions_specializations WHERE user_id = ? AND profession_id = ? AND version_id = ?`, userId, professionId, versionId);
    return meta;
}

export async function addProfessionAndSpecializationToUser(userId, professionId, specializationId, versionId) {
    const { meta } = await sqlRequest(`INSERT INTO users_professions_specializations (user_id, profession_id, specialization_id, version_id) VALUES (?, ?, ?, ?)`, userId, professionId, specializationId, versionId);

    const id = meta.last_row_id

    if (isNaN(id) || id == 0) {
        throw new Error('Cannot add profession to user');
    }
        
    return id;
}

export async function deleteAllData() {
    const results = await sqlRequest(`DELETE FROM users_professions_specializations`);
}

/**
 * PROFESSIONS
 */

export async function findAllProfesssions() {
    const { results } = await sqlRequest(`SELECT * FROM professions`);
    return results;
}

/**
 * SPECIALIZATIONS
 */

export async function findAllSpecializationsByProfessionId(professionId) {
    const { results } = await sqlRequest(`SELECT * FROM specializations WHERE profession_id = ?`, professionId);
    return results;
}

/**
 * VERSIONS
 */

 export async function deleteAllVersions() {
    const results = await sqlRequest(`DELETE FROM versions`);
}

export async function createVersion(version, discordChannelId, discordMessageId) {
    const { meta } = await sqlRequest(`INSERT INTO versions (version, discord_channel_id, discord_message_id) VALUES (?, ?, ?)`, version, discordChannelId, discordMessageId);
    
    const id = meta.last_row_id

    if (isNaN(id) || id == 0) {
        throw new Error('Cannot add version');
    }
        
    return id;
}

export async function findLastVersion(discordChannelId) {
    const { results } = await sqlRequest(`SELECT * FROM versions WHERE discord_channel_id = ? ORDER BY id DESC LIMIT 1`, discordChannelId);
    return results[0];
}

async function sqlRequest(query, ...params) {
    try {
        return await DB.prepare(query).bind(...params).run();
    } catch (error) {
        console.error(error)
    }   
}