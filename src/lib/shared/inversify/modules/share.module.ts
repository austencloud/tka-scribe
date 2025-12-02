/**
 * Share Module - InversifyJS Container Module
 *
 * Binds share services for dependency injection.
 */

import type { ContainerModuleLoadOptions } from "inversify";
import { ContainerModule } from "inversify";
import { ShareService } from '../../share/services/implementations/ShareService';
import { InstagramLinkService } from '../../share/services/implementations/InstagramLinkService';
import { MediaBundlerService } from '../../share/services/implementations/MediaBundlerService';
import { TYPES } from "../types";

export const shareModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    // === SHARE SERVICES ===
    options.bind(TYPES.IShareService).to(ShareService);
    options.bind(TYPES.IInstagramLinkService).to(InstagramLinkService);
    options.bind(TYPES.IMediaBundlerService).to(MediaBundlerService);
    // TODO: Add when ready:
    // options.bind(TYPES.IFirebaseVideoUploadService).to(FirebaseVideoUploadService);
    // options.bind(TYPES.IShareToInstagramService).to(ShareToInstagramService);
  }
);
