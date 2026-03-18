# Research: Foundation Skills

**Date**: 2026-03-19 | **Branch**: 001-foundation-skills

## R1: AGENTS.md Format
- **Decision**: 5 sections (Project Overview, Directory Structure, Tech Stack, Conventions, Getting Started)
- **Rationale**: Covers what AI agents need to understand a codebase
- **Alternatives**: 3-section minimal — rejected (tech stack detection adds value)

## R2: Script Languages
- **Decision**: Bash for CLI orchestration + Python for structured output/JSON parsing
- **Rationale**: Each language used where it's strongest
- **Alternatives**: Pure Python or Pure Bash — rejected (unnecessary complexity or painful markdown generation)

## R3: Language Detection Method
- **Decision**: File extension + config file scanning via `find`
- **Rationale**: Simple, fast, no external dependencies
- **Alternatives**: GitHub API — rejected (requires API access). cloc — rejected (extra dependency)

## R4: kubectl Output Parsing
- **Decision**: JSON output piped through Python
- **Rationale**: Stable across versions, clean parsing
- **Alternatives**: Text parsing with grep — rejected (fragile)

## R5: Helm Idempotency
- **Decision**: `helm upgrade --install` pattern
- **Rationale**: Handles both fresh install and upgrade
- **Alternatives**: `helm install` with error handling — rejected (more complex)
