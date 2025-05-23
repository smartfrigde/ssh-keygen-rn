package expo.modules.sshkeygenrn

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.net.URL

class SshKeygenRnModule : Module() {
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  override fun definition() = ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('SshKeygenRn')` in JavaScript.
    Name("SshKeygenRn")

    // Defines a JavaScript synchronous function that runs the native code on the JavaScript thread.
    Function("generateKeyPair") { options: String ->
      val kpg: KeyPairGenerator = KeyPairGenerator.getInstance("RSA")
      kpg.initialize(2048)
      val keyPair: KeyPair = kpg.genKeyPair()
      val pri: ByteArray = keyPair.getPrivate().getEncoded()
      val pub: ByteArray = keyPair.getPublic().getEncoded()

      val privateKey: String = String(pri)
      val publicKey: String = String(pub)

      return {privateKey, publicKey}
    }
  }
}
