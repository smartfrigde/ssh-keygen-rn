import { NativeModule, requireNativeModule } from 'expo';

import { genKeyPairProps, SshKeygenRnModuleEvents } from './SshKeygenRn.types';

declare class SshKeygenRnModule extends NativeModule<SshKeygenRnModuleEvents> {
  generateKeyPair(options: genKeyPairProps): Promise<{ privateKey: string; publicKey: string }>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<SshKeygenRnModule>('SshKeygenRn');
