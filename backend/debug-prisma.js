const { execSync } = require('child_process');
try {
    const result = execSync('npx prisma validate', { encoding: 'utf8' });
    console.log('SUCCESS:', result);
} catch (error) {
    console.log('STDOUT:', error.stdout);
    console.log('STDERR:', error.stderr);
}
