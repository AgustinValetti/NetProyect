import bcrypt from 'bcryptjs';

async function testBcrypt() {
    const password = "tomson33"; // La contraseña en texto plano
    const saltRounds = 10;

    console.log("🔹 Generando hash de la contraseña...");
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log("✅ Hash generado:", hashedPassword);

    console.log("🔹 Comparando la contraseña con el hash...");
    const isMatch = await bcrypt.compare(password, hashedPassword);
    console.log("✅ ¿Coincide la contraseña?", isMatch);
}

testBcrypt();
