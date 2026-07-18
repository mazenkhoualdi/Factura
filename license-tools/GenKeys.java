import java.io.FileOutputStream;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.util.Base64;

/**
 * Genere une paire de cles RSA-2048 pour le systeme de licence de Factura.
 *
 * A executer UNE SEULE FOIS (ou a chaque fois que vous voulez repartir sur
 * une nouvelle paire de cles, ce qui invaliderait toutes les licences deja
 * emises avec l'ancienne cle).
 *
 * Usage :
 *   javac GenKeys.java
 *   java GenKeys
 *
 * Produit deux fichiers :
 *   - private_key.pem  -> SECRET. Ne le partagez JAMAIS, ne le mettez JAMAIS
 *                         dans le zip envoye au client, ne le commitez JAMAIS
 *                         dans un depot Git. Conservez-le en lieu sur (gestionnaire
 *                         de mots de passe, coffre-fort numerique...).
 *                         C'est la seule chose qui vous permet d'emettre de
 *                         nouvelles licences.
 *   - public_key.pem   -> A copier dans
 *                         factura/backend/src/main/resources/license_public_key.pem
 *                         puis a re-builder l'application (build-all.bat).
 *                         Cette cle est sans danger a distribuer : elle sert
 *                         uniquement a VERIFIER une signature, pas a en creer.
 */
public class GenKeys {
    public static void main(String[] args) throws Exception {
        KeyPairGenerator gen = KeyPairGenerator.getInstance("RSA");
        gen.initialize(2048);
        KeyPair pair = gen.generateKeyPair();

        writePem("private_key.pem", "PRIVATE KEY", pair.getPrivate().getEncoded());
        writePem("public_key.pem", "PUBLIC KEY", pair.getPublic().getEncoded());

        System.out.println("Cles generees :");
        System.out.println("  - private_key.pem  (SECRET, a conserver precieusement, jamais distribue)");
        System.out.println("  - public_key.pem    (a copier dans le backend, sans danger a partager)");
    }

    private static void writePem(String filename, String label, byte[] derBytes) throws Exception {
        String base64 = Base64.getEncoder().encodeToString(derBytes);
        StringBuilder pem = new StringBuilder();
        pem.append("-----BEGIN ").append(label).append("-----\n");
        for (int i = 0; i < base64.length(); i += 64) {
            pem.append(base64, i, Math.min(i + 64, base64.length())).append("\n");
        }
        pem.append("-----END ").append(label).append("-----\n");
        try (FileOutputStream out = new FileOutputStream(filename)) {
            out.write(pem.toString().getBytes("UTF-8"));
        }
    }
}
