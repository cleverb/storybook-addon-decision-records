export default {
  branches: ['main'],
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        releaseRules: [
          { breaking: true, release: 'major' },
          { type: 'feat', release: 'minor' },
          { type: 'docs', release: 'patch' },
          { type: 'refactor', release: 'patch' },
          { type: 'fix', release: 'patch' },
        ],
        parserOpts: {
          noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES'],
        },
      },
    ],
    '@semantic-release/release-notes-generator',
    '@semantic-release/github',
    [
      '@semantic-release/npm',
      {
        // Provenance requires OIDC (e.g. GitHub Actions with id-token: write).
        // Do not set publishConfig.provenance — it breaks local and other non-OIDC publishes (e.g. auto canary).
        npmPublishArgs: ['--provenance'],
      },
    ],
  ],
}
