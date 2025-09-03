/**
 * TKA Services - Tab-First Architecture
 *
 * Main export point for all TKA services organized by application tabs.
 * Each tab contains its own contracts and implementations.
 *
 * This file re-exports everything to maintain backward compatibility
 * with the $services alias pattern.
 */

export * from "./animator";

export * from "./browse";

export * from "./build";

export * from "./learn";

export * from "./word-card";

export * from "./core";

export * from "./inversify";
