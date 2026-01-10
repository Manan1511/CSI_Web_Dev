import dotenv from 'dotenv';
import path from 'path';
import pg from 'pg';

// Load env
dotenv.config({ path: path.join(__dirname, '../../.env') });

const url = process.env.DATABASE_URL;

console.log('--- Debugging Connection String ---');
if (!url) {
    console.error('ERROR: DATABASE_URL is undefined.');
} else {
    try {
        // Simple manual parse to avoid logging password if possible, 
        // or just use pg's parser
        const masked = url.replace(/:([^:@]+)@/, ':****@');
        console.log(`Loaded DATABASE_URL: ${masked}`);

        // Parse with regex to see how it splits
        // standard format: protocol://user:pass@host:port/db
        const match = url.match(/^(postgres(?:ql)?):\/\/([^:]+):([^@]+)@([^:/]+)(?::(\d+))?\/(.+)$/);
        if (match) {
            console.log(`Protocol: ${match[1]}`);
            console.log(`User: ${match[2]}`);
            // console.log(`Password: ${match[3]}`); // Don't log
            console.log(`Host: ${match[4]}`);
            console.log(`Port: ${match[5]}`);
            console.log(`Database: ${match[6]}`);
        } else {
            console.log('WARNING: Regex parsification failed. URL might be malformed.');
        }

    } catch (e) {
        console.error('Error parsing URL:', e);
    }
}
console.log('---------------------------------');
