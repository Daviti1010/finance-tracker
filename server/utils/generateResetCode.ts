export function generateRandom6DigitCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}