import { registerWebModule, NativeModule } from 'expo';

import { genKeyPairProps, SshKeygenRnModuleEvents } from './SshKeygenRn.types';
import { generateKeyPair } from './web';

class SshKeygenRnModule extends NativeModule<SshKeygenRnModuleEvents> {
  PI = Math.PI;
  async generateKeyPair(options: genKeyPairProps): Promise<{ privateKey: string; publicKey: string }>{
    return generateKeyPair(options)
  }
}

export default registerWebModule(SshKeygenRnModule, 'SshKeygenRnModule');
