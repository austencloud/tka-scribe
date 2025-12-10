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
import { FirebaseVideoUploadService } from '../../share/services/implementations/FirebaseVideoUploadService';
import { RecordingPersistenceService } from '../../video-record/services/implementations/RecordingPersistenceService';
import { CollaborativeVideoService } from '../../video-collaboration/services/implementations/CollaborativeVideoService';
import { TYPES } from "../types";

export const shareModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    // === SHARE SERVICES ===
    options.bind(TYPES.IShareService).to(ShareService);
    options.bind(TYPES.IInstagramLinkService).to(InstagramLinkService);
    options.bind(TYPES.IMediaBundlerService).to(MediaBundlerService);
    options.bind(TYPES.IFirebaseVideoUploadService).to(FirebaseVideoUploadService);
    options.bind(TYPES.IRecordingPersistenceService).to(RecordingPersistenceService);
    options.bind(TYPES.ICollaborativeVideoService).to(CollaborativeVideoService);
  }
);
