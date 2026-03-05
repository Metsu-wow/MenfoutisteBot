-- Migration number: 0001 	 2026-03-04

-- Create Users table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    discord_id VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL
);

-- Create Versions table
CREATE TABLE versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    version VARCHAR(100) NOT NULL,
    discord_channel_id VARCHAR(100) NOT NULL,
    discord_message_id VARCHAR(100) NOT NULL,
    CONSTRAINT uc_version UNIQUE (version, discord_channel_id, discord_message_id)
);

-- Create Professions table
CREATE TABLE professions (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    name VARCHAR(100) NOT NULL
);

-- Create Specialization table
CREATE TABLE specializations (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    profession_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    FOREIGN KEY (profession_id) REFERENCES professions(id) ON DELETE CASCADE
);

-- Create Users_professions table
CREATE TABLE users_professions_specializations (
    user_id INTEGER NOT NULL,
    profession_id INTEGER NOT NULL,
    specialization_id INTEGER,
    version_id INTEGER NOT NULL,
    comment VARCHAR(100),
    PRIMARY KEY (user_id, profession_id, specialization_id, version_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (profession_id) REFERENCES professions(id) ON DELETE CASCADE,
    FOREIGN KEY (specialization_id) REFERENCES specializations(id) ON DELETE CASCADE,
    FOREIGN KEY (version_id) REFERENCES versions(id) ON DELETE CASCADE
);