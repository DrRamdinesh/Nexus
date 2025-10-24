import type { ToolConfiguration, UserProfile, AlertConfiguration } from '../types';

const STORAGE_KEYS = {
    USER: 'nexus_user',
    TOOL_CONFIGS: 'nexus_tool_configs',
    USER_PROFILES: 'nexus_user_profiles',
    ALERT_CONFIG: 'nexus_alert_config',
};

// --- User Session Management ---

export const saveUser = (username: string): void => {
    try {
        localStorage.setItem(STORAGE_KEYS.USER, username);
    } catch (error) {
        console.error("Failed to save user to localStorage", error);
    }
};

export const loadUser = (): string | null => {
    try {
        return localStorage.getItem(STORAGE_KEYS.USER);
    } catch (error) {
        console.error("Failed to load user from localStorage", error);
        return null;
    }
};

export const clearUser = (): void => {
    try {
        localStorage.removeItem(STORAGE_KEYS.USER);
    } catch (error) {
        console.error("Failed to clear user from localStorage", error);
    }
};

// --- Tool Configuration Management ---

export const saveToolConfigurations = (configurations: ToolConfiguration[]): void => {
    try {
        const serializedConfigs = JSON.stringify(configurations);
        localStorage.setItem(STORAGE_KEYS.TOOL_CONFIGS, serializedConfigs);
    } catch (error) {
        console.error("Failed to save tool configurations to localStorage", error);
    }
};

export const loadToolConfigurations = (): ToolConfiguration[] | null => {
    try {
        const serializedConfigs = localStorage.getItem(STORAGE_KEYS.TOOL_CONFIGS);
        if (serializedConfigs === null) {
            return null;
        }
        // A simple reviver could be added here to parse dates if needed in the future
        return JSON.parse(serializedConfigs);
    } catch (error) {
        console.error("Failed to load tool configurations from localStorage", error);
        return null;
    }
};

// --- User Profile Management ---

const loadAllUserProfiles = (): { [username: string]: UserProfile } => {
    try {
        const serialized = localStorage.getItem(STORAGE_KEYS.USER_PROFILES);
        return serialized ? JSON.parse(serialized) : {};
    } catch {
        return {};
    }
}

export const saveUserProfile = (profile: UserProfile): void => {
    try {
        const profiles = loadAllUserProfiles();
        profiles[profile.username] = profile;
        localStorage.setItem(STORAGE_KEYS.USER_PROFILES, JSON.stringify(profiles));
    } catch (error) {
        console.error("Failed to save user profile", error);
    }
};

export const loadUserProfile = (username: string): UserProfile | null => {
    try {
        const profiles = loadAllUserProfiles();
        return profiles[username] || { username };
    } catch (error) {
        console.error("Failed to load user profile", error);
        return { username };
    }
};

// --- Alert Configuration Management ---

export const saveAlertConfiguration = (config: AlertConfiguration): void => {
    try {
        localStorage.setItem(STORAGE_KEYS.ALERT_CONFIG, JSON.stringify(config));
    } catch (error) {
        console.error("Failed to save alert configuration to localStorage", error);
    }
};

export const loadAlertConfiguration = (): AlertConfiguration | null => {
    try {
        const serialized = localStorage.getItem(STORAGE_KEYS.ALERT_CONFIG);
        return serialized ? JSON.parse(serialized) : null;
    } catch (error) {
        console.error("Failed to load alert configuration from localStorage", error);
        return null;
    }
};
