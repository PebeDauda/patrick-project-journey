import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'niua6aq5',
    dataset: 'production'
  },
  studioHost: 'patrick-project-journey',

  deployment: {
    appId: 'kdxsizlue8ufnptyo20007bk',

    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/studio/latest-version-of-sanity#k47faf43faf56
     */
    autoUpdates: true,
  },
})
