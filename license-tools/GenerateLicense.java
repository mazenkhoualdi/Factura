import java.io.FileOutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.Signature;
import java.security.spec.PKCS8EncodedKeySpec;
import java.time.LocalDate;
import java.util.Base64;

/**
 * Emet un fichier license.lic signe, a copier chez le client pour
 * activer/renouveler l'application (dans %AppData%\Factura\license.lic
 * sur le poste du client).
 *
 * Usage :
 *   javac GenerateLicense.java
 *   java GenerateLicense "Nom du client" 2027-01-31
 *
 * Necessite private_key.pem dans le meme dossier (genere par GenKeys.java).
 * Produit license.lic dans le dossier courant.
 */
public class GenerateLicense {
    public static void main(String[] args) throws Exception {
        if (args.length < 2) {
            System.out.println("Usage : java GenerateLicense \"Nom du client\" AAAA-MM-JJ");
            System.out.println("Exemple : java GenerateLicense \"SOTUSION\" 2027-01-31");
            return;
        }
        String licensee = args[0];
        String validUntil = args[1];
        LocalDate.parse(validUntil); // valide le format, leve une exception sinon
        String issuedAt = LocalDate.now().toString();

        PrivateKey privateKey = loadPrivateKey("private_key.pem");

        String signedText = "licensee=" + licensee + "\n"
                           + "validUntil=" + validUntil + "\n"
                           + "issuedAt=" + issuedAt;

        Signature sig = Signature.getInstance("SHA256withRSA");
        sig.initSign(privateKey);
        sig.update(signedText.getBytes(StandardCharsets.UTF_8));
        String signatureB64 = Base64.getEncoder().encodeToString(sig.sign());

        String fileContent = signedText + "\nsignature=" + signatureB64 + "\n";

        try (FileOutputStream out = new FileOutputStream("license.lic")) {
            out.write(fileContent.getBytes(StandardCharsets.UTF_8));
        }

        System.out.println("license.lic genere avec succes :");
        System.out.println("  Client       : " + licensee);
        System.out.println("  Valide jusqu'au : " + validUntil);
        System.out.println();
        System.out.println("Copiez ce fichier chez le client dans :");
        System.out.println("  %AppData%\\Factura\\license.lic");
        System.out.println("(remplacer l'ancien fichier si present, puis relancer Factura)");
    }

    private static PrivateKey loadPrivateKey(String filename) throws Exception {
        String pem = Files.readString(Path.of(filename), StandardCharsets.UTF_8);
        String base64 = pem
                .replace("-----BEGIN PRIVATE KEY-----", "")
                .replace("-----END PRIVATE KEY-----", "")
                .replaceAll("\\s", "");
        byte[] keyBytes = Base64.getDecoder().decode(base64);
        KeyFactory kf = KeyFactory.getInstance("RSA");
        return kf.generatePrivate(new PKCS8EncodedKeySpec(keyBytes));
    }
}
