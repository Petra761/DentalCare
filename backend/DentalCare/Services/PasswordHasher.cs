using System;
using System.Security.Cryptography;

namespace DentalCare.Services
{
    public static class PasswordHasher
    {
        private const int SaltSize = 16; // 128 bit
        private const int KeySize = 32;  // 256 bit
        private const int Iterations = 100000; // Secure number of iterations
        private static readonly HashAlgorithmName HashAlgorithm = HashAlgorithmName.SHA256;

        public static string Hash(string password)
        {
            using (var algorithm = new Rfc2898DeriveBytes(
                password,
                SaltSize,
                Iterations,
                HashAlgorithm))
            {
                byte[] key = algorithm.GetBytes(KeySize);
                byte[] salt = algorithm.Salt;

                byte[] hashBytes = new byte[SaltSize + KeySize];
                Array.Copy(salt, 0, hashBytes, 0, SaltSize);
                Array.Copy(key, 0, hashBytes, SaltSize, KeySize);

                return Convert.ToBase64String(hashBytes);
            }
        }

        public static bool Verify(string password, string hashedPassword)
        {
            try
            {
                byte[] hashBytes = Convert.FromBase64String(hashedPassword);

                byte[] salt = new byte[SaltSize];
                Array.Copy(hashBytes, 0, salt, 0, SaltSize);

                using (var algorithm = new Rfc2898DeriveBytes(
                    password,
                    salt,
                    Iterations,
                    HashAlgorithm))
                {
                    byte[] key = algorithm.GetBytes(KeySize);

                    // Constant-time comparison to prevent timing attacks
                    int diff = 0;
                    for (int i = 0; i < KeySize; i++)
                    {
                        diff |= hashBytes[i + SaltSize] ^ key[i];
                    }
                    return diff == 0;
                }
            }
            catch
            {
                return false;
            }
        }
    }
}
